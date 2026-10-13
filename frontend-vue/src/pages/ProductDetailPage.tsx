import { defineComponent, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { apiFetch } from "../lib/api";
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
  image_urls_json: string;
  cultural_story?: string;
  craft_info?: string;
  specs_text?: string;
  scene_text?: string;
  description?: string;
  sales_count: number;
};

type Review = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  content?: string;
  createdAt: string;
};

export const ProductDetailPage = defineComponent({
  name: "ProductDetailPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const auth = useAuthStore();

    const loading = ref(true);
    const err = ref("");
    const product = ref<Product | null>(null);
    const reviews = ref<Review[]>([]);

    const qty = ref(1);
    const reviewRating = ref(5);
    const reviewContent = ref("");
    const msg = ref("");

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        const id = Number(route.params.id);
        product.value = await apiFetch<Product>(`/api/products/${id}`);
        reviews.value = await apiFetch<Review[]>(`/api/products/${id}/reviews`);
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    async function addToCart() {
      msg.value = "";
      if (!auth.isAuthed) {
        router.push("/login");
        return;
      }
      try {
        await apiFetch("/api/cart", {
          method: "POST",
          body: JSON.stringify({ product_id: product.value!.id, qty: qty.value })
        });
        msg.value = "已加入购物车";
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "ADD_FAILED";
      }
    }

    async function submitReview() {
      msg.value = "";
      if (!auth.isAuthed) {
        router.push("/login");
        return;
      }
      try {
        await apiFetch("/api/reviews", {
          method: "POST",
          body: JSON.stringify({
            product_id: product.value!.id,
            rating: reviewRating.value,
            content: reviewContent.value
          })
        });
        reviewContent.value = "";
        await load();
        msg.value = "评价已提交";
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "REVIEW_FAILED";
      }
    }

    onMounted(() => void load());

    return () => {
      if (loading.value) return <div class="py-20 text-center text-sm text-stone-500">正在加载好物…</div>;
      if (err.value) return <div class="py-20 text-center text-sm text-red-600">加载失败：{err.value}</div>;
      if (!product.value) return <div class="py-20 text-center text-sm text-stone-500">未找到商品</div>;

      const p = product.value;
      const badge =
          p.category?.includes("非遗") ? "wc-badge wc-badge-heritage" :
              p.category?.includes("文创") ? "wc-badge wc-badge-creative" :
                  (p.category?.includes("纪念") || p.category?.includes("伴手礼")) ? "wc-badge wc-badge-souvenir" :
                      (p.category?.includes("手作") || p.category?.includes("手工")) ? "wc-badge wc-badge-handmade" :
                          "wc-badge wc-badge-default";

      return (
          <div class="space-y-8">
            {/* 返回按钮 */}
            <button
                type="button"
                class="inline-flex items-center gap-2 text-sm text-stone-500 transition hover:text-red-800"
                onClick={() => router.back()}
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
              返回
            </button>

            <div class="grid gap-8 lg:grid-cols-2">
              {/* 左侧图片区 */}
              <div class="space-y-4">
                <div class="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg shadow-red-900/5">
                  <img src={p.cover_image_url} alt="" class="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105" />
                </div>

                {/* 文化故事和工艺信息 */}
                <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
                  <div class="mb-4 flex items-center gap-2">
                    <span class="h-5 w-1 rounded-full bg-red-800" />
                    <div class="text-base font-semibold text-stone-900">文化故事</div>
                  </div>
                  <div class="mb-6 leading-relaxed text-stone-600">{p.cultural_story || "暂无文化故事介绍"}</div>

                  <div class="mb-4 flex items-center gap-2">
                    <span class="h-5 w-1 rounded-full bg-red-800" />
                    <div class="text-base font-semibold text-stone-900">工艺信息</div>
                  </div>
                  <div class="leading-relaxed text-stone-600">{p.craft_info || "暂无工艺信息"}</div>
                </div>
              </div>

              {/* 右侧信息区 */}
              <div class="space-y-6">
                <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  {/* 商品标题 */}
                  <div class="space-y-3">
                    <div class="flex items-center gap-2">
                      <span class={badge}>{p.category || "文创"}</span>
                      <span class="text-sm text-stone-500">已售 {p.sales_count}</span>
                      <span class="text-sm text-stone-400">库存 {p.stock}</span>
                    </div>
                    <h1 class="text-2xl font-bold tracking-tight text-stone-900" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      {p.title}
                    </h1>
                    <p class="text-sm text-stone-500">{p.subtitle}</p>
                  </div>

                  {/* 价格区域 */}
                  <div class="mt-8 rounded-xl bg-gradient-to-br from-red-50 to-amber-50 px-6 py-6 ring-1 ring-red-200/50">
                    <div class="text-xs font-medium text-stone-500">售价</div>
                    <div class="mt-2 flex items-end justify-between">
                      <div class="flex items-baseline gap-1">
                      <span class="text-3xl font-bold text-red-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                        ￥{(p.price_cents / 100).toFixed(2)}
                      </span>
                      </div>
                      <div class="flex items-center gap-2">
                        <span class="text-xs text-stone-500">数量</span>
                        <input
                            type="number"
                            min="1"
                            max={p.stock}
                            class="w-16 rounded-lg border border-stone-300 bg-white px-3 py-2 text-center text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            v-model={qty.value}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 购买按钮 */}
                  <div class="mt-6 flex gap-3">
                    <button
                        type="button"
                        class="flex-1 rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                        onClick={() => void addToCart()}
                    >
                      加入购物车
                    </button>
                  </div>

                  {msg.value ? <div class="mt-4 rounded-lg bg-stone-50 p-3 text-center text-sm text-stone-600">{msg.value}</div> : null}
                </div>

                {/* 评价区域 */}
                <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div class="mb-4 flex items-center gap-2">
                    <span class="h-5 w-1 rounded-full bg-red-800" />
                    <div class="text-base font-semibold text-stone-900">买家评价</div>
                  </div>

                  <div class="space-y-3">
                    {reviews.value.length ? (
                        reviews.value.map((r) => (
                            <div key={r.id} class="rounded-xl border border-stone-100 bg-gradient-to-br from-stone-50 to-white p-4 transition hover:shadow-md">
                              <div class="flex items-center justify-between text-xs text-stone-500">
                                <div class="flex items-center gap-1">
                                  <span class="font-medium text-amber-600">{"⭐".repeat(r.rating)}</span>
                                  <span class="text-stone-400">{r.createdAt}</span>
                                </div>
                              </div>
                              {r.content && <div class="mt-2 text-sm leading-relaxed text-stone-700">{r.content}</div>}
                            </div>
                        ))
                    ) : (
                        <div class="rounded-xl border border-dashed border-stone-200 bg-stone-50/80 py-8 text-center text-sm text-stone-500">
                          暂无评价，欢迎首评～
                        </div>
                    )}
                  </div>

                  {/* 发表评价 */}
                  <div class="mt-6 rounded-xl border border-stone-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30 p-5">
                    <div class="mb-4 text-sm font-semibold text-stone-900">分享你的体验</div>
                    <div class="space-y-3">
                      <div class="flex items-center gap-3">
                        <label class="text-xs text-stone-500">评分</label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            class="w-20 rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                            v-model={reviewRating.value}
                        />
                      </div>
                      <textarea
                          rows={3}
                          class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                          v-model={reviewContent.value}
                          placeholder="分享一下使用体验（可选）"
                      />
                      <button
                          type="button"
                          class="rounded-lg bg-red-800 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-900"
                          onClick={() => void submitReview()}
                      >
                        提交评价
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
      );
    };
  }
});