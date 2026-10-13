import { defineComponent, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { apiFetch } from "../lib/api";

export const HomePage = defineComponent({
  name: "HomePage",
  setup() {
    const loading = ref(true);
    const err = ref("");
    const categories = ref<{ id: number; name: string }[]>([]);

    const page = ref(0);
    const size = ref(12);
    const total = ref(0);

    const filterCategory = ref("");
    const filterSort = ref<"" | "newest" | "price_asc" | "price_desc" | "sales_desc">("newest");
    const keyword = ref("");

    const products = ref<
        {
          id: number;
          title: string;
          subtitle: string;
          category: string;
          price_cents: number;
          stock: number;
          cover_image_url: string;
        }[]
    >([]);

    function buildQuery() {
      const params = new URLSearchParams();
      params.set("page", String(page.value));
      params.set("size", String(size.value));
      if (filterCategory.value) params.set("category", filterCategory.value);
      if (keyword.value.trim()) params.set("q", keyword.value.trim());
      if (filterSort.value) params.set("sort", filterSort.value);
      return params.toString();
    }

    async function loadCategories() {
      try {
        const data = await apiFetch<{ id: number; name: string }[]>("/api/categories/root");
        categories.value = data || [];
      } catch {
        categories.value = [];
      }
    }

    async function load() {
      loading.value = true;
      err.value = "";
      try {
        const res = await apiFetch<{ items: any[]; page: number; size: number; total: number }>(`/api/products?${buildQuery()}`);
        products.value = res.items;
        total.value = res.total ?? 0;
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }


    function totalPages() {
      return Math.max(1, Math.ceil((total.value || 0) / size.value));
    }

    async function applyFilters(resetPage = true) {
      if (resetPage) page.value = 0;
      await load();
    }

    async function goPrev() {
      if (page.value <= 0) return;
      page.value -= 1;
      await load();
    }

    async function goNext() {
      if (page.value + 1 >= totalPages()) return;
      page.value += 1;
      await load();
    }

    onMounted(() => {
      void loadCategories();
      void load();
    });



    const categoryDescriptions: Record<string, string> = {
      "非遗": "Intangible Cultural Heritage",
      "文创": "Cultural & Creative Products",
      "伴手礼": "Souvenirs & Gifts",
      "手作": "Handmade Crafts"
    };

    return () => (
        <div class="space-y-0">
          {/* 顶部横幅 Banner */}
          <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <div class="absolute inset-0 opacity-20">
              <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-red-900/30 blur-3xl" />
              <div class="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-amber-900/20 blur-3xl" />
            </div>
            <div class="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
              <div class="text-center">
                <h1 class="text-4xl font-bold tracking-[0.2em] md:text-5xl lg:text-6xl" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  开封文创
                </h1>
                <p class="mx-auto mt-4 max-w-2xl text-sm tracking-[0.3em] text-stone-300 md:text-base">
                  汴梁风物 · 宋韵雅集
                </p>
                <div class="mt-6 flex justify-center gap-2 text-xs text-stone-400">
                  <span>THE SERIES OF KAIFENG CULTURAL PRODUCTS</span>
                </div>
              </div>
            </div>
          </section>

          {/* 分类导航区 */}
          <section class="border-b border-stone-200 bg-white/80 backdrop-blur">
            <div class="mx-auto max-w-6xl px-4 py-8">
              <div class="grid grid-cols-4 gap-4 md:gap-6 lg:gap-8">
                {categories.value.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => {
                          filterCategory.value = cat.name === filterCategory.value ? "" : cat.name;
                          void applyFilters(true);
                        }}
                        class={`group flex flex-col items-center gap-3 transition-all duration-300 hover:scale-105 ${
                            filterCategory.value === cat.name ? "scale-105" : ""
                        }`}
                    >
                      <div class={`relative flex h-24 w-full max-w-[140px] flex-col items-center justify-center overflow-hidden rounded-lg border-2 transition-all duration-300 md:h-32 ${
                          filterCategory.value === cat.name
                              ? "border-red-800 bg-red-50/50 shadow-lg shadow-red-900/10"
                              : "border-stone-200 bg-stone-50/50 hover:border-red-300 hover:shadow-md"
                      }`}>

                        {/* 分类名称 */}
                        <div class={`text-center transition-all ${
                            filterCategory.value === cat.name
                                ? "text-lg font-bold text-red-900"
                                : "text-base font-medium text-stone-900 group-hover:text-red-800"
                        }`}>
                          {cat.name}
                        </div>
                        {/* 英文描述 */}
                        <div class="mt-1 text-[10px] uppercase tracking-wider text-stone-700">
                          {categoryDescriptions[cat.name] || "Cultural Products"}
                        </div>
                      </div>
                    </button>
                ))}
              </div>
            </div>
          </section>

          {/* 商品列表区 */}
          <section class="bg-gradient-to-b from-white via-stone-50/50 to-stone-100/30 py-8">
            <div class="mx-auto max-w-6xl px-4">
              {/* 筛选工具栏 */}
              <div class="mb-6 rounded-xl border border-stone-200 bg-white/90 p-4 shadow-sm backdrop-blur">
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div class="flex flex-wrap items-center gap-3">
                    <div class="flex items-center gap-2">
                      <span class="h-5 w-1 rounded-full bg-red-800" />
                      <span class="text-sm font-semibold text-stone-900">精选好物</span>
                    </div>
                    {filterCategory.value && (
                        <span class="rounded-full bg-red-50 px-3 py-1 text-xs text-red-800 ring-1 ring-red-200">
                      {filterCategory.value}
                    </span>
                    )}
                  </div>

                  <div class="flex flex-wrap items-center gap-3">
                    <div class="w-full md:w-auto">
                      <select
                          class="wc-input py-2 text-xs"
                          value={filterSort.value}
                          onChange={(e) => {
                            filterSort.value = (e.target as HTMLSelectElement).value as any;
                            void applyFilters(true);
                          }}
                      >
                        <option value="newest">最新上架</option>
                        <option value="price_asc">价格从低到高</option>
                        <option value="price_desc">价格从高到低</option>
                        <option value="sales_desc">销量从高到低</option>
                      </select>
                    </div>
                    <div class="relative w-full md:w-64">
                      <input
                          class="wc-input py-2 pl-3 pr-10 text-xs"
                          value={keyword.value}
                          placeholder="搜索好物…"
                          onInput={(e) => (keyword.value = (e.target as HTMLInputElement).value)}
                          onKeyup={(e) => {
                            if ((e as KeyboardEvent).key === "Enter") void applyFilters(true);
                          }}
                      />
                      <button
                          class="absolute right-1 top-1/2 -translate-y-1/2 rounded p-1 text-stone-400 hover:bg-stone-100 hover:text-red-800"
                          onClick={() => void applyFilters(true)}
                      >
                        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 商品网格 */}
              {loading.value ? (
                  <div class="py-20 text-center">
                    <div class="text-sm text-stone-500">正在加载好物…</div>
                  </div>
              ) : err.value ? (
                  <div class="py-20 text-center">
                    <div class="text-sm text-red-600">加载失败：{err.value}</div>
                  </div>
              ) : products.value.length === 0 ? (
                  <div class="py-20 text-center">
                    <div class="text-lg font-semibold text-stone-900">暂无相关商品</div>
                    <div class="mt-2 text-sm text-stone-500">试试其他分类或关键词吧</div>
                  </div>
              ) : (
                  <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.value.map((p) => (
                        <RouterLink
                            key={p.id}
                            to={`/products/${p.id}`}
                            class="group flex flex-col overflow-hidden rounded-xl border border-stone-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-900/5"
                        >
                          <div class="relative aspect-[4/3] overflow-hidden bg-stone-100">
                            <img
                                src={p.cover_image_url}
                                alt=""
                                class="h-full w-full object-cover transition-all duration-500 group-hover:scale-110"
                            />
                            <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                            <div class="absolute left-2 top-2 rounded bg-black/60 px-2 py-1 text-[10px] font-medium text-white backdrop-blur-sm ring-1 ring-white/20">
                              {p.category || "文创"}
                            </div>
                          </div>
                          <div class="flex flex-1 flex-col p-4">
                            <div class="line-clamp-2 min-h-[2.5rem] text-base font-semibold leading-snug text-stone-900 group-hover:text-red-900">
                              {p.title}
                            </div>
                            <div class="mt-1 line-clamp-1 text-xs text-stone-500">{p.subtitle}</div>
                            <div class="mt-auto flex items-end justify-between gap-2 pt-3">
                              <div>
                                <div class="text-xs text-stone-400">售价</div>
                                <div class="text-lg font-bold text-red-800">
                                  <span class="text-sm font-semibold">￥</span>
                                  {(p.price_cents / 100).toFixed(2)}
                                </div>
                              </div>
                              <div class="text-right text-[11px] text-stone-400">库存 {p.stock}</div>
                            </div>
                          </div>
                        </RouterLink>
                    ))}
                  </div>
              )}

              {/* 分页 */}
              {products.value.length > 0 && (
                  <div class="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
                    <div class="text-xs text-stone-500">
                      共 <span class="font-medium text-stone-800">{total.value}</span> 件商品 · 第{" "}
                      <span class="font-medium text-stone-800">{page.value + 1}</span> /{" "}
                      <span class="font-medium text-stone-800">{totalPages()}</span> 页
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                          class="wc-btn wc-btn-ghost px-4 py-2 text-xs disabled:opacity-50"
                          disabled={page.value <= 0}
                          onClick={() => void goPrev()}
                      >
                        上一页
                      </button>
                      <button
                          class="wc-btn wc-btn-ghost px-4 py-2 text-xs disabled:opacity-50"
                          disabled={page.value + 1 >= totalPages()}
                          onClick={() => void goNext()}
                      >
                        下一页
                      </button>
                    </div>
                  </div>
              )}
            </div>
          </section>
        </div>
    );
  }
});
