import { defineComponent, onMounted, ref } from "vue";
import { apiFetch } from "../lib/api";
import { RouterLink } from "vue-router";

type CartItem = { id: number; userId: number; productId: number; qty: number };
type Product = { id: number; title: string; cover_image_url: string; price_cents: number; stock: number };

export const CartPage = defineComponent({
  name: "CartPage",
  setup() {
    const loading = ref(true);
    const err = ref("");
    const msg = ref("");
    const items = ref<(CartItem & { product?: Product })[]>([]);

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        const cart = await apiFetch<CartItem[]>("/api/cart");
        const ps = await Promise.all(
            cart.map((ci) => apiFetch<Product>(`/api/products/${ci.productId}`).catch(() => null))
        );
        items.value = cart.map((ci, idx) => ({ ...ci, product: ps[idx] || undefined }));
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    function totalCents() {
      return items.value.reduce((sum, it) => sum + (it.product?.price_cents || 0) * it.qty, 0);
    }

    async function setQty(it: CartItem, qty: number) {
      msg.value = "";
      try {
        await apiFetch("/api/cart", { method: "PATCH", body: JSON.stringify({ product_id: it.productId, qty }) });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "UPDATE_FAILED";
      }
    }

    async function remove(productId: number) {
      msg.value = "";
      try {
        await apiFetch(`/api/cart/${productId}`, { method: "DELETE" });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "REMOVE_FAILED";
      }
    }

    async function clear() {
      msg.value = "";
      try {
        await apiFetch("/api/cart", { method: "DELETE" });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "CLEAR_FAILED";
      }
    }

    onMounted(() => void load());

    return () => (
        <div class="space-y-6">
          {/* 页面标题 */}
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="h-6 w-1 rounded-full bg-red-800" />
              <div>
                <h1 class="text-xl font-bold text-stone-900">
                  购物车
                </h1>
                <p class="mt-1 text-sm text-stone-500">核对数量与金额后去结算</p>
              </div>
            </div>
          </div>

          {/* 商品列表 */}
          <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold text-stone-900">已选商品</span>
                <span class="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                {items.value.length} 件
              </span>
              </div>
              <div class="flex items-center gap-2">
                <button type="button" class="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50" onClick={() => void load()}>
                  刷新
                </button>
                <button type="button" class="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-500 transition hover:bg-stone-50" onClick={() => void clear()}>
                  清空
                </button>
              </div>
            </div>

            {loading.value ? (
                <div class="py-20 text-center text-sm text-stone-500">加载中…</div>
            ) : err.value ? (
                <div class="py-20 text-center text-sm text-red-600">加载失败：{err.value}</div>
            ) : items.value.length === 0 ? (
                <div class="py-20 text-center">
                  <div class="text-lg font-semibold text-stone-900">购物车空空如也～</div>
                  <div class="mt-2 text-sm text-stone-500">快去挑选心仪的好物吧</div>
                  <RouterLink to="/" class="mt-6 inline-flex rounded-xl bg-red-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-900">
                    去逛逛
                  </RouterLink>
                </div>
            ) : (
                <div class="space-y-4">
                  {items.value.map((it) => (
                      <div
                          key={it.id}
                          class="flex flex-col gap-4 rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-4 transition hover:shadow-md sm:flex-row sm:items-center"
                      >
                        <img
                            src={it.product?.cover_image_url}
                            alt=""
                            class="h-24 w-24 shrink-0 rounded-lg border border-stone-200 object-cover shadow-sm"
                        />
                        <div class="min-w-0 flex-1">
                          <div class="font-semibold text-stone-900">{it.product?.title}</div>
                          <div class="mt-1 text-sm text-stone-500">
                            单价：￥{((it.product?.price_cents || 0) / 100).toFixed(2)}
                          </div>
                          <div class="mt-2 flex items-center gap-3">
                            <div class="flex items-center gap-2">
                              <span class="text-xs text-stone-500">数量</span>
                              <input
                                  type="number"
                                  min="1"
                                  max={it.product?.stock || 999}
                                  class="w-16 rounded border border-stone-300 bg-white px-2 py-1 text-center text-sm outline-none focus:border-red-800"
                                  value={it.qty}
                                  onChange={(e) => void setQty(it, Number((e.target as HTMLInputElement).value))}
                              />
                            </div>
                            <button
                                type="button"
                                class="text-xs text-stone-400 underline decoration-stone-300 transition hover:text-red-800 hover:decoration-red-800"
                                onClick={() => void remove(it.productId!)}
                            >
                              删除
                            </button>
                          </div>
                        </div>
                        <div class="text-right">
                          <div class="text-lg font-bold text-red-800">
                            ￥{(((it.product?.price_cents || 0) * it.qty) / 100).toFixed(2)}
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {items.value.length > 0 && (
                <div class="mt-6 flex flex-col items-center justify-between gap-4 border-t border-stone-200 pt-6 sm:flex-row">
                  <div class="text-sm text-stone-600">
                    共 <span class="font-semibold text-stone-900">{items.value.reduce((sum, it) => sum + it.qty, 0)}</span> 件商品
                  </div>
                  <div class="flex items-center gap-4">
                    <div class="text-xl font-bold text-stone-900">
                      合计：<span class="text-2xl text-red-800">￥{(totalCents() / 100).toFixed(2)}</span>
                    </div>
                    <RouterLink
                        to="/checkout"
                        class="rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                    >
                      去结算
                    </RouterLink>
                  </div>
                </div>
            )}

            {msg.value ? <div class="mt-4 rounded-lg bg-stone-50 p-3 text-center text-sm text-stone-600">{msg.value}</div> : null}
          </div>
        </div>
    );
  }
});