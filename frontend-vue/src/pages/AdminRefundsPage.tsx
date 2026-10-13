import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type RefundOrder = {
  id: number;
  userId: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  totalCents: number;
  status: string;
  refundStatus: string;
  refundReason: string;
  refundAmountCents: number;
  refundAppliedAt: string;
  refundProcessedAt: string;
  refundRemark: string;
  createdAt: string;
};

export const AdminRefundsPage = defineComponent({
  name: "AdminRefundsPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const refunds = ref<RefundOrder[]>([]);
    const loading = ref(false);
    const msg = ref("");
    const filterStatus = ref("PENDING");
    const showRemarkModal = ref(false);
    const currentRefund = ref<RefundOrder | null>(null);
    const remarkText = ref("");
    const actionType = ref<"approve" | "reject">("approve");
    const processing = ref(false);

    async function loadRefunds() {
      loading.value = true;
      msg.value = "";
      try {
        const params = new URLSearchParams();
        if (filterStatus.value) params.set("status", filterStatus.value);
        const data = await apiFetch<any>(`/api/admin/refunds?${params}`);
        refunds.value = data.items || [];
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "加载失败";
      } finally {
        loading.value = false;
      }
    }

    function openRemarkModal(refund: RefundOrder, type: "approve" | "reject") {
      currentRefund.value = refund;
      actionType.value = type;
      remarkText.value = "";
      showRemarkModal.value = true;
    }

    async function processRefund() {
      if (!currentRefund.value) return;
      if (actionType.value === "reject" && !remarkText.value.trim()) {
        msg.value = "驳回时必须填写驳回理由";
        return;
      }
      processing.value = true;
      try {
        const endpoint = actionType.value === "approve" ? "approve" : "reject";
        await apiFetch(`/api/admin/refunds/${currentRefund.value.id}/${endpoint}`, {
          method: "POST",
          body: JSON.stringify({ remark: remarkText.value })
        });
        msg.value = actionType.value === "approve" ? "退款已通过" : "退款已驳回";
        showRemarkModal.value = false;
        currentRefund.value = null;
        await loadRefunds();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "操作失败";
      } finally {
        processing.value = false;
      }
    }

    function refundStatusLabel(status: string) {
      switch (status) {
        case "PENDING": return "待处理";
        case "APPROVED": return "已通过";
        case "REJECTED": return "已驳回";
        default: return "无";
      }
    }

    function refundStatusColor(status: string) {
      switch (status) {
        case "PENDING": return "bg-amber-100 text-amber-800";
        case "APPROVED": return "bg-green-100 text-green-800";
        case "REJECTED": return "bg-red-100 text-red-800";
        default: return "bg-stone-100 text-stone-700";
      }
    }

    function orderStatusLabel(status: string) {
      switch (status) {
        case "CREATED": return "待支付";
        case "PAID": return "已支付";
        case "SHIPPED": return "已发货";
        case "RECEIVED": return "已收货";
        case "DONE": return "已完成";
        case "CANCELLED": return "已取消";
        default: return status;
      }
    }

    const pendingCount = computed(() => refunds.value.filter(r => r.refundStatus === "PENDING").length);
    const approvedCount = computed(() => refunds.value.filter(r => r.refundStatus === "APPROVED").length);
    const rejectedCount = computed(() => refunds.value.filter(r => r.refundStatus === "REJECTED").length);

    onMounted(async () => {
      auth.restore();
      if (!auth.isAuthed || !auth.isAdmin) {
        router.push("/login");
        return;
      }
      await loadRefunds();
    });

    return () => (
        <div class="mx-auto max-w-7xl space-y-4">
          {/* 页面标题 */}
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="h-6 w-1 rounded-full bg-amber-700" />
                <div>
                  <h1 class="text-xl font-bold text-stone-900">退款管理</h1>
                  <p class="mt-1 text-sm text-stone-500">处理用户退款申请，审核退款理由并批准或驳回</p>
                </div>
              </div>
              {pendingCount.value > 0 && (
                  <div class="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-2">
                <span class="relative flex h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-amber-600"></span>
                </span>
                    <span class="text-sm font-medium text-amber-800">{pendingCount.value} 条待处理</span>
                  </div>
              )}
            </div>
          </div>

          {/* 提示消息 */}
          {msg.value ? (
              <div class={`rounded-xl border p-4 text-sm ${
                  msg.value.includes("失败") || msg.value.includes("驳回")
                      ? "border-red-200 bg-red-50 text-red-800"
                      : "border-amber-200 bg-amber-50 text-amber-800"
              }`}>
                {msg.value}
              </div>
          ) : null}

          {/* 统计卡片 */}
          <div class="grid grid-cols-3 gap-4">
            <div class="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
              <div class="text-xs text-amber-600 mb-1">待处理</div>
              <div class="text-2xl font-bold text-amber-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                {pendingCount.value}
              </div>
            </div>
            <div class="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4">
              <div class="text-xs text-green-600 mb-1">已通过</div>
              <div class="text-2xl font-bold text-green-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                {approvedCount.value}
              </div>
            </div>
            <div class="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-4">
              <div class="text-xs text-red-600 mb-1">已驳回</div>
              <div class="text-2xl font-bold text-red-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                {rejectedCount.value}
              </div>
            </div>
          </div>

          {/* 筛选 */}
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <div class="flex items-center gap-3 flex-wrap">
              <span class="text-sm text-stone-600">状态筛选：</span>
              {[
                { key: "PENDING", label: "待处理", active: "bg-amber-100 text-amber-800 ring-1 ring-amber-300", inactive: "bg-stone-100 text-stone-600 hover:bg-stone-200" },
                { key: "APPROVED", label: "已通过", active: "bg-green-100 text-green-800 ring-1 ring-green-300", inactive: "bg-stone-100 text-stone-600 hover:bg-stone-200" },
                { key: "REJECTED", label: "已驳回", active: "bg-red-100 text-red-800 ring-1 ring-red-300", inactive: "bg-stone-100 text-stone-600 hover:bg-stone-200" },
                { key: "", label: "全部", active: "bg-stone-200 text-stone-800 ring-1 ring-stone-400", inactive: "bg-stone-100 text-stone-600 hover:bg-stone-200" },
              ].map((item) => (
                  <button
                      type="button"
                      class={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          filterStatus.value === item.key ? item.active : item.inactive
                      }`}
                      onClick={() => { filterStatus.value = item.key; loadRefunds(); }}
                  >
                    {item.label}
                  </button>
              ))}
            </div>
          </div>

          {/* 退款列表 */}
          <div class="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {loading.value ? (
                <div class="p-8 text-center text-stone-500">
                  <div class="inline-block animate-spin h-8 w-8 border-4 border-stone-200 border-t-amber-700 rounded-full mb-2"></div>
                  <div class="text-sm">加载中...</div>
                </div>
            ) : refunds.value.length === 0 ? (
                <div class="p-12 text-center">
                  <div class="text-lg font-semibold text-stone-900">暂无退款申请</div>
                  <div class="mt-1 text-sm text-stone-500">当用户提交退款申请后会在这里显示</div>
                </div>
            ) : (
                <div class="space-y-3 p-4">
                  {refunds.value.map((refund) => (
                      <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 hover:shadow-lg transition-all duration-200">
                        <div class="flex items-start justify-between gap-4">
                          <div class="flex-1 min-w-0">
                            {/* 头部信息 */}
                            <div class="flex items-center gap-3 mb-3 flex-wrap">
                              <span class="text-sm font-semibold text-stone-900">退款申请 #{refund.id}</span>
                              <span class={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${refundStatusColor(refund.refundStatus)}`}>
                          {refundStatusLabel(refund.refundStatus)}
                        </span>
                              <span class="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-600">
                          订单 #{refund.id} · {orderStatusLabel(refund.status)}
                        </span>
                            </div>

                            {/* 详细信息网格 */}
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div class="rounded-lg bg-white p-3 border border-stone-100">
                                <div class="text-xs text-stone-400 mb-1">申请人</div>
                                <div class="font-medium text-stone-900 truncate">{refund.buyerName}</div>
                              </div>
                              <div class="rounded-lg bg-white p-3 border border-stone-100">
                                <div class="text-xs text-stone-400 mb-1">联系电话</div>
                                <div class="font-medium text-stone-900">{refund.buyerPhone}</div>
                              </div>
                              <div class="rounded-lg bg-white p-3 border border-stone-100">
                                <div class="text-xs text-stone-400 mb-1">订单金额</div>
                                <div class="font-semibold text-stone-700">￥{(refund.totalCents / 100).toFixed(2)}</div>
                              </div>
                              <div class="rounded-lg bg-white p-3 border border-amber-100 bg-amber-50/50">
                                <div class="text-xs text-amber-600 mb-1">申请退款</div>
                                <div class="font-bold text-amber-700">￥{(refund.refundAmountCents / 100).toFixed(2)}</div>
                              </div>
                            </div>

                            {/* 退款理由 */}
                            <div class="mt-3 rounded-lg bg-white p-3 border border-stone-100">
                              <div class="text-xs text-stone-400 mb-1">退款理由</div>
                              <div class="text-sm text-stone-700">{refund.refundReason || "未填写"}</div>
                            </div>

                            {/* 时间信息 */}
                            <div class="mt-2 flex flex-wrap gap-4 text-xs text-stone-400">
                              <span>申请时间：{refund.refundAppliedAt ? new Date(refund.refundAppliedAt).toLocaleString("zh-CN") : "-"}</span>
                              {refund.refundProcessedAt && (
                                  <span>处理时间：{new Date(refund.refundProcessedAt).toLocaleString("zh-CN")}</span>
                              )}
                            </div>

                            {/* 管理员备注 */}
                            {refund.refundRemark && (
                                <div class="mt-2 rounded-lg bg-stone-50 p-3 border border-stone-100">
                                  <div class="text-xs text-stone-400 mb-1">管理员备注</div>
                                  <div class="text-sm text-stone-700">{refund.refundRemark}</div>
                                </div>
                            )}
                          </div>

                          {/* 操作按钮 */}
                          {refund.refundStatus === "PENDING" && (
                              <div class="flex flex-col gap-2 shrink-0">
                                <button
                                    type="button"
                                    class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-green-600 to-green-700 text-white shadow-sm hover:shadow-md transition-all hover:scale-105"
                                    onClick={() => openRemarkModal(refund, "approve")}
                                >
                                  通过退款
                                </button>
                                <button
                                    type="button"
                                    class="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm hover:shadow-md transition-all hover:scale-105"
                                    onClick={() => openRemarkModal(refund, "reject")}
                                >
                                  驳回退款
                                </button>
                              </div>
                          )}
                        </div>
                      </div>
                  ))}
                </div>
            )}
          </div>

          {/* 处理退款备注弹窗 */}
          {showRemarkModal.value && currentRefund.value ? (
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !processing.value && (showRemarkModal.value = false)}>
                <div class="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  {/* 弹窗头部 */}
                  <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-center">
                    <div class="text-xs tracking-[0.3em] text-stone-400">
                      {actionType.value === "approve" ? "审核通过" : "审核驳回"}
                    </div>
                    <div class="mt-2 text-xl font-bold text-white tracking-[0.1em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      {actionType.value === "approve" ? "通过退款申请" : "驳回退款申请"}
                    </div>
                  </div>

                  {/* 弹窗内容 */}
                  <div class="p-6">
                    <div class="rounded-xl bg-stone-50 p-4 mb-4 border border-stone-200">
                      <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span class="text-stone-400">退款单号：</span>
                          <span class="text-stone-900 font-medium">#{currentRefund.value.id}</span>
                        </div>
                        <div>
                          <span class="text-stone-400">申请人：</span>
                          <span class="text-stone-900 font-medium">{currentRefund.value.buyerName}</span>
                        </div>
                        <div>
                          <span class="text-stone-400">申请金额：</span>
                          <span class="text-amber-700 font-bold">￥{(currentRefund.value.refundAmountCents / 100).toFixed(2)}</span>
                        </div>
                        <div>
                          <span class="text-stone-400">订单状态：</span>
                          <span class="text-stone-900">{orderStatusLabel(currentRefund.value.status)}</span>
                        </div>
                      </div>
                      <div class="mt-2 pt-2 border-t border-stone-200">
                        <span class="text-stone-400 text-sm">退款理由：</span>
                        <div class="mt-1 text-sm text-stone-700">{currentRefund.value.refundReason || "无"}</div>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-stone-700 mb-2">
                        {actionType.value === "approve" ? (
                            <>备注信息 <span class="text-stone-400 font-normal">（可选）</span></>
                        ) : (
                            <><span class="text-red-500">*</span> 驳回理由 <span class="text-stone-400 font-normal">（必填）</span></>
                        )}
                      </label>
                      <textarea
                          class="wc-input h-28 resize-none"
                          placeholder={actionType.value === "approve" ? "请输入备注信息（如：退款原因说明）" : "请输入驳回理由（如：不符合退款条件）"}
                          value={remarkText.value}
                          onInput={(e: Event) => {
                            const target = e.target as HTMLTextAreaElement;
                            remarkText.value = target.value;
                          }}
                          disabled={processing.value}
                      />
                    </div>

                    {/* 弹窗按钮 */}
                    <div class="flex gap-3 mt-6">
                      <button
                          type="button"
                          class="flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 disabled:opacity-50"
                          onClick={() => showRemarkModal.value = false}
                          disabled={processing.value}
                      >
                        取消
                      </button>
                      <button
                          type="button"
                          class={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                              actionType.value === "approve"
                                  ? "bg-gradient-to-r from-green-600 to-green-700 hover:scale-[1.02] hover:shadow-lg"
                                  : "bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.02] hover:shadow-lg"
                          }`}
                          onClick={processRefund}
                          disabled={processing.value || (actionType.value === "reject" && !remarkText.value.trim())}
                      >
                        {processing.value ? (
                            <span class="flex items-center justify-center gap-2">
                        <svg class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        处理中…
                      </span>
                        ) : (
                            actionType.value === "approve" ? "确认通过" : "确认驳回"
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          ) : null}
        </div>
    );
  }
});