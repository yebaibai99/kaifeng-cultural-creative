import { defineComponent, ref } from "vue";
import { apiFetch } from "../lib/api";
import { useRouter } from "vue-router";

type Order = { id: number };

export const CheckoutPage = defineComponent({
  name: "CheckoutPage",
  setup() {
    const router = useRouter();
    const buyerName = ref("张三");
    const buyerPhone = ref("13800000000");
    const buyerAddress = ref("河南省开封市（示例地址）");
    const msg = ref("");
    const submitting = ref(false);

    async function submit() {
      msg.value = "";
      submitting.value = true;
      try {
        const o = await apiFetch<Order>("/api/orders", {
          method: "POST",
          body: JSON.stringify({
            buyer_name: buyerName.value.trim(),
            buyer_phone: buyerPhone.value.trim(),
            buyer_address: buyerAddress.value.trim()
          })
        });
        router.push(`/orders/${o.id}`);
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "CREATE_ORDER_FAILED";
      } finally {
        submitting.value = false;
      }
    }


    return () => (
        <div class="mx-auto max-w-2xl space-y-6">
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="h-6 w-1 rounded-full bg-red-800" />
              <div>
                <h1 class="text-xl font-bold text-stone-900">确认订单</h1>
                <p class="mt-1 text-sm text-stone-500">填写收货信息，提交后生成订单（演示：下单即扣库存）</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="grid gap-5">
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">
                  <span class="text-red-500">*</span> 收货人
                </div>
                <input
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    v-model={buyerName.value}
                    autocomplete="name"
                />
              </div>
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">
                  <span class="text-red-500">*</span> 手机号
                </div>
                <input
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    v-model={buyerPhone.value}
                    autocomplete="tel"
                    inputmode="tel"
                />
              </div>
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">
                  <span class="text-red-500">*</span> 详细地址
                </div>
                <textarea
                    rows={3}
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100 resize-none"
                    v-model={buyerAddress.value}
                />
              </div>

              <button
                  type="button"
                  class="mt-2 w-full rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 py-3 text-base font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting.value}
                  onClick={() => void submit()}
              >
                {submitting.value ? "提交中…" : "提交订单"}
              </button>

              {msg.value ? <div class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{msg.value}</div> : null}
            </div>
          </div>
        </div>
    );
  }
});
