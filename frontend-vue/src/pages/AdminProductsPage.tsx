import { defineComponent, onMounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { apiFetch, apiUploadAdminCover } from "../lib/api";

type Product = {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  priceCents: number;
  stock: number;
  status: string;
  coverImageUrl: string;
  culturalStory?: string;
  craftInfo?: string;
};

export const AdminProductsPage = defineComponent({
  name: "AdminProductsPage",
  setup() {
    const auth = useAuthStore();
    const router = useRouter();
    const loading = ref(true);
    const err = ref("");
    const msg = ref("");
    const items = ref<Product[]>([]);
    const categories = ref<{ id: number; name: string }[]>([]);

    const newId = ref<number | null>(null);
    const newTitle = ref("");
    const newSubtitle = ref("");
    const newCategory = ref("");
    const newPrice = ref(1990);
    const newStock = ref(10);
    const newCover = ref("");
    const coverFile = ref<File | null>(null);
    const coverPreview = ref("");
    const coverInputRef = ref<HTMLInputElement | null>(null);
    const editProduct = ref<Product | null>(null);
    const newCulturalStory = ref("");
    const newCraftInfo = ref("");

    async function loadCategories() {
      try {
        const data = await apiFetch<{ id: number; name: string }[]>('/api/categories/root');
        categories.value = data || [];
      } catch (e) {
        categories.value = [];
      }
    }

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        const res = await apiFetch<{ items: Product[] }>("/api/admin/products?page=0&size=50");
        items.value = res.items;
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    function revokeCoverPreview() {
      if (coverPreview.value) {
        URL.revokeObjectURL(coverPreview.value);
        coverPreview.value = "";
      }
    }

    function onCoverFileChange(e: Event) {
      const input = e.target as HTMLInputElement;
      const f = input.files?.[0] ?? null;
      revokeCoverPreview();
      coverFile.value = f;
      coverPreview.value = f ? URL.createObjectURL(f) : "";
    }

    function clearCoverFile() {
      revokeCoverPreview();
      coverFile.value = null;
      if (coverInputRef.value) coverInputRef.value.value = "";
    }

    async function create() {
      msg.value = "";
      try {
        let coverImageUrl = (newCover.value || "").trim();
        if (coverFile.value) {
          const { url } = await apiUploadAdminCover(coverFile.value);
          coverImageUrl = url;
        }

        if (editProduct.value) {
          await apiFetch(`/api/admin/products/${editProduct.value.id}`, {
            method: "PUT",
            body: JSON.stringify({
              title: newTitle.value.trim(),
              subtitle: (newSubtitle.value || "").trim(),
              category: (newCategory.value || "").trim(),
              priceCents: newPrice.value,
              stock: newStock.value,
              coverImageUrl,
              culturalStory: (newCulturalStory.value || "").trim(),
              craftInfo: (newCraftInfo.value || "").trim()
            })
          });
          msg.value = "已更新商品";
        } else {
          await apiFetch("/api/admin/products", {
            method: "POST",
            body: JSON.stringify({
              id: newId.value,
              title: newTitle.value.trim(),
              subtitle: (newSubtitle.value || "").trim(),
              category: (newCategory.value || "").trim(),
              priceCents: newPrice.value,
              stock: newStock.value,
              coverImageUrl,
              culturalStory: (newCulturalStory.value || "").trim(),
              craftInfo: (newCraftInfo.value || "").trim()
            })
          });
          msg.value = "已创建商品";
        }

        newId.value = null;
        newTitle.value = "";
        newSubtitle.value = "";
        newCategory.value = "";
        newPrice.value = 1990;
        newStock.value = 10;
        newCover.value = "";
        newCulturalStory.value = "";
        newCraftInfo.value = "";
        clearCoverFile();
        editProduct.value = null;
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : (editProduct.value ? "UPDATE_FAILED" : "CREATE_FAILED");
      }
    }

    async function toggleStatus(p: Product) {
      msg.value = "";
      const next = p.status === "ON" ? "OFF" : "ON";
      try {
        await apiFetch(`/api/admin/products/${p.id}/status`, { method: "POST", body: JSON.stringify({ status: next }) });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "STATUS_FAILED";
      }
    }

    async function setStock(p: Product, stock: number) {
      msg.value = "";
      try {
        await apiFetch(`/api/admin/products/${p.id}/stock`, { method: "POST", body: JSON.stringify({ stock }) });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "STOCK_FAILED";
      }
    }

    async function remove(productId: number) {
      msg.value = "";
      if (!confirm("确定要删除这个商品吗？")) return;
      try {
        await apiFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
        await load();
        msg.value = "已删除";
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "DELETE_FAILED";
      }
    }

    function startEdit(product: Product) {
      editProduct.value = product;
      newId.value = product.id;
      newTitle.value = product.title || "";
      newSubtitle.value = product.subtitle || "";
      newCategory.value = product.category || "";
      newPrice.value = product.priceCents || 0;
      newStock.value = product.stock || 0;
      newCover.value = product.coverImageUrl || "";
      newCulturalStory.value = product.culturalStory || "";
      newCraftInfo.value = product.craftInfo || "";
      coverFile.value = null;
      coverPreview.value = "";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function cancelEdit() {
      editProduct.value = null;
      newId.value = null;
      newTitle.value = "";
      newSubtitle.value = "";
      newCategory.value = "";
      newPrice.value = 1990;
      newStock.value = 10;
      newCover.value = "";
      newCulturalStory.value = "";
      newCraftInfo.value = "";
      clearCoverFile();
    }

    onMounted(() => {
      auth.restore();
      if (!auth.isAdmin) router.push("/");
      else {
        void load();
        void loadCategories();
      }
    });

    return () => (
        <div class="mx-auto max-w-5xl space-y-4">
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
              <span class="rounded-md bg-admin-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm">商品管理</span>
              <span class="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500">新增 / 上下架 / 库存</span>
            </div>
            <div class="mt-5">
              <h1 class="text-xl font-semibold text-gray-900">商品管理</h1>
              <p class="mt-1 text-sm text-gray-500">维护文创商品信息，支持快速上下架与库存调整。</p>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="text-sm font-semibold text-gray-900">
              {editProduct.value ? "编辑商品" : "新增商品"}
            </div>
            {editProduct.value && (
                <div class="mt-2 text-xs text-gray-500">
                  正在编辑：#{editProduct.value.id} · {editProduct.value.title}
                </div>
            )}
            <div class="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <div class="mb-1.5 text-xs text-gray-500">
                  ID（可选）
                </div>
                <input type="number" class="admin-input" placeholder="手动指定 ID" v-model={newId.value} />
              </div>
              <div>
                <div class="mb-1.5 text-xs text-gray-500">
                  <span class="text-red-500">*</span> 标题
                </div>
                <input class="admin-input" placeholder="商品标题" v-model={newTitle.value} />
              </div>
              <div>
                <div class="mb-1.5 text-xs text-gray-500">
                  副标题
                </div>
                <input class="admin-input" placeholder="副标题/卖点" v-model={newSubtitle.value} />
              </div>
              <div>
                <div class="mb-1.5 text-xs text-gray-500">
                  分类
                </div>
                <select class="admin-input" v-model={newCategory.value}>
                  <option value="">请选择分类</option>
                  {categories.value.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div class="mb-1.5 text-xs text-gray-500">
                  <span class="text-red-500">*</span> 价格（分）
                </div>
                <input type="number" class="admin-input" v-model={newPrice.value} />
              </div>
              <div>
                <div class="mb-1.5 text-xs text-gray-500">
                  <span class="text-red-500">*</span> 库存
                </div>
                <input type="number" class="admin-input" v-model={newStock.value} />
              </div>
            </div>

            {/* 文化故事和工艺信息 */}
            <div class="mt-4 grid gap-3 md:grid-cols-2">
              <div class="md:col-span-2">
                <div class="mb-1.5 text-xs text-gray-500">文化故事</div>
                <textarea
                    class="admin-input min-h-[100px]"
                    placeholder="请输入商品的文化故事..."
                    v-model={newCulturalStory.value}
                />
                <p class="mt-1 text-[11px] text-gray-400">介绍商品背后的历史文化故事</p>
              </div>
              <div class="md:col-span-2">
                <div class="mb-1.5 text-xs text-gray-500">工艺信息</div>
                <textarea
                    class="admin-input min-h-[80px]"
                    placeholder="请输入材质、工艺等信息..."
                    v-model={newCraftInfo.value}
                />
                <p class="mt-1 text-[11px] text-gray-400">如：材质：竹骨+宣纸；工艺：手工书画</p>
              </div>
            </div>

            <div class="mt-4">
              <div class="mb-1.5 text-xs text-gray-500">封面图</div>
              <div class="grid gap-3 sm:grid-cols-2">
                <div>
                  <div class="mb-1 text-[11px] text-gray-400">图片地址（外链 URL）</div>
                  <input class="admin-input" placeholder="https://…" v-model={newCover.value} />
                </div>
                <div>
                  <div class="mb-1 text-[11px] text-gray-400">或上传本机图片</div>
                  <div class="flex flex-wrap items-center gap-2">
                    <input
                        ref={coverInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        class="block w-full max-w-xs cursor-pointer text-sm text-gray-600 file:mr-2 file:rounded-md file:border-0 file:bg-admin-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-admin-700 hover:file:bg-admin-100"
                        onChange={onCoverFileChange}
                    />
                    {coverFile.value ? (
                        <button type="button" class="admin-btn-ghost shrink-0 py-1.5 text-xs" onClick={clearCoverFile}>
                          清除文件
                        </button>
                    ) : null}
                  </div>
                </div>
              </div>
              <p class="mt-2 text-[11px] text-gray-400">
                支持 JPG / PNG / GIF / WebP，单张不超过 5MB。若同时填写 URL 与上传文件，创建时将优先使用本机图片。
              </p>
              {coverPreview.value ? (
                  <div class="mt-3 flex items-start gap-3">
                    <span class="text-xs text-gray-500">预览</span>
                    <img
                        src={coverPreview.value || newCover.value}
                        alt=""
                        class="h-24 w-24 rounded-lg border border-gray-200 object-cover shadow-sm"
                        onError={(e: Event) => {
                          (e.target as HTMLImageElement).src = "/favicon.svg";
                        }}
                    />
                  </div>
              ) : null}
            </div>
            <div class="flex gap-3 mt-4">
              <button type="button" class="admin-btn-primary" onClick={() => void create()}>
                {editProduct.value ? "保存修改" : "创建商品"}
              </button>
              {editProduct.value && (
                  <button type="button" class="admin-btn-ghost" onClick={cancelEdit}>
                    取消
                  </button>
              )}
            </div>
          </div>


          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between gap-3">
            <div class="text-sm font-semibold text-gray-900">商品列表</div>
            <button type="button" class="admin-btn-ghost" onClick={() => void load()}>
              刷新
            </button>
          </div>

          {loading.value ? (
            <div class="mt-4 text-sm text-gray-500">加载中…</div>
          ) : err.value ? (
            <div class="mt-4 text-sm text-red-600">加载失败：{err.value}</div>
          ) : (
            <div class="mt-4 space-y-3">
              {items.value.map((p) => (
                <div
                  key={p.id}
                  class="flex flex-col gap-3 rounded-lg border border-gray-100 bg-gray-50/80 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold text-gray-900">
                      #{p.id} · {p.title}
                    </div>
                    <div class="mt-1 text-xs text-gray-500">
                      状态 <span class="font-medium text-gray-800">{p.status}</span> · 价格 ￥{(p.priceCents / 100).toFixed(2)} · 库存{" "}
                      {p.stock}
                    </div>
                  </div>
                  <div class="flex flex-wrap items-center gap-2">
                    <button type="button" class="admin-btn-ghost text-admin-600 ring-1 ring-admin-500/30"
                            onClick={() => void toggleStatus(p)}>
                      {p.status === "ON" ? "下架" : "上架"}
                    </button>
                    <button type="button" class="admin-btn-ghost text-blue-600 ring-1 ring-blue-500/30"
                            onClick={() => startEdit(p)}>
                      编辑
                    </button>
                    <input
                        type="number"
                        class="admin-input w-24 py-1.5 text-sm"
                        value={p.stock}
                        onChange={(e) => void setStock(p, Number((e.target as HTMLInputElement).value))}
                    />
                    <button type="button" class="admin-btn-danger" onClick={() => void remove(p.id)}>
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {msg.value ? <div class="mt-3 text-sm text-admin-700">{msg.value}</div> : null}
        </div>
      </div>
    );
  }
});

