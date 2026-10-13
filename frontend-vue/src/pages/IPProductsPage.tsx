import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { apiFetch, apiUploadAdminCover } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Product = {
    id: number;
    title: string;
    subtitle: string;
    category: string;
    price_cents: number;
    stock: number;
    status: string;
    cover_image_url: string;
    description?: string;
    scenic_spot?: string;
};

type IPCategory = {
    id: string;
    name: string;
    icon: string;
    description: string;
};

export const IPProductsPage = defineComponent({
    name: "IPProductsPage",
    setup() {
        const router = useRouter();
        const auth = useAuthStore();
        const products = ref<Product[]>([]);
        const loading = ref(false);
        const activeCategory = ref<string>("all");
        const msg = ref("");
        const showCreateForm = ref(false);
        const editProduct = ref<Product | null>(null);

        const newId = ref<number | null>(null);
        const newTitle = ref("");
        const newSubtitle = ref("");
        const newCategory = ref("");
        const newPrice = ref(1990);
        const newStock = ref(100);
        const newCover = ref("/favicon.svg");
        const newScenicSpot = ref("");
        const coverFile = ref<File | null>(null);
        const coverPreview = ref("");
        const coverInputRef = ref<HTMLInputElement | null>(null);

        const ipCategories: IPCategory[] = [
            { id: "all", name: "全部IP", icon: "🎪", description: "所有开封文创IP产品" },
            { id: "baogong", name: "包公IP", icon: "⚖️", description: "铁面无私的包青天系列" },
            { id: "qingmingwa", name: "清明娃", icon: "👶", description: "清明上河园官方IP形象" },
            { id: "songxiaoge", name: "宋小哥", icon: "🎎", description: "开封文旅官方IP形象" },
            { id: "qingmingtu", name: "清明上河图", icon: "🖼️", description: "传世名画IP衍生" },
            { id: "nightmarket", name: "夜市美食", icon: "🍜", description: "开封夜市美食IP系列" },
        ];

        async function loadProducts() {
            loading.value = true;
            try {
                console.log('开始加载IP文创产品...');
                const data = await apiFetch<any>("/api/products?page=0&size=100");
                console.log('API返回数据:', data);

                const allProducts: Product[] = data.items || [];

                console.log('获取到的产品总数:', allProducts.length);
                if (allProducts.length > 0) {
                    console.log('第一个产品:', allProducts[0]);
                }

                products.value = allProducts;
            } catch (e) {
                console.error('加载产品失败:', e);
                msg.value = e instanceof Error ? e.message : "加载失败";
            } finally {
                loading.value = false;
            }
        }


        function goBack() {
            router.push("/about");
        }

        function formatPrice(priceCents: number) {
            if (!priceCents || isNaN(priceCents)) return "¥0.00";
            return `¥${(priceCents / 100).toFixed(2)}`;
        }

        function getCategoryFilter() {
            if (activeCategory.value === "all") return products.value;
            return products.value.filter((p) => {
                const title = p.title.toLowerCase();
                switch (activeCategory.value) {
                    case "baogong":
                        return title.includes("包公") || title.includes("包大人") || title.includes("开封府");
                    case "qingmingwa":
                        return title.includes("清明娃") || title.includes("清明上河");
                    case "songxiaoge":
                        return title.includes("宋小哥") || title.includes("宋韵");
                    case "qingmingtu":
                        return title.includes("清明上河图");
                    case "nightmarket":
                        return title.includes("夜市") || title.includes("美食");
                    default:
                        return true;
                }
            });
        }

        function startEdit(product: Product) {
            editProduct.value = product;
            newId.value = product.id;
            newTitle.value = product.title || "";
            newSubtitle.value = product.subtitle || "";
            newCategory.value = product.category || "";
            newPrice.value = product.price_cents || 0;
            newStock.value = product.stock || 0;
            newCover.value = product.cover_image_url || "";
            newScenicSpot.value = product.scenic_spot || "";
            coverFile.value = null;
            coverPreview.value = "";
            showCreateForm.value = true;
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        function startCreate() {
            editProduct.value = null;
            newId.value = null;
            newTitle.value = "";
            newSubtitle.value = "";
            newCategory.value = "";
            newPrice.value = 1990;
            newStock.value = 100;
            newCover.value = "/favicon.svg";
            newScenicSpot.value = "";
            showCreateForm.value = true;
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

        function cancelForm() {
            showCreateForm.value = false;
            editProduct.value = null;
            msg.value = "";
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

        async function saveProduct() {
            msg.value = "";
            if (!newTitle.value.trim()) {
                msg.value = "请输入商品标题";
                return;
            }
            try {
                let coverImageUrl = (newCover.value || "").trim();
                if (coverFile.value) {
                    const { url } = await apiUploadAdminCover(coverFile.value);
                    coverImageUrl = url;
                }

                const payload = {
                    title: newTitle.value.trim(),
                    subtitle: (newSubtitle.value || "").trim(),
                    category: (newCategory.value || "").trim(),
                    price_cents: newPrice.value,
                    stock: newStock.value,
                    cover_image_url: coverImageUrl,
                    scenic_spot: (newScenicSpot.value || "").trim()
                };

                if (editProduct.value) {
                    await apiFetch(`/api/admin/products/${editProduct.value.id}`, {
                        method: "PUT",
                        body: JSON.stringify(payload)
                    });
                    msg.value = "✅ 商品已更新";
                } else {
                    await apiFetch("/api/admin/products", {
                        method: "POST",
                        body: JSON.stringify({ ...payload, id: newId.value })
                    });
                    msg.value = "✅ 商品已创建";
                }

                showCreateForm.value = false;
                editProduct.value = null;
                await loadProducts();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "保存失败";
            }
        }

        async function toggleStatus(p: Product) {
            msg.value = "";
            const next = p.status === "ON" ? "OFF" : "ON";
            try {
                await apiFetch(`/api/admin/products/${p.id}/status`, {
                    method: "POST",
                    body: JSON.stringify({ status: next })
                });
                await loadProducts();
                msg.value = next === "ON" ? "✅ 已上架" : "⏸️ 已下架";
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "操作失败";
            }
        }

        async function setStock(p: Product, stock: number) {
            msg.value = "";
            try {
                await apiFetch(`/api/admin/products/${p.id}/stock`, {
                    method: "POST",
                    body: JSON.stringify({ stock })
                });
                await loadProducts();
                msg.value = "✅ 库存已更新";
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "操作失败";
            }
        }

        async function removeProduct(productId: number) {
            msg.value = "";
            if (!confirm("确定要删除这个IP文创商品吗？")) return;
            try {
                await apiFetch(`/api/admin/products/${productId}`, { method: "DELETE" });
                await loadProducts();
                msg.value = "✅ 商品已删除";
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "删除失败";
            }
        }

        async function deleteProduct(product: Product) {
            await removeProduct(product.id);
        }

        onMounted(async () => {
            auth.restore();
            await loadProducts();
        });

        return () => (
            <div class="mx-auto max-w-7xl">
                {/* 页面标题 */}
                <div class="relative overflow-hidden rounded-3xl bg-white p-8 md:p-12 mb-8 shadow-xl border-2 border-transparent bg-gradient-to-br from-white to-stone-50 before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-r before:from-purple-500 before:via-pink-500 before:to-cyan-500 before:-z-10">
                    <div class="relative z-10">
                        <button
                            type="button"
                            class="mb-6 flex items-center gap-2 text-stone-500 hover:text-purple-600 transition-colors"
                            onClick={goBack}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>返回</span>
                        </button>
                        <div class="mb-4">
                            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-2">开封IP文创</h1>
                            <p class="text-stone-600 text-lg">萌化历史，让宋朝文化走进你的生活</p>
                        </div>

                        {/* 管理员操作按钮 */}
                        {auth.isAdmin && (
                            <div class="mt-6 flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all text-sm font-medium hover:scale-105"
                                    onClick={startCreate}
                                >
                                    <span class="flex items-center gap-2">
                                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        新增IP文创
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    class="px-6 py-2.5 bg-white border-2 border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-all text-sm font-medium"
                                    onClick={() => void loadProducts()}
                                >
                                    刷新列表
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* 提示消息 */}
                {msg.value ? (
                    <div class="mb-6 rounded-xl border border-purple-200 bg-purple-50 p-4 text-sm text-purple-800 shadow-sm">
                        {msg.value}
                    </div>
                ) : null}

                {/* 管理员编辑表单 */}
                {auth.isAdmin && showCreateForm.value && (
                    <div class="bg-white rounded-2xl border-2 border-purple-200 shadow-xl p-8 mb-8">
                        <div class="flex items-center justify-between mb-6">
                            <h2 class="text-xl font-bold text-stone-900">
                                {editProduct.value ? "✏️ 编辑IP文创" : "✨ 新增IP文创"}
                            </h2>
                            <button
                                type="button"
                                class="text-stone-400 hover:text-stone-600 transition-colors"
                                onClick={cancelForm}
                            >
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div class="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-1.5">
                                    <span class="text-red-500">*</span> 商品标题
                                </label>
                                <input
                                    type="text"
                                    class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="例如：包公盲盒手办"
                                    value={newTitle.value}
                                    onInput={(e) => newTitle.value = (e.target as HTMLInputElement).value}
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-1.5">副标题</label>
                                <input
                                    type="text"
                                    class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="例如：包公故里·Q版系列"
                                    value={newSubtitle.value}
                                    onInput={(e) => newSubtitle.value = (e.target as HTMLInputElement).value}
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-1.5">分类</label>
                                <select
                                    class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={newCategory.value}
                                    onChange={(e) => newCategory.value = (e.target as HTMLSelectElement).value}
                                >
                                    <option value="">请选择分类</option>
                                    <option value="文创">文创</option>
                                    <option value="非遗">非遗</option>
                                    <option value="伴手礼">伴手礼</option>
                                    <option value="手作">手作</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-1.5">关联景点</label>
                                <input
                                    type="text"
                                    class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    placeholder="例如：清明上河园"
                                    value={newScenicSpot.value}
                                    onInput={(e) => newScenicSpot.value = (e.target as HTMLInputElement).value}
                                />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-1.5">
                                    <span class="text-red-500">*</span> 价格（分）
                                </label>
                                <input
                                    type="number"
                                    class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={newPrice.value}
                                    onInput={(e) => newPrice.value = Number((e.target as HTMLInputElement).value)}
                                />
                                <p class="mt-1 text-xs text-stone-500">例如：5900 表示 ¥59.00</p>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-stone-700 mb-1.5">
                                    <span class="text-red-500">*</span> 库存
                                </label>
                                <input
                                    type="number"
                                    class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    value={newStock.value}
                                    onInput={(e) => newStock.value = Number((e.target as HTMLInputElement).value)}
                                />
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-stone-700 mb-1.5">封面图片</label>
                            <div class="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        class="w-full px-4 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-2"
                                        placeholder="图片URL（如 /favicon.svg）"
                                        value={newCover.value}
                                        onInput={(e) => newCover.value = (e.target as HTMLInputElement).value}
                                    />
                                    <div class="text-xs text-stone-500">图片地址（外链 URL 或本地路径）</div>
                                </div>
                                <div>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        class="block w-full text-sm text-stone-600 file:mr-2 file:rounded-md file:border-0 file:bg-purple-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-purple-700 hover:file:bg-purple-100 mb-2"
                                        onChange={onCoverFileChange}
                                    />
                                    {coverFile.value ? (
                                        <button
                                            type="button"
                                            class="text-xs text-stone-500 hover:text-stone-700"
                                            onClick={clearCoverFile}
                                        >
                                            清除文件
                                        </button>
                                    ) : null}
                                    <div class="text-xs text-stone-500">或上传本地图片（JPG/PNG/GIF/WebP）</div>
                                </div>
                            </div>
                            {(coverPreview.value || newCover.value) && (
                                <div class="mt-3 flex items-start gap-3">
                                    <span class="text-sm text-stone-500">预览：</span>
                                    <img
                                        src={coverPreview.value || newCover.value}
                                        alt="封面预览"
                                        class="h-24 w-24 rounded-lg border border-stone-200 object-cover shadow-sm"
                                        onError={(e: Event) => {
                                            (e.target as HTMLImageElement).src = "/favicon.svg";
                                        }}
                                    />
                                </div>
                            )}
                        </div>

                        <div class="flex gap-3">
                            <button
                                type="button"
                                class="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-md hover:shadow-lg transition-all font-medium"
                                onClick={() => void saveProduct()}
                            >
                                {editProduct.value ? "保存修改" : "创建商品"}
                            </button>
                            <button
                                type="button"
                                class="px-6 py-2.5 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-all font-medium"
                                onClick={cancelForm}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                )}

                {/* IP文创故事 */}
                <div class="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-8">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-2xl font-bold text-stone-900">IP文创故事</h2>
                        <button
                            type="button"
                            class="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium shadow-md hover:shadow-lg"
                            onClick={() => router.push("/ip-stories")}
                        >
                            <span>查看全部</span>
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                    <div class="grid md:grid-cols-3 gap-6">

                    <div class="bg-white rounded-xl p-6 shadow-sm">
                            <h3 class="font-bold text-purple-800 mb-2 text-lg">包公IP</h3>
                            <p class="text-stone-600 leading-relaxed">
                                包拯，北宋名臣，曾任开封府尹。铁面无私、清正廉洁的包青天形象深入人心。
                                我们将其设计为Q版盲盒手办，让正义化身也能萌趣可爱。
                            </p>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-sm">
                            <h3 class="font-bold text-purple-800 mb-2 text-lg">清明娃</h3>
                            <p class="text-stone-600 leading-relaxed">
                                清明娃是清明上河园的官方IP形象，以宋代儿童为原型设计。
                                身着宋服，憨态可掬，是游客们最爱的纪念品之一。
                            </p>
                        </div>
                        <div class="bg-white rounded-xl p-6 shadow-sm">
                            <h3 class="font-bold text-purple-800 mb-2 text-lg">宋小哥</h3>
                            <p class="text-stone-600 leading-relaxed">
                                宋小哥是开封文旅的官方IP，身着宋代服饰，代表开封的宋文化特色。
                                帆布包、T恤等周边产品深受年轻人喜爱。
                            </p>
                        </div>
                    </div>
                </div>

                {/* IP分类导航 */}
                <div class="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden mb-8">
                    <div class="p-6 border-b border-stone-100">
                        <h2 class="text-lg font-bold text-stone-900 mb-4">IP分类</h2>
                        <div class="flex flex-wrap gap-3">
                            {ipCategories.map((cat) => (
                                <button
                                    type="button"
                                    class={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                                        activeCategory.value === cat.id
                                            ? "bg-purple-600 text-white shadow-md"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                    }`}
                                    onClick={() => activeCategory.value = cat.id}
                                >
                                    {cat.name}
                                </button>
                            ))}
                        </div>
                        {ipCategories.find((c) => c.id === activeCategory.value) && (
                            <p class="mt-3 text-sm text-stone-500">
                                {ipCategories.find((c) => c.id === activeCategory.value)?.description}
                            </p>
                        )}
                    </div>
                </div>

                {/* 产品列表 */}
                {loading.value ? (
                    <div class="text-center py-12 text-stone-500">加载中...</div>
                ) : (
                    <>
                        <div class="mb-6 flex items-center justify-between">
                            <h2 class="text-xl font-bold text-stone-900">
                                {getCategoryFilter().length} 款IP文创产品
                            </h2>
                        </div>

                        {getCategoryFilter().length === 0 ? (
                            <div class="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                                <div class="text-6xl mb-4">🔍</div>
                                <p class="text-stone-500 text-lg mb-2">该分类暂无产品</p>
                                <p class="text-stone-400 text-sm">试试其他分类，或等待更多IP文创上线</p>
                                {auth.isAdmin && (
                                    <button
                                        type="button"
                                        class="mt-4 px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors text-sm font-medium"
                                        onClick={startCreate}
                                    >
                                        立即添加
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div class="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {getCategoryFilter().map((product) => (
                                    <div
                                        class="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all relative"
                                    >
                                        {/* 管理员操作按钮 */}
                                        {auth.isAdmin && (
                                            <div class="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    type="button"
                                                    class="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-purple-50 transition-colors"
                                                    onClick={() => startEdit(product)}
                                                    title="编辑"
                                                >
                                                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    type="button"
                                                    class="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                                                    onClick={() => void removeProduct(product.id)}
                                                    title="删除"
                                                >
                                                    <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}

                                        {/* 商品卡片 */}
                                        <div class="group bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-lg transition-all">
                                            {/* 商品图片 */}
                                            <div class="relative h-48 overflow-hidden bg-stone-100">
                                                <img
                                                    src={product.cover_image_url}
                                                    alt={product.title}
                                                    class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    onError={(e: Event) => {
                                                        (e.target as HTMLImageElement).src = "/favicon.svg";
                                                    }}
                                                />
                                                {product.scenic_spot && (
                                                    <div class="absolute top-3 right-3 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-xs font-medium text-stone-700">
                                                        📍 {product.scenic_spot}
                                                    </div>
                                                )}
                                                <div class={`absolute top-3 right-3 px-2 py-1 rounded-lg text-xs font-medium ${
                                                    product.status === "ON" ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-500"
                                                }`}>
                                                    {product.status === "ON" ? "上架中" : "已下架"}
                                                </div>
                                            </div>

                                            {/* 商品信息 */}
                                            <div class="p-4">
                                                <h3 class="font-bold text-stone-900 mb-1 truncate">{product.title}</h3>
                                                <p class="text-xs text-stone-500 mb-3 line-clamp-2">{product.subtitle}</p>
                                                <div class="flex items-center justify-between mb-3">
                                                    <span class="text-lg font-bold text-purple-600">{formatPrice(product.price_cents)}</span>
                                                    <span class="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded">{product.category}</span>
                                                </div>
                                                <div class="flex items-center gap-2 mb-3">
                                                    <span class="text-xs text-stone-500">库存 {product.stock}</span>
                                                </div>

                                                {/* 加入购物车按钮 */}
                                                {product.status === "ON" && product.stock > 0 && (
                                                    <button
                                                        type="button"
                                                        class="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium mb-3"
                                                        onClick={async () => {
                                                            try {
                                                                await apiFetch('/api/cart', {
                                                                    method: 'POST',
                                                                    body: JSON.stringify({
                                                                        product_id: product.id,
                                                                        qty: 1
                                                                    })
                                                                });
                                                                alert('已加入购物车');
                                                            } catch (e) {
                                                                console.error('加入购物车失败:', e);
                                                                alert('加入购物车失败，请重试');
                                                            }
                                                        }}
                                                    >
                                                        <span class="flex items-center justify-center gap-2">
                                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                                            </svg>
                                                            加入购物车
                                                        </span>
                                                    </button>
                                                )}

                                                {/* 管理员操作按钮 */}
                                                {auth.isAdmin && (
                                                    <div class="flex gap-2">
                                                        <button
                                                            type="button"
                                                            class="flex-1 px-3 py-1.5 text-xs rounded-lg transition-colors bg-stone-100 text-stone-700 hover:bg-stone-200"
                                                            onClick={() => toggleStatus(product)}
                                                        >
                                                            {product.status === "ON" ? "下架" : "上架"}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="px-3 py-1.5 text-xs rounded-lg transition-colors bg-purple-100 text-purple-700 hover:bg-purple-200"
                                                            onClick={() => startEdit(product)}
                                                        >
                                                            编辑
                                                        </button>
                                                        <button
                                                            type="button"
                                                            class="px-3 py-1.5 text-xs rounded-lg transition-colors bg-red-100 text-red-700 hover:bg-red-200"
                                                            onClick={() => deleteProduct(product)}
                                                        >
                                                            删除
                                                        </button>
                                                    </div>
                                                )}
                                            </div>


                                            {/* 管理员快捷操作 */}
                                            {auth.isAdmin && (
                                                <div class="mt-3 pt-3 border-t border-stone-100 flex gap-2">
                                                    <button
                                                        type="button"
                                                        class="flex-1 px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors text-xs font-medium"
                                                        onClick={() => void toggleStatus(product)}
                                                    >
                                                        {product.status === "ON" ? "下架" : "上架"}
                                                    </button>
                                                    <input
                                                        type="number"
                                                        class="w-16 px-2 py-1.5 border border-stone-300 rounded-lg text-xs text-center focus:ring-1 focus:ring-purple-500"
                                                        value={product.stock}
                                                        onChange={(e) => void setStock(product, Number((e.target as HTMLInputElement).value))}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}

            </div>
        );
    }
});