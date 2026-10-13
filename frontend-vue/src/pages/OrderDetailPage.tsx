import { defineComponent, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { apiFetch } from "../lib/api";

type Order = {
  id: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  totalCents: number;
  status: string;
  refundStatus?: string;
  refundReason?: string;
  refundAmountCents?: number;
  refundAppliedAt?: string;
  refundRemark?: string;
  createdAt: string;
};

type Item = { id: number; productId: number; title: string; priceCents: number; qty: number };

export const OrderDetailPage = defineComponent({
  name: "OrderDetailPage",
  setup() {
    const route = useRoute();
    const loading = ref(true);
    const err = ref("");
    const msg = ref("");
    const order = ref<Order | null>(null);
    const items = ref<Item[]>([]);

    const showPaymentModal = ref(false);
    const selectedPayment = ref<"" | "wechat" | "alipay">("");
    const paymentProcessing = ref(false);

    const showRefundModal = ref(false);
    const refundReason = ref("");
    const refundAmount = ref("");
    const refundSubmitting = ref(false);

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        const id = Number(route.params.id);
        // 检查当前路由是否包含 /admin/orders
        const isAdminRoute = route.fullPath.startsWith('/admin/orders');
        const apiPath = isAdminRoute ? `/api/admin/orders/${id}` : `/api/orders/${id}`;
        const res = await apiFetch<{ order: Order; items: Item[] }>(apiPath);
        order.value = res.order;
        items.value = res.items;
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    async function pay() {
      if (!order.value) return;
      msg.value = "";
      try {
        await apiFetch(`/api/orders/${order.value.id}/pay`, { method: "POST" });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "PAY_FAILED";
      }
    }

    function openPaymentModal() {
      if (!order.value) return;
      showPaymentModal.value = true;
      selectedPayment.value = "";
    }

    function closePaymentModal() {
      showPaymentModal.value = false;
      selectedPayment.value = "";
      paymentProcessing.value = false;
    }

    async function confirmPayment() {
      if (!selectedPayment.value) {
        msg.value = "请选择支付方式";
        return;
      }
      paymentProcessing.value = true;
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        await pay();
        closePaymentModal();
        msg.value = selectedPayment.value === "wechat" ? "微信支付成功！" : "支付宝支付成功！";
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "PAY_FAILED";
        paymentProcessing.value = false;
      }
    }

    function openRefundModal() {
      if (!order.value) return;
      refundReason.value = "";
      refundAmount.value = String((order.value.totalCents / 100).toFixed(2));
      showRefundModal.value = true;
    }

    function closeRefundModal() {
      showRefundModal.value = false;
      refundReason.value = "";
      refundAmount.value = "";
      refundSubmitting.value = false;
    }

    async function submitRefund() {
      if (!order.value) return;
      if (!refundReason.value.trim()) {
        msg.value = "请填写退款原因";
        return;
      }
      const amount = parseFloat(refundAmount.value);
      if (isNaN(amount) || amount <= 0) {
        msg.value = "请输入正确的退款金额";
        return;
      }
      const maxAmount = order.value.totalCents / 100;
      if (amount > maxAmount) {
        msg.value = `退款金额不能超过订单总额 ￥${maxAmount.toFixed(2)}`;
        return;
      }
      refundSubmitting.value = true;
      try {
        await apiFetch(`/api/orders/${order.value.id}/refund`, {
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

    function canRefund(): boolean {
      if (!order.value) return false;
      const o = order.value;
      return (
          (o.status === "PAID" || o.status === "SHIPPED" || o.status === "RECEIVED") &&
          (!o.refundStatus || o.refundStatus === "NONE" || o.refundStatus === "REJECTED")
      );
    }

    async function receive() {
      if (!order.value) return;
      msg.value = "";
      try {
        await apiFetch(`/api/orders/${order.value.id}/receive`, { method: "POST" });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "RECEIVE_FAILED";
      }
    }

    async function cancel() {
      if (!order.value) return;
      msg.value = "";
      try {
        await apiFetch(`/api/orders/${order.value.id}/cancel`, { method: "POST" });
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "CANCEL_FAILED";
      }
    }

    onMounted(() => void load());

    return () => {
      if (loading.value) return <div class="py-20 text-center text-sm text-stone-500">加载中…</div>;
      if (err.value) return <div class="py-20 text-center text-sm text-red-600">加载失败：{err.value}</div>;
      if (!order.value) return <div class="py-20 text-center text-sm text-stone-500">未找到订单</div>;

      const o = order.value;
      return (
          <div class="space-y-6">
            {/* 支付方式弹窗 */}
            {showPaymentModal.value && (
                <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <div
                      class="absolute inset-0 bg-black/50 backdrop-blur-sm"
                      onClick={() => closePaymentModal()}
                  />
                  <div class="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
                    <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-center">
                      <div class="text-xs tracking-[0.3em] text-stone-400">选择支付方式</div>
                      <div class="mt-2 text-xl font-bold text-white tracking-[0.1em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                        订单支付
                      </div>
                      <div class="mt-2 text-lg font-bold text-amber-400">
                        ￥{(o.totalCents / 100).toFixed(2)}
                      </div>
                    </div>

                    <div class="p-6">
                      <div class="space-y-3">
                        <button
                            type="button"
                            class={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                selectedPayment.value === "wechat"
                                    ? "border-green-600 bg-green-50 shadow-md"
                                    : "border-stone-200 bg-white hover:border-green-300 hover:bg-green-50/50"
                            }`}
                            onClick={() => (selectedPayment.value = "wechat")}
                        >
                          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white">
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.06 4.178c-3.876 0-7.016 2.59-7.016 5.785 0 3.197 3.14 5.785 7.016 5.785a9.02 9.02 0 0 0 2.276-.314.644.644 0 0 1 .54.074l1.474.862a.253.253 0 0 0 .127.042.227.227 0 0 0 .224-.228c0-.056-.023-.11-.037-.165l-.303-1.148a.455.455 0 0 1 .165-.515C21.028 19.362 22 17.575 22 15.532c0-3.597-3.14-6.188-7.016-6.188l-.326.023zm-1.866 3.476c.498 0 .902.41.902.914a.908.908 0 0 1-.902.913.908.908 0 0 1-.902-.913c0-.504.404-.914.902-.914zm3.732 0c.498 0 .902.41.902.914a.908.908 0 0 1-.902.913.908.908 0 0 1-.902-.913c0-.504.404-.914.902-.914z" />
                            </svg>
                          </div>
                          <div class="flex-1 text-left">
                            <div class="text-base font-semibold text-stone-900">微信支付</div>
                            <div class="text-xs text-stone-500">推荐使用微信支付</div>
                          </div>
                          {selectedPayment.value === "wechat" && (
                              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                          )}
                        </button>

                        <button
                            type="button"
                            class={`w-full flex items-center gap-4 rounded-xl border-2 p-4 transition-all ${
                                selectedPayment.value === "alipay"
                                    ? "border-blue-600 bg-blue-50 shadow-md"
                                    : "border-stone-200 bg-white hover:border-blue-300 hover:bg-blue-50/50"
                            }`}
                            onClick={() => (selectedPayment.value = "alipay")}
                        >
                          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white">
                            <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M21.422 15.358c-3.737-1.547-5.655-2.823-6.93-5.018a1.86 1.86 0 0 0-.32-.434 12.388 12.388 0 0 0-.924-.788c.334-1.08.536-2.225.572-3.36h-3.15v3.076a26.32 26.32 0 0 0-5.27 1.784v-1.796c2.45-1.16 4.22-2.462 5.32-4.27H6.87v-1.96h7.27c.38-.69.69-1.42.92-2.19h2.65c-.24.78-.56 1.52-.94 2.19h4.06v1.96h-4.65c-.18.6-.4 1.18-.66 1.74 1.08.72 2.28 1.64 3.1 2.66.4.5.66 1.06.76 1.68h2.66v2.62h-3.38a8.57 8.57 0 0 1-.28 2.16 38.86 38.86 0 0 1 3.8 1.32v2.62a38.46 38.46 0 0 0-4.42-1.56c-.38.94-.88 1.78-1.5 2.52h3.44v2.62h-5.14c-.68.58-1.46 1.04-2.32 1.36v-2.62c.54-.22 1.02-.52 1.44-.88H6.87v-2.62h6.86a8.6 8.6 0 0 0 .66-2.14H10.6v-2.62h4.26c.12-.48.2-1 .24-1.52h-4.7v-2.62h5.08c.02-.42.02-.84 0-1.26h-5.5V8.06h5.84c-.04-.54-.12-1.08-.24-1.6H10.6V4.54h7.26c-.06.36-.14.72-.24 1.06h3.44v1.96h-4.06c-.34 1.06-.82 2.04-1.42 2.92 1.56 2.36 3.98 3.76 7.96 5.08v2.06c-1.28-.42-2.44-.84-3.48-1.28.94 1.56 2.4 2.56 5.36 3.56v2.62z" />
                            </svg>
                          </div>
                          <div class="flex-1 text-left">
                            <div class="text-base font-semibold text-stone-900">支付宝</div>
                            <div class="text-xs text-stone-500">推荐使用支付宝支付</div>
                          </div>
                          {selectedPayment.value === "alipay" && (
                              <div class="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600">
                                <svg class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                          )}
                        </button>
                      </div>

                      <div class="mt-6 flex gap-3">
                        <button
                            type="button"
                            class="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                            onClick={() => closePaymentModal()}
                            disabled={paymentProcessing.value}
                        >
                          取消
                        </button>
                        <button
                            type="button"
                            class={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${
                                selectedPayment.value
                                    ? "bg-gradient-to-r from-red-900 via-red-800 to-amber-700 shadow-red-900/20 hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                                    : "cursor-not-allowed bg-stone-300 opacity-60"
                            }`}
                            onClick={() => confirmPayment()}
                            disabled={!selectedPayment.value || paymentProcessing.value}
                        >
                          {paymentProcessing.value ? (
                              <span class="flex items-center justify-center gap-2">
                          <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          支付中…
                        </span>
                          ) : (
                              "确认支付"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            )}

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
                  <h1 class="text-xl font-bold text-stone-900">订单 #{o.id}</h1>
                  <p class="mt-1 text-sm text-stone-500">查看订单详情与商品明细</p>
                </div>
              </div>
            </div>

            <div class="grid gap-6 lg:grid-cols-3">
              <div class="lg:col-span-2 space-y-6">
                <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="h-5 w-1 rounded-full bg-red-800" />
                    <div class="text-base font-semibold text-stone-900">订单信息</div>
                  </div>
                  <div class="space-y-3 text-sm text-stone-600">
                    <div class="flex items-center justify-between py-2 border-b border-stone-100">
                      <span class="text-stone-500">订单状态</span>
                      <div class="flex items-center gap-2">
                      <span class="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                        {o.status}
                      </span>
                        {o.refundStatus && o.refundStatus !== "NONE" && (
                            <span class={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
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
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-stone-100">
                      <span class="text-stone-500">下单时间</span>
                      <span class="text-stone-900">{o.createdAt}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-stone-100">
                      <span class="text-stone-500">收货人</span>
                      <span class="text-stone-900">{o.buyerName}（{o.buyerPhone}）</span>
                    </div>
                    <div class="flex items-start justify-between py-2">
                      <span class="text-stone-500">收货地址</span>
                      <span class="text-right text-stone-900">{o.buyerAddress}</span>
                    </div>

                    {/* 退款信息显示 */}
                    {o.refundStatus && o.refundStatus !== "NONE" && (
                        <div class="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div class="text-sm font-semibold text-amber-800 mb-2">退款信息</div>
                          <div class="space-y-1 text-xs text-amber-700">
                            <div>退款原因：{o.refundReason || "未填写"}</div>
                            <div>退款金额：￥{(o.refundAmountCents ? o.refundAmountCents / 100 : 0).toFixed(2)}</div>
                            {o.refundAppliedAt && <div>申请时间：{o.refundAppliedAt}</div>}
                            {o.refundRemark && <div>审核备注：{o.refundRemark}</div>}
                          </div>
                        </div>
                    )}
                  </div>

                  <div class="mt-6 flex flex-wrap gap-3">
                    {o.status === "CREATED" ? (
                        <button
                            type="button"
                            class="rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                            onClick={() => openPaymentModal()}
                        >
                          去支付（模拟）
                        </button>
                    ) : null}
                    {o.status === "CREATED" ? (
                        <button
                            type="button"
                            class="rounded-xl border border-stone-200 bg-white px-6 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50"
                            onClick={() => void cancel()}
                        >
                          取消订单
                        </button>
                    ) : null}
                    {(o.status === "PAID" || o.status === "SHIPPED") ? (
                        <button
                            type="button"
                            class="rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                            onClick={() => void receive()}
                        >
                          确认收货
                        </button>
                    ) : null}
                    {canRefund() ? (
                        <button
                            type="button"
                            class="rounded-xl border border-amber-300 bg-amber-50 px-6 py-2.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                            onClick={() => openRefundModal()}
                        >
                          申请退款
                        </button>
                    ) : null}
                  </div>

                  {msg.value ? <div class="mt-4 rounded-lg bg-stone-50 p-3 text-center text-sm text-stone-600">{msg.value}</div> : null}
                </div>

                <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                  <div class="flex items-center gap-2 mb-4">
                    <span class="h-5 w-1 rounded-full bg-red-800" />
                    <div class="text-base font-semibold text-stone-900">商品明细</div>
                  </div>
                  <div class="space-y-3">
                    {items.value.map((it) => (
                        <div
                            key={it.id}
                            class="flex items-center justify-between gap-3 rounded-xl border border-stone-100 bg-gradient-to-br from-stone-50 to-white px-4 py-3 transition hover:shadow-md"
                        >
                          <div>
                            <div class="text-sm font-medium text-stone-900">{it.title}</div>
                            <div class="mt-1 text-xs text-stone-500">数量 {it.qty}</div>
                          </div>
                          <div class="text-sm font-semibold text-red-800">￥{(it.priceCents / 100).toFixed(2)}</div>
                        </div>
                    ))}
                  </div>
                </div>
              </div>

              <div class="space-y-6">
                <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-red-50 to-amber-50 p-6 ring-1 ring-red-200/50 shadow-sm">
                  <div class="text-center">
                    <div class="text-xs font-medium text-stone-500">订单总金额</div>
                    <div class="mt-2 text-3xl font-bold text-red-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      ￥{(o.totalCents / 100).toFixed(2)}
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