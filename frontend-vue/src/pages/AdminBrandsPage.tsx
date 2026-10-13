import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Brand = {
  id: number;
  name: string;
  logo: string;
  description: string;
  origin: string;
  foundYear: number | null;
  enabled: boolean;
  createdAt: string;
};

type BrandForm = {
  name: string;
  logo: string;
  description: string;
  origin: string;
  foundYear: string;
  enabled: boolean;
};

export const AdminBrandsPage = defineComponent({
  name: "AdminBrandsPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const brands = ref<Brand[]>([]);
    const loading = ref(false);
    const msg = ref("");
    const page = ref(0);
    const size = ref(10);
    const total = ref(0);
    const showAddModal = ref(false);
    const showEditModal = ref(false);
    const editingBrand = ref<Brand | null>(null);
    const newBrand = ref<BrandForm>({
      name: "",
      logo: "",
      description: "",
      origin: "",
      foundYear: "",
      enabled: true
    });

    async function loadBrands() {
      loading.value = true;
      msg.value = "";
      try {
        const params = new URLSearchParams();
        params.set("page", String(page.value));
        params.set("size", String(size.value));
        const data = await apiFetch<any>(`/api/admin/brands?${params}`);
        brands.value = data.items || [];
        total.value = data.total || 0;
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "加载失败";
      } finally {
        loading.value = false;
      }
    }

    function openAddModal() {
      newBrand.value = {
        name: "",
        logo: "",
        description: "",
        origin: "",
        foundYear: "",
        enabled: true
      };
      showAddModal.value = true;
    }

    async function createNewBrand() {
      if (!newBrand.value.name.trim()) {
        msg.value = "请输入品牌名称";
        return;
      }
      try {
        const payload: any = {
          name: newBrand.value.name,
          logo: newBrand.value.logo,
          description: newBrand.value.description,
          origin: newBrand.value.origin,
          enabled: newBrand.value.enabled
        };
        if (newBrand.value.foundYear && parseInt(newBrand.value.foundYear) > 0) {
          payload.foundYear = parseInt(newBrand.value.foundYear);
        }
        await apiFetch("/api/admin/brands", {
          method: "POST",
          body: JSON.stringify(payload)
        });
        msg.value = "品牌创建成功";
        showAddModal.value = false;
        await loadBrands();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "创建失败";
      }
    }

    function handleEdit(brand: Brand) {
      editingBrand.value = { ...brand };
      showEditModal.value = true;
    }

    async function updateBrand() {
      if (!editingBrand.value) return;
      try {
        const payload: any = {
          name: editingBrand.value.name,
          logo: editingBrand.value.logo,
          description: editingBrand.value.description,
          origin: editingBrand.value.origin,
          enabled: editingBrand.value.enabled
        };
        if (editingBrand.value.foundYear) {
          payload.foundYear = editingBrand.value.foundYear;
        }
        await apiFetch(`/api/admin/brands/${editingBrand.value.id}`, {
          method: "PUT",
          body: JSON.stringify(payload)
        });
        msg.value = "品牌已更新";
        showEditModal.value = false;
        await loadBrands();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "更新失败";
      }
    }

    async function handleDelete(id: number, name: string) {
      if (!confirm(`确定要删除品牌 "${name}" 吗？此操作不可恢复！`)) {
        return;
      }
      try {
        await apiFetch(`/api/admin/brands/${id}`, { method: "DELETE" });
        msg.value = "品牌已删除";
        await loadBrands();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "删除失败";
      }
    }

    const totalPages = computed(() => Math.ceil(total.value / size.value));

    async function changePage(newPage: number) {
      if (newPage < 0 || newPage >= totalPages.value) return;
      page.value = newPage;
      await loadBrands();
    }

    onMounted(async () => {
      auth.restore();
      if (!auth.isAuthed || !auth.isAdmin) {
        router.push("/login");
        return;
      }
      await loadBrands();
    });

    return () => (
        <div class="mx-auto max-w-7xl space-y-4">
          {/* 页面标题 */}
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="h-6 w-1 rounded-full bg-amber-700" />
                <div>
                  <h1 class="text-xl font-bold text-stone-900">品牌管理</h1>
                  <p class="mt-1 text-sm text-stone-500">管理合作品牌信息、品牌故事和品牌Logo</p>
                </div>
              </div>
              <button
                  type="button"
                  class="wc-btn wc-btn-primary px-4 py-2 flex items-center gap-2"
                  onClick={openAddModal}
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                新增品牌
              </button>
            </div>
          </div>

          {/* 提示消息 */}
          {msg.value ? (
              <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                {msg.value}
              </div>
          ) : null}

          {/* 品牌列表 */}
          <div class="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {loading.value ? (
                <div class="p-8 text-center text-stone-500">加载中...</div>
            ) : brands.value.length === 0 ? (
                <div class="p-8 text-center text-stone-500">暂无品牌数据</div>
            ) : (
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead class="bg-stone-50 border-b border-stone-200">
                    <tr>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">ID</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">品牌Logo</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">品牌名称</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">品牌起源</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">创立年份</th>
                      <th class="px-4 py-3 text-left font-medium text-stone-700">状态</th>
                      <th class="px-4 py-3 text-center font-medium text-stone-700">操作</th>
                    </tr>
                    </thead>
                    <tbody class="divide-y divide-stone-100">
                    {brands.value.map((brand) => (
                        <tr class="hover:bg-stone-50">
                          <td class="px-4 py-3 text-stone-500">#{brand.id}</td>
                          <td class="px-4 py-3">
                            {brand.logo ? (
                                <img src={brand.logo} alt={brand.name} class="h-10 w-10 object-contain" />
                            ) : (
                                <div class="h-10 w-10 rounded border border-stone-200 bg-stone-100 flex items-center justify-center">
                                  <span class="text-xs text-stone-400">无</span>
                                </div>
                            )}
                          </td>
                          <td class="px-4 py-3 font-medium text-stone-900">
                            <div>{brand.name}</div>
                            {brand.description && (
                                <div class="text-xs text-stone-500 mt-1 line-clamp-1">{brand.description}</div>
                            )}
                          </td>
                          <td class="px-4 py-3 text-stone-600">{brand.origin || "-"}</td>
                          <td class="px-4 py-3 text-stone-600">{brand.foundYear || "-"}</td>
                          <td class="px-4 py-3">
                        <span class={`inline-block px-2 py-1 rounded text-xs font-medium ${brand.enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {brand.enabled ? "启用" : "禁用"}
                        </span>
                          </td>
                          <td class="px-4 py-3 text-center">
                            <button
                                type="button"
                                class="text-blue-600 hover:text-blue-800 text-xs mr-3"
                                onClick={() => handleEdit(brand)}
                            >
                              编辑
                            </button>
                            <button
                                type="button"
                                class="text-red-600 hover:text-red-800 text-xs"
                                onClick={() => handleDelete(brand.id, brand.name)}
                            >
                              删除
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
            )}

            {/* 分页 */}
            {totalPages.value > 1 && (
                <div class="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50">
                  <div class="text-sm text-stone-600">
                    共 {total.value} 条记录，第 {page.value + 1} / {totalPages.value} 页
                  </div>
                  <div class="flex gap-2">
                    <button
                        type="button"
                        class="px-3 py-1 text-sm border border-stone-300 rounded hover:bg-white disabled:opacity-50"
                        disabled={page.value === 0}
                        onClick={() => changePage(page.value - 1)}
                    >
                      上一页
                    </button>
                    <button
                        type="button"
                        class="px-3 py-1 text-sm border border-stone-300 rounded hover:bg-white disabled:opacity-50"
                        disabled={page.value >= totalPages.value - 1}
                        onClick={() => changePage(page.value + 1)}
                    >
                      下一页
                    </button>
                  </div>
                </div>
            )}
          </div>

          {/* 新增品牌弹窗 */}
          {showAddModal.value ? (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => showAddModal.value = false}>
                <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  <h3 class="text-lg font-bold text-stone-900 mb-4">新增品牌</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">
                        <span class="text-red-500">*</span> 品牌名称
                      </label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="请输入品牌名称"
                          value={newBrand.value.name}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            newBrand.value.name = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">品牌Logo</label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="请输入Logo URL（可选）"
                          value={newBrand.value.logo}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            newBrand.value.logo = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">品牌描述</label>
                      <textarea
                          class="wc-input h-20"
                          placeholder="请输入品牌描述"
                          value={newBrand.value.description}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLTextAreaElement;
                            newBrand.value.description = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">品牌起源</label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="例如：河南开封"
                          value={newBrand.value.origin}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            newBrand.value.origin = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">创立年份</label>
                      <input
                          type="number"
                          class="wc-input"
                          placeholder="例如：2020"
                          value={newBrand.value.foundYear}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            newBrand.value.foundYear = target.value;
                          }}
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                          type="checkbox"
                          id="new-brand-enabled"
                          class="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                          checked={newBrand.value.enabled}
                          onChange={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            newBrand.value.enabled = target.checked;
                          }}
                      />
                      <label for="new-brand-enabled" class="text-sm text-stone-700">启用此品牌</label>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-6">
                    <button type="button" class="flex-1 wc-btn wc-btn-primary" onClick={createNewBrand}>
                      创建品牌
                    </button>
                    <button
                        type="button"
                        class="wc-btn px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                        onClick={() => showAddModal.value = false}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
          ) : null}

          {/* 编辑品牌弹窗 */}
          {showEditModal.value && editingBrand.value ? (
              <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => showEditModal.value = false}>
                <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  <h3 class="text-lg font-bold text-stone-900 mb-4">编辑品牌</h3>
                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">
                        <span class="text-red-500">*</span> 品牌名称
                      </label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="请输入品牌名称"
                          value={editingBrand.value.name}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            editingBrand.value!.name = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">品牌Logo</label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="请输入Logo URL（可选）"
                          value={editingBrand.value.logo}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            editingBrand.value!.logo = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">品牌描述</label>
                      <textarea
                          class="wc-input h-20"
                          placeholder="请输入品牌描述"
                          value={editingBrand.value.description || ""}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLTextAreaElement;
                            editingBrand.value!.description = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">品牌起源</label>
                      <input
                          type="text"
                          class="wc-input"
                          placeholder="例如：河南开封"
                          value={editingBrand.value.origin || ""}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            editingBrand.value!.origin = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">创立年份</label>
                      <input
                          type="number"
                          class="wc-input"
                          placeholder="例如：2020"
                          value={editingBrand.value.foundYear || ""}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            editingBrand.value!.foundYear = target.value ? parseInt(target.value) : null;
                          }}
                      />
                    </div>
                    <div class="flex items-center gap-2">
                      <input
                          type="checkbox"
                          id="edit-brand-enabled"
                          class="h-4 w-4 rounded border-stone-300 text-red-600 focus:ring-red-500"
                          checked={editingBrand.value.enabled}
                          onChange={(e: Event) => {
                            const target = e.target as HTMLInputElement;
                            editingBrand.value!.enabled = target.checked;
                          }}
                      />
                      <label for="edit-brand-enabled" class="text-sm text-stone-700">启用此品牌</label>
                    </div>
                  </div>
                  <div class="flex gap-3 mt-6">
                    <button type="button" class="flex-1 wc-btn wc-btn-primary" onClick={updateBrand}>
                      更新品牌
                    </button>
                    <button
                        type="button"
                        class="wc-btn px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                        onClick={() => showEditModal.value = false}
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
          ) : null}
        </div>
    );
  }
});