import { defineComponent, onMounted, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { apiFetch, apiUploadAdminCover } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type ScenicSpot = {
    id: number;
    name: string;
    description: string;
    coverImageUrl: string;
};

type Product = {
    id: number;
    title: string;
    subtitle: string;
    category: string;
    priceCents: number;
    stock: number;
    status: string;
    coverImageUrl: string;
    salesCount?: number;
    scenic_spot?: string;
    culturalStory?: string;
    craftInfo?: string;
};

export const ScenicSpotDetailPage = defineComponent({
    name: "ScenicSpotDetailPage",
    setup() {
        const router = useRouter();
        const route = useRoute();
        const auth = useAuthStore();
        const spot = ref<ScenicSpot | null>(null);
        const products = ref<Product[]>([]);
        const loading = ref(false);
        const msg = ref("");

        // 管理员编辑状态
        const editProduct = ref<Product | null>(null);
        const newId = ref<number | null>(null);
        const newTitle = ref("");
        const newSubtitle = ref("");
        const newCategory = ref("");
        const newPrice = ref(1990);
        const newStock = ref(10);
        const newCover = ref("");
        const newCulturalStory = ref("");
        const newCraftInfo = ref("");
        const coverFile = ref<File | null>(null);
        const coverPreview = ref("");
        const coverInputRef = ref<HTMLInputElement | null>(null);

        async function loadDetail() {
            loading.value = true;
            const id = route.params.id;
            try {
                const data = await apiFetch<any>(`/api/scenic-spots/${id}`);
                spot.value = data.spot;
                products.value = data.products || [];
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "加载失败";
            } finally {
                loading.value = false;
            }
        }

        function navigateToProduct(id: number) {
            router.push(`/products/${id}`);
        }

        function goBack() {
            router.push("/scenic-spots");
        }

        function formatPrice(cents: number) {
            return `¥${(cents / 100).toFixed(2)}`;
        }

        onMounted(async () => {
            auth.restore();
            await loadDetail();
        });

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

        async function createOrUpdateProduct() {
            msg.value = "";
            try {
                let coverImageUrl = (newCover.value || "").trim();
                if (coverFile.value) {
                    const { url } = await apiUploadAdminCover(coverFile.value);
                    coverImageUrl = url;
                }

                const scenicSpotName = spot.value?.name || "";

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
                            scenicSpot: scenicSpotName,
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
                            scenicSpot: scenicSpotName,
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
                await loadDetail();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : (editProduct.value ? "UPDATE_FAILED" : "CREATE_FAILED");
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

        async function toggleStatus(p: Product) {
            msg.value = "";
            const next = p.status === "ON" ? "OFF" : "ON";
            try {
                await apiFetch(`/api/admin/products/${p.id}/status`, {
                    method: "POST",
                    body: JSON.stringify({ status: next })
                });
                await loadDetail();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "STATUS_FAILED";
            }
        }

        async function removeProduct(productId: number) {
            msg.value = "";
            if (!confirm("确定要删除这个商品吗？")) return;
            try {
                await apiFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
                await loadDetail();
                msg.value = "已删除";
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "DELETE_FAILED";
            }
        }

        return () => (
            <div class="mx-auto max-w-7xl">
                {/* 返回按钮 */}
                <button
                    type="button"
                    class="mb-6 flex items-center gap-2 text-stone-600 hover:text-red-800 transition-colors"
                    onClick={goBack}
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>返回景点列表</span>
                </button>

                {/* 管理员操作按钮 */}
                {auth.isAdmin && (
                    <div class="mb-6 flex gap-3">
                        <button
                            type="button"
                            class="flex items-center gap-2 px-4 py-2 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors text-sm font-medium shadow-md"
                            onClick={() => { cancelEdit(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            新增景点产品
                        </button>
                    </div>
                )}

                {/* 景点信息 */}
                {spot.value ? (
                    <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm mb-8">
                        <div class="relative h-64 md:h-96">
                            <img
                                src={spot.value.coverImageUrl}
                                alt={spot.value.name}
                                class="w-full h-full object-cover"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            <div class="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                <h1 class="text-3xl md:text-4xl font-bold text-white mb-3">{spot.value.name}</h1>
                                <p class="text-white/90 text-base md:text-lg leading-relaxed max-w-3xl">
                                    {spot.value.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* 提示消息 */}
                {msg.value ? (
                    <div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        {msg.value}
                    </div>
                ) : null}

                {/* 管理员编辑表单 */}
                {auth.isAdmin && (
                    <div class="mb-8 bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-lg font-bold text-stone-900">
                                    {editProduct.value ? "编辑产品" : "新增景点产品"}
                                </h3>
                                {editProduct.value && (
                                    <p class="text-sm text-stone-500 mt-1">
                                        正在编辑：#{editProduct.value.id} · {editProduct.value.title}
                                    </p>
                                )}
                            </div>
                            {editProduct.value && (
                                <button
                                    type="button"
                                    class="px-3 py-1.5 text-sm text-stone-600 hover:text-stone-900 transition-colors"
                                    onClick={cancelEdit}
                                >
                                    取消
                                </button>
                            )}
                        </div>

                        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                                <label class="block text-xs text-stone-500 mb-1.5">ID（可选）</label>
                                <input type="number" class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newId.value} />
                            </div>
                            <div class="lg:col-span-2">
                                <label class="block text-xs text-stone-500 mb-1.5"><span class="text-red-600">*</span> 标题</label>
                                <input type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newTitle.value} placeholder="产品名称" />
                            </div>
                            <div class="lg:col-span-3">
                                <label class="block text-xs text-stone-500 mb-1.5">副标题</label>
                                <input type="text" class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newSubtitle.value} placeholder="产品描述/卖点" />
                            </div>
                            <div>
                                <label class="block text-xs text-stone-500 mb-1.5">分类</label>
                                <select class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newCategory.value}>
                                    <option value="">请选择分类</option>
                                    <option value="景点文创">景点文创</option>
                                    <option value="非遗">非遗</option>
                                    <option value="文创">文创</option>
                                    <option value="伴手礼">伴手礼</option>
                                    <option value="手作">手作</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-xs text-stone-500 mb-1.5"><span class="text-red-600">*</span> 价格（分）</label>
                                <input type="number" class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newPrice.value} />
                            </div>
                            <div>
                                <label class="block text-xs text-stone-500 mb-1.5"><span class="text-red-600">*</span> 库存</label>
                                <input type="number" class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newStock.value} />
                            </div>
                            <div class="lg:col-span-3">
                                <label class="block text-xs text-stone-500 mb-1.5">封面图 URL</label>
                                <div class="flex gap-2">
                                    <input type="text" class="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500" v-model={newCover.value} placeholder="https://..." />
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        class="block w-48 cursor-pointer text-sm text-stone-600 file:mr-2 file:rounded-md file:border-0 file:bg-red-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-red-700 hover:file:bg-red-100"
                                        onChange={onCoverFileChange}
                                    />
                                </div>
                                {(coverPreview.value || newCover.value) && (
                                    <img
                                        src={coverPreview.value || newCover.value}
                                        alt=""
                                        class="mt-2 h-24 w-24 rounded-lg border border-stone-200 object-cover"
                                        onError={(e: Event) => { (e.target as HTMLImageElement).src = "/favicon.svg"; }}
                                    />
                                )}
                            </div>
                            <div class="lg:col-span-3">
                                <label class="block text-xs text-stone-500 mb-1.5">文化故事</label>
                                <textarea class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[80px]" v-model={newCulturalStory.value} placeholder="请输入产品的文化故事..." />
                            </div>
                            <div class="lg:col-span-3">
                                <label class="block text-xs text-stone-500 mb-1.5">工艺信息</label>
                                <textarea class="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-red-500 min-h-[60px]" v-model={newCraftInfo.value} placeholder="材质、工艺等信息" />
                            </div>
                        </div>

                        <div class="mt-4 flex gap-3">
                            <button
                                type="button"
                                class="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors font-medium"
                                onClick={() => void createOrUpdateProduct()}
                            >
                                {editProduct.value ? "保存修改" : "创建产品"}
                            </button>
                        </div>
                    </div>
                )}


                {/* 商品列表 */}
                <div class="mb-6">
                    <h2 class="text-2xl font-bold text-stone-900 mb-6 flex items-center gap-3">
                        <span class="h-6 w-1 rounded-full bg-red-800"></span>
                        景点文创产品
                        <span class="text-sm font-normal text-stone-500 ml-2">
              ({products.value.length} 件商品)
            </span>
                    </h2>
                </div>

                {loading.value ? (
                    <div class="text-center py-12 text-stone-500">加载中...</div>
                ) : products.value.length === 0 ? (
                    <div class="bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500">
                        该景点暂无文创产品
                    </div>
                ) : (
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.value.map((product) => (
                            <div class="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all relative">
                                {/* 管理员操作按钮 */}
                                {auth.isAdmin && (
                                    <div class="absolute top-2 right-2 z-10 flex gap-1">
                                        <button
                                            type="button"
                                            class="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                            onClick={() => startEdit(product)}
                                            title="编辑"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            type="button"
                                            class="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
                                            onClick={() => void removeProduct(product.id)}
                                            title="删除"
                                        >
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                )}

                                <div
                                    class="relative h-48 overflow-hidden bg-stone-100 cursor-pointer"
                                    onClick={() => navigateToProduct(product.id)}
                                >
                                    <img
                                        src={product.coverImageUrl}
                                        alt={product.title}
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        onError={(e: Event) => {
                                            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=600&q=80";
                                        }}
                                    />
                                </div>
                                <div class="p-4">
                                    <h3 class="font-bold text-stone-900 mb-1 line-clamp-1 cursor-pointer hover:text-red-800" onClick={() => navigateToProduct(product.id)}>
                                        {product.title}
                                    </h3>
                                    <p class="text-xs text-stone-500 mb-3 line-clamp-2">{product.subtitle}</p>

                                    <div class="flex items-center justify-between mb-2">
                                        <span class="text-lg font-bold text-red-800">{formatPrice(product.priceCents)}</span>
                                        <span class="text-xs px-2 py-1 bg-stone-100 text-stone-600 rounded">
                                            {product.category}
                                        </span>
                                    </div>

                                    <div class="flex items-center gap-2 text-xs text-stone-400 mb-3">
                                        <span>已售 {product.salesCount || 0}</span>
                                        <span class="w-1 h-1 bg-stone-300 rounded-full"></span>
                                        <span>库存 {product.stock || 0}</span>
                                    </div>

                                    {/* 管理员操作 */}
                                    {auth.isAdmin && (
                                        <div class="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                                            <button
                                                type="button"
                                                class="flex-shrink-0 px-3 py-1.5 text-xs rounded-md font-medium transition-colors border border-stone-200 hover:border-stone-300"
                                                class:text-amber-600={product.status === "ON"}
                                                class:text-green-600={product.status === "OFF"}
                                                onClick={() => void toggleStatus(product)}
                                            >
                                                {product.status === "ON" ? "下架" : "上架"}
                                            </button>
                                            <input
                                                type="number"
                                                class="flex-1 min-w-0 px-2 py-1.5 text-xs border border-stone-300 rounded text-center"
                                                value={product.stock || 0}
                                                onInput={(e) => {
                                                    const val = Number((e.target as HTMLInputElement).value);
                                                    if (!isNaN(val)) {
                                                        product.stock = val;
                                                    }
                                                }}
                                                onChange={(e) => {
                                                    const newStock = Number((e.target as HTMLInputElement).value);
                                                    if (!isNaN(newStock) && newStock >= 0) {
                                                        apiFetch(`/api/admin/products/${product.id}/stock`, {
                                                            method: "POST",
                                                            body: JSON.stringify({ stock: newStock })
                                                        }).then(() => loadDetail());
                                                    }
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
});