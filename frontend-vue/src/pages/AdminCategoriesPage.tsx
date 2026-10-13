import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import { apiFetch } from "../lib/api";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
  parentName?: string;
  sort: number;
  enabled: boolean;
  createdAt: string;
};

type CategoryForm = {
  name: string;
  parentId: string;
  sort: number;
  enabled: boolean;
};

export const AdminCategoriesPage = defineComponent({
  name: "AdminCategoriesPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(false);
    const msg = ref("");
    const msgType = ref<"success" | "error">("success");
    const categories = ref<Category[]>([]);
    const searchQuery = ref("");
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const currentCategory = ref<Category | null>(null);
    const formData = ref<CategoryForm>({
      name: "",
      parentId: "",
      sort: 0,
      enabled: true
    });

    function showMessage(text: string, type: "success" | "error" = "success") {
      msg.value = text;
      msgType.value = type;
    }


    function getAllowedParents(currentId?: number) {
      const result: Category[] = [];
      const visited = new Set<number>();

      function canBeParent(parentId: number): boolean {
        if (visited.has(parentId)) return false;
        visited.add(parentId);
        const parent = categories.value.find(c => c.id === parentId);
        if (!parent || parent.parentId === null) return true;
        return canBeParent(parent.parentId);
      }

      for (const cat of categories.value) {
        if (currentId && cat.id === currentId) continue;
        if (!currentId || canBeParent(cat.id)) {
          result.push(cat);
        }
      }
      return result;
    }

    const allowedParents = computed(() => getAllowedParents(currentCategory.value?.id));

    async function loadCategories() {
      loading.value = true;
      try {
        const data = await apiFetch<Category[]>("/api/admin/categories");
        categories.value = data.map((category: Category) => {
          if (category.parentId) {
            const parent = data.find((c: Category) => c.id === category.parentId);
            if (parent) {
              category.parentName = parent.name;
            }
          }
          return category;
        });
      } catch (e) {
        showMessage(e instanceof Error ? e.message : "加载失败", "error");
      } finally {
        loading.value = false;
      }
    }

    function handleAddCategory() {
      formData.value = {
        name: "",
        parentId: "",
        sort: 0,
        enabled: true
      };
      currentCategory.value = null;
      msg.value = "";
      showAddModal.value = true;
    }

    function handleEditCategory(category: Category) {
      formData.value = {
        name: category.name,
        parentId: category.parentId?.toString() || "",
        sort: category.sort,
        enabled: category.enabled
      };
      currentCategory.value = category;
      msg.value = "";
      showEditModal.value = true;
    }

    async function handleSaveCategory() {
      if (!formData.value.name.trim()) {
        showMessage("请输入分类名称", "error");
        return;
      }
      if (formData.value.name.trim().length > 20) {
        showMessage("分类名称不能超过20个字符", "error");
        return;
      }
      try {
        const url = currentCategory.value
            ? `/api/admin/categories/${currentCategory.value.id}`
            : "/api/admin/categories";
        const method = currentCategory.value ? "PUT" : "POST";

        const payload = {
          name: formData.value.name.trim(),
          parentId: formData.value.parentId ? parseInt(formData.value.parentId) : null,
          sort: formData.value.sort,
          enabled: formData.value.enabled
        };

        await apiFetch(url, { method, body: JSON.stringify(payload) });

        if (currentCategory.value) {
          showEditModal.value = false;
          showMessage("分类已更新");
        } else {
          showAddModal.value = false;
          showMessage("分类创建成功");
        }
        await loadCategories();
      } catch (e) {
        showMessage(e instanceof Error ? e.message : "保存失败", "error");
      }
    }

    async function handleDeleteCategory(id: number, name: string) {
      const hasChildren = categories.value.some(c => c.parentId === id);
      if (hasChildren) {
        showMessage("该分类下有子分类，无法删除", "error");
        return;
      }
      if (!confirm(`确定要删除分类 "${name}" 吗？此操作不可恢复！`)) return;

      try {
        await apiFetch(`/api/admin/categories/${id}`, { method: "DELETE" });
        showMessage("分类已删除");
        await loadCategories();
      } catch (e) {
        showMessage(e instanceof Error ? e.message : "删除失败", "error");
      }
    }

    const filteredCategories = computed(() => {
      if (!searchQuery.value) return categories.value;
      return categories.value.filter(category =>
          category.name.toLowerCase().includes(searchQuery.value.toLowerCase())
      );
    });

    onMounted(() => {
      auth.restore();
      if (!auth.isAuthed || !auth.isAdmin) {
        router.push("/login");
        return;
      }
      void loadCategories();
    });

    return () => (
        <div class="mx-auto max-w-7xl space-y-4">
          {/* 页面标题 */}
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="h-6 w-1 rounded-full bg-amber-700" />
                <div>
                  <h1 class="text-xl font-bold text-stone-900">分类管理</h1>
                  <p class="mt-1 text-sm text-stone-500">管理商品分类，支持多级分类结构</p>
                </div>
              </div>
              <button
                  type="button"
                  class="wc-btn wc-btn-primary px-4 py-2 flex items-center gap-2"
                  onClick={handleAddCategory}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                新增分类
              </button>
            </div>
          </div>

          {/* 提示消息 */}
          {msg.value ? (
              <div class={`rounded-xl border p-4 text-sm ${
                  msgType.value === "error"
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-green-200 bg-green-50 text-green-800"
              }`}>
                {msg.value}
              </div>
          ) : null}

          {/* 搜索框 */}
          <div class="flex items-center space-x-2">
            <div class="relative w-64">
              <input
                  type="text"
                  value={searchQuery.value}
                  onInput={(e: Event) => {
                    const target = e.target as HTMLInputElement;
                    searchQuery.value = target.value;
                  }}
                  placeholder="搜索分类名称"
                  class="wc-input w-full pr-10"
              />
              <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery.value && (
                <button
                    class="wc-btn wc-btn-ghost px-3 py-2 text-xs"
                    onClick={() => searchQuery.value = ""}
                >
                  清除
                </button>
            )}
            <span class="text-xs text-stone-500">
            共 {filteredCategories.value.length} 个分类
          </span>
          </div>

          {/* 分类列表 */}
          <div class="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {loading.value ? (
                <div class="p-8 text-center text-stone-500">
                  <div class="inline-block animate-spin rounded-full h-6 w-6 border-2 border-stone-300 border-t-amber-700 mr-2"></div>
                  加载中...
                </div>
            ) : filteredCategories.value.length === 0 ? (
                <div class="p-8 text-center text-stone-500">
                  {searchQuery.value ? "未找到匹配的分类" : "暂无分类数据"}
                </div>
            ) : (
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">ID</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">分类名称</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">父分类</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">排序</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">状态</th>
                      <th class="px-4 py-3 text-center font-medium text-stone-700">操作</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                    {filteredCategories.value.map((category) => (
                        <tr key={category.id} class="hover:bg-stone-50">
                          <td class="px-4 py-3 text-stone-500">#{category.id}</td>
                          <td class="px-4 py-3">
                            <div class="flex items-center gap-2">
                              {category.parentId && (
                                  <svg class="w-3 h-3 text-stone-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                              )}
                              <span class="font-medium text-stone-900">{category.name}</span>
                            </div>
                          </td>
                          <td class="px-4 py-3 text-stone-600">{category.parentName || "—"}</td>
                          <td class="px-4 py-3 text-stone-600">{category.sort}</td>
                          <td class="px-4 py-3">
                        <span class={`inline-block px-2 py-1 rounded text-xs font-medium ${category.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {category.enabled ? "启用" : "禁用"}
                        </span>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <div class="flex items-center justify-center space-x-3">
                              <button
                                  type="button"
                                  class="text-blue-600 hover:text-blue-800 text-xs"
                                  onClick={() => handleEditCategory(category)}
                              >
                                编辑
                              </button>
                              <button
                                  type="button"
                                  class="text-red-600 hover:text-red-800 text-xs"
                                  onClick={() => handleDeleteCategory(category.id, category.name)}
                              >
                                删除
                              </button>
                            </div>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}
          </div>

          {/* 添加分类模态框 */}
          {showAddModal.value && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { showAddModal.value = false; msg.value = ""; }}>
                <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  <h3 class="text-lg font-bold text-stone-900 mb-4">新增分类</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">
                        <span class="text-red-500">*</span> 分类名称
                      </label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="请输入分类名称（最多20个字符）"
                          maxlength={20}
                          value={formData.value.name}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            formData.value.name = target.value;
                          }}
                          onKeyup={(e: KeyboardEvent) => {
                            if (e.key === "Enter") void handleSaveCategory();
                          }}
                      />
                      <div class="mt-1 text-xs text-stone-500 text-right">{formData.value.name.length}/20</div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">父分类</label>
                      <select
                          class="wc-input"
                          value={formData.value.parentId}
                          onChange={(e: Event) => {
                            const target = e.target as HTMLSelectElement;
                            formData.value.parentId = target.value;
                          }}
                      >
                        <option value="">无（作为顶级分类）</option>
                        {allowedParents.value.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">排序</label>
                      <input
                          type="number"
                          class="wc-input"
                          placeholder="数字越小越靠前"
                          min={0}
                          value={formData.value.sort}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            formData.value.sort = parseInt(target.value) || 0;
                          }}
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                          type="checkbox"
                          id="new-category-enabled"
                          class="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                          checked={formData.value.enabled}
                          onChange={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            formData.value.enabled = target.checked;
                          }}
                      />
                      <label for="new-category-enabled" class="text-sm text-stone-700">启用此分类</label>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-6">
                    <button
                        type="button"
                        class="flex-1 wc-btn wc-btn-primary"
                        onClick={handleSaveCategory}
                    >
                      创建分类
                    </button>
                    <button
                        type="button"
                        class="wc-btn px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                        onClick={() => { showAddModal.value = false; msg.value = ""; }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* 编辑分类模态框 */}
          {showEditModal.value && currentCategory.value && (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { showEditModal.value = false; msg.value = ""; }}>
                <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  <h3 class="text-lg font-bold text-stone-900 mb-4">编辑分类</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">
                        <span class="text-red-500">*</span> 分类名称
                      </label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="请输入分类名称（最多20个字符）"
                          maxlength={20}
                          value={formData.value.name}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            formData.value.name = target.value;
                          }}
                          onKeyup={(e: KeyboardEvent) => {
                            if (e.key === "Enter") void handleSaveCategory();
                          }}
                      />
                      <div class="mt-1 text-xs text-stone-500 text-right">{formData.value.name.length}/20</div>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">父分类</label>
                      <select
                          class="wc-input"
                          value={formData.value.parentId}
                          onChange={(e: Event) => {
                            const target = e.target as HTMLSelectElement;
                            formData.value.parentId = target.value;
                          }}
                      >
                        <option value="">无（作为顶级分类）</option>
                        {allowedParents.value.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">排序</label>
                      <input
                          type="number"
                          class="wc-input"
                          placeholder="数字越小越靠前"
                          min={0}
                          value={formData.value.sort}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            formData.value.sort = parseInt(target.value) || 0;
                          }}
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                          type="checkbox"
                          id="edit-category-enabled"
                          class="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                          checked={formData.value.enabled}
                          onChange={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            formData.value.enabled = target.checked;
                          }}
                      />
                      <label for="edit-category-enabled" class="text-sm text-stone-700">启用此分类</label>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-6">
                    <button
                        type="button"
                        class="flex-1 wc-btn wc-btn-primary"
                        onClick={handleSaveCategory}
                    >
                      更新分类
                    </button>
                    <button
                        type="button"
                        class="wc-btn px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                        onClick={() => { showEditModal.value = false; msg.value = ""; }}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
          )}
        </div>
    );
  }
});