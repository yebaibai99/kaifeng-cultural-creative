import { defineComponent, onMounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { apiFetch } from "../lib/api";

type Order = {
  id: number;
  totalCents: number;
  status: string;
  refundStatus?: string;
  createdAt: string;
};

export const OrdersPage = defineComponent({
  name: "OrdersPage",
  setup() {
    const loading = ref(true);
    const err = ref("");
    const msg = ref("");
    const orders = ref<Order[]>([]);

    const showRefundModal = ref(false);
    const refundOrderId = ref(0);
    const refundReason = ref("");
    const refundAmount = ref("");
    const refundSubmitting = ref(false);

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        orders.value = await apiFetch<Order[]>("/api/orders");
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    async function pay(id: number) {
      msg.value = "";
      try {
        await apiFetch(`/api/orders/${id}/pay`, { method: "POST" });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "PAY_FAILED";
      }
    }

    function openRefundModal(order: Order) {
      refundOrderId.value = order.id;
      refundReason.value = "";
      refundAmount.value = String((order.totalCents / 100).toFixed(2));
      showRefundModal.value = true;
    }

    function closeRefundModal() {
      showRefundModal.value = false;
      refundOrderId.value = 0;
      refundReason.value = "";
      refundAmount.value = "";
      refundSubmitting.value = false;
    }

    async function submitRefund() {
      if (!refundReason.value.trim()) {
        msg.value = "请填写退款原因";
        return;
      }
      const amount = parseFloat(refundAmount.value);
      if (isNaN(amount) || amount <= 0) {
        msg.value = "请输入正确的退款金额";
        return;
      }
      refundSubmitting.value = true;
      try {
        const order = orders.value.find((o) => o.id === refundOrderId.value);
        if (!order) {
          msg.value = "订单不存在";
          refundSubmitting.value = false;
          return;
        }
        const maxAmount = order.totalCents / 100;
        if (amount > maxAmount) {
          msg.value = `退款金额不能超过订单总额 ￥${maxAmount.toFixed(2)}`;
          refundSubmitting.value = false;
          return;
        }
        await apiFetch(`/api/orders/${refundOrderId.value}/refund`, {
          method: "POST",
          body: JSON.stringify({
            reason: refundReason.value.trim(),
            amountCents: Math.round(amount * 100),
          }),
        });
        msg.value = "退款申请已提交，请等待审核";
        closeRefundModal();
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "REFUND_FAILED";
      } finally {
        refundSubmitting.value = false;
      }
    }

    function refundStatusLabel(status?: string): string {
      switch (status) {
        case "PENDING":
          return "退款审核中";
        case "APPROVED":
          return "退款已通过";
        case "REJECTED":
          return "退款已驳回";
        default:
          return "";
      }
    }

    function canRefund(order: Order): boolean {
      return (
          (order.status === "PAID" || order.status === "SHIPPED" || order.status === "RECEIVED") &&
          (order.refundStatus === undefined || order.refundStatus === "NONE" || order.refundStatus === "REJECTED")
      );
    }

    onMounted(() => void load());

    return () => (
        <div class="space-y-6">
          {/* 退款申请弹窗 */}
          {showRefundModal.value && (
              <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => closeRefundModal()} />
                <div class="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                  <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-center">
                    <div class="text-xs tracking-[0.3em] text-stone-400">退款申请</div>
                    <div class="mt-2 text-xl font-bold text-white tracking-[0.1em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      申请退款
                    </div>
                  </div>

                  <div class="p-6 space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">
                        <span class="text-red-500">*</span> 退款原因
                      </label>
                      <textarea
                          class="wc-input h-24 resize-none"
                          placeholder="请说明退款原因（如：商品质量问题、不想要了等）"
                          value={refundReason.value}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLTextAreaElement;
                            refundReason.value = target.value;
                          }}
                      />
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-1">
                        <span class="text-red-500">*</span> 退款金额
                      </label>
                      <div class="relative">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">￥</span>
                        <input
                            type="number"
                            step="0.01"
                            class="wc-input pl-8"
                            placeholder="请输入退款金额"
                            value={refundAmount.value}
                            onInput={(e: Event) => {
                              const target = e.target as HTMLInputElement;
                              refundAmount.value = target.value;
                            }}
                        />
                      </div>
                      <p class="mt-1 text-xs text-stone-400">退款金额不能超过订单总额</p>
                    </div>
                  </div>

                  <div class="px-6 pb-6 flex gap-3">
                    <button
                        type="button"
                        class="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                        onClick={() => closeRefundModal()}
                        disabled={refundSubmitting.value}
                    >
                      取消
                    </button>
                    <button
                        type="button"
                        class={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${
                            refundReason.value.trim() && refundAmount.value
                                ? "bg-gradient-to-r from-red-900 via-red-800 to-amber-700 shadow-red-900/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                                : "cursor-not-allowed bg-stone-300 opacity-60"
                        }`}
                        onClick={() => submitRefund()}
                        disabled={!refundReason.value.trim() || !refundAmount.value || refundSubmitting.value}
                    >
                      {refundSubmitting.value ? (
                          <span class="flex items-center justify-center gap-2">
                      <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      提交中…
                    </span>
                      ) : (
                          "提交申请"
                      )}
                    </button>
                  </div>
                </div>
              </div>
          )}

          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="h-6 w-1 rounded-full bg-red-800" />
              <div>
                <h1 class="text-xl font-bold text-stone-900">我的订单</h1>
                <p class="mt-1 text-sm text-stone-500">查看订单状态，待支付订单可点击「去支付」模拟付款</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-2 mb-4">
              <div class="flex items-center gap-2">
                <span class="text-base font-semibold text-stone-900">订单列表</span>
                <span class="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600">
                {orders.value.length} 笔
              </span>
              </div>
              <button
                  type="button"
                  class="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50"
                  onClick={() => void load()}
              >
                刷新
              </button>
            </div>

            {loading.value ? (
                <div class="py-20 text-center text-sm text-stone-500">加载中…</div>
            ) : err.value ? (
                <div class="py-20 text-center text-sm text-red-600">加载失败：{err.value}</div>
            ) : orders.value.length === 0 ? (
                <div class="py-20 text-center">
                  <div class="text-lg font-semibold text-stone-900">暂无订单</div>
                  <div class="mt-2 text-sm text-stone-500">快去挑选心仪的好物吧</div>
                  <RouterLink
                      to="/"
                      class="mt-6 inline-flex rounded-xl bg-red-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-red-900"
                  >
                    去逛逛
                  </RouterLink>
                </div>
            ) : (
                <div class="space-y-3">
                  {orders.value.map((o) => (
                      <RouterLink
                          key={o.id}
                          to={`/orders/${o.id}`}
                          class="block rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-4 transition hover:border-red-200 hover:shadow-md"
                      >
                        <div class="flex items-center justify-between gap-2">
                          <div class="text-sm font-semibold text-stone-900">订单 #{o.id}</div>
                          <div class="text-xs text-stone-400">{o.createdAt}</div>
                        </div>
                        <div class="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                          <div class="flex items-center gap-2">
                      <span class="text-stone-600">
                        状态：<span class="inline-flex rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-700">{o.status}</span>
                      </span>
                            {o.refundStatus && o.refundStatus !== "NONE" && (
                                <span class={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    o.refundStatus === "PENDING"
                                        ? "bg-amber-100 text-amber-700"
                                        : o.refundStatus === "APPROVED"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                }`}>
                          {refundStatusLabel(o.refundStatus)}
                        </span>
                            )}
                          </div>
                          <div class="text-lg font-bold text-red-800">￥{(o.totalCents / 100).toFixed(2)}</div>
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2" onClick={(e) => e.preventDefault()}>
                          {o.status === "CREATED" ? (
                              <button
                                  type="button"
                                  class="rounded-lg bg-gradient-to-r from-red-900 via-red-800 to-amber-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:scale-[1.02]"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    void pay(o.id);
                                  }}
                              >
                                去支付（模拟）
                              </button>
                          ) : null}
                          {canRefund(o) ? (
                              <button
                                  type="button"
                                  class="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-medium text-amber-700 transition hover:bg-amber-100"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    openRefundModal(o);
                                  }}
                              >
                                申请退款
                              </button>
                          ) : null}
                        </div>
                      </RouterLink>
                  ))}
                </div>
            )}

            {msg.value ? <div class="mt-4 rounded-lg bg-stone-50 p-3 text-center text-sm text-stone-600">{msg.value}</div> : null}
          </div>
        </div>
    );
  }
});