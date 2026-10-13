import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";

type Product = {
    id: number;
    title: string;
    subtitle: string;
    category: string;
    price_cents: number;
    cover_image_url: string;
    cultural_story?: string;
    craft_info?: string;
    scenic_spot?: string;
};

export const IPStoriesPage = defineComponent({
    name: "IPStoriesPage",
    setup() {
        const router = useRouter();
        const products = ref<Product[]>([]);
        const loading = ref(true);

        async function loadProducts() {
            loading.value = true;
            try {
                const data = await apiFetch<any>("/api/products?page=0&size=100");
                const allProducts: Product[] = (data.items || []).filter(
                    (p: Product) => p.cultural_story || p.craft_info
                );
                products.value = allProducts;
            } catch (e) {
                console.error("加载产品失败:", e);
            } finally {
                loading.value = false;
            }
        }

        onMounted(() => void loadProducts());

        return () => (
            <div class="min-h-screen bg-stone-50 pb-12">
                {/* 顶部横幅 */}
                <div class="bg-white shadow-sm border-b border-stone-200">
                    <div class="max-w-7xl mx-auto px-4 py-4">
                        <button
                            type="button"
                            class="flex items-center gap-2 text-stone-500 hover:text-purple-600 transition-colors mb-4"
                            onClick={() => router.push("/ip-products")}
                        >
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                            </svg>
                            <span>返回IP文创</span>
                        </button>
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center shadow-lg">
                                <span class="text-3xl">📖</span>
                            </div>
                            <div>
                                <h1 class="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                                    文创故事全集
                                </h1>
                                <p class="text-stone-500 text-sm mt-1">探索每件文创背后的文化故事与匠心工艺</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 内容区域 */}
                <div class="max-w-7xl mx-auto px-4 mt-8">
                    {loading.value ? (
                        <div class="text-center py-20">
                            <div class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                            <p class="mt-4 text-stone-500">加载故事中...</p>
                        </div>
                    ) : products.value.length === 0 ? (
                        <div class="text-center py-20 bg-white rounded-2xl border border-stone-200">
                            <div class="text-6xl mb-4">📚</div>
                            <p class="text-stone-500 text-lg">暂无文创故事</p>
                        </div>
                    ) : (
                        <div class="space-y-8">
                            {products.value.map((product) => (
                                <div class="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                    <div class="md:flex">
                                        {/* 产品图片 */}
                                        <div class="md:w-64 h-48 md:h-auto bg-stone-100 flex-shrink-0">
                                            <img
                                                src={product.cover_image_url}
                                                alt={product.title}
                                                class="w-full h-full object-cover"
                                                onError={(e: Event) => {
                                                    (e.target as HTMLImageElement).src = "/favicon.svg";
                                                }}
                                            />
                                        </div>

                                        {/* 产品信息 */}
                                        <div class="p-6 flex-1">
                                            <div class="mb-4">
                                                <div class="flex items-center gap-2 mb-2">
                                                    <span
                                                        class="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-md font-medium">
                                                        {product.category}
                                                    </span>
                                                    {product.scenic_spot && (
                                                        <span
                                                            class="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-md">
                                                            📍 {product.scenic_spot}
                                                        </span>
                                                    )}
                                                </div>
                                                <h2 class="text-xl font-bold text-stone-900">{product.title}</h2>
                                                <p class="text-sm text-stone-500 mt-1">{product.subtitle}</p>
                                            </div>


                                            {/* 文化故事 */}
                                            {product.cultural_story && (
                                                <div class="mb-4">
                                                    <h3 class="flex items-center gap-2 text-base font-bold text-stone-900 mb-2">
                                                        <span class="w-1 h-4 bg-purple-600 rounded-full"></span>
                                                        文化故事
                                                    </h3>
                                                    <p class="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                                                        {product.cultural_story}
                                                    </p>
                                                </div>
                                            )}

                                            {/* 工艺信息 */}
                                            {product.craft_info && (
                                                <div>
                                                    <h3 class="flex items-center gap-2 text-base font-bold text-stone-900 mb-2">
                                                        <span class="w-1 h-4 bg-red-600 rounded-full"></span>
                                                        工艺信息
                                                    </h3>
                                                    <p class="text-stone-600 text-sm leading-relaxed whitespace-pre-line">
                                                        {product.craft_info}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 统计信息 */}
                    {!loading.value && products.value.length > 0 && (
                        <div class="mt-8 text-center text-sm text-stone-400">
                            共 {products.value.length} 件文创产品有故事
                        </div>
                    )}
                </div>
            </div>
        );
    }
});