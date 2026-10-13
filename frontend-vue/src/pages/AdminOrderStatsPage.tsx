import { defineComponent, ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

type OrderStats = {
  totalOrders: number;
  totalSales: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  refundOrders: number;
  approvedRefunds: number;
  refundRate: number;
  statusStats: Record<string, number>;
  dailyTrend: Array<{ date: string; count: number; sales: number }>;
  topProducts: Array<{ title: string; totalQty: number; totalSales: number }>;
  recentOrders: Array<{ id: number; buyerName: string; totalCents: number; status: string; createdAt: string }>;
};

export const AdminOrderStatsPage = defineComponent({
  name: "AdminOrderStatsPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(true);
    const msg = ref("");
    const stats = ref<OrderStats | null>(null);

    async function load() {
      loading.value = true;
      msg.value = "";
      try {
        const response = await fetch("/api/admin/order-stats", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`
          }
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "加载失败");
        }

        const data = await response.json();
        stats.value = data;
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "加载失败";
      } finally {
        loading.value = false;
      }
    }

    function formatCurrency(cents: number) {
      return `￥${(cents / 100).toFixed(2)}`;
    }

    function statusLabel(status: string) {
      const map: Record<string, string> = {
        CREATED: "待支付",
        PAID: "已支付",
        SHIPPED: "已发货",
        RECEIVED: "已收货",
        DONE: "已完成",
        CANCELLED: "已取消",
      };
      return map[status] || status;
    }

    function statusColor(status: string) {
      const map: Record<string, string> = {
        CREATED: "bg-gray-100 text-gray-700",
        PAID: "bg-blue-100 text-blue-700",
        SHIPPED: "bg-amber-100 text-amber-700",
        RECEIVED: "bg-green-100 text-green-700",
        DONE: "bg-emerald-100 text-emerald-700",
        CANCELLED: "bg-red-100 text-red-700",
      };
      return map[status] || "bg-stone-100 text-stone-700";
    }

    const completionRate = computed(() => {
      if (!stats.value || stats.value.totalOrders === 0) return 0;
      return Math.round((stats.value.completedOrders / stats.value.totalOrders) * 100);
    });

    const avgOrderValue = computed(() => {
      if (!stats.value || stats.value.totalOrders === 0) return 0;
      const validOrders = stats.value.totalOrders - stats.value.cancelledOrders;
      return validOrders > 0 ? stats.value.totalSales / validOrders : 0;
    });

    onMounted(async () => {
      auth.restore();
      if (!auth.isAuthed || !auth.isAdmin) {
        router.push("/login");
        return;
      }
      await load();
    });

    return () => (
      <div class="mx-auto max-w-7xl space-y-6">
        {/* 页面标题 */}
        <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="h-6 w-1 rounded-full bg-amber-700" />
              <div>
                <h1 class="text-xl font-bold text-stone-900">订单统计</h1>
                <p class="mt-1 text-sm text-stone-500">实时监控订单数据，分析销售趋势</p>
              </div>
            </div>
            <button
              type="button"
              class="wc-btn wc-btn-outline px-4 py-2 flex items-center gap-2"
              onClick={load}
              disabled={loading.value}
            >
              <svg class={`w-4 h-4 ${loading.value ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              刷新数据
            </button>
          </div>
        </div>

        {/* 提示消息 */}
        {msg.value ? (
          <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            {msg.value}
          </div>
        ) : null}

        {loading.value ? (
          <div class="p-12 text-center">
            <div class="inline-block animate-spin h-10 w-10 border-4 border-stone-200 border-t-amber-700 rounded-full mb-3"></div>
            <div class="text-stone-500">加载中...</div>
          </div>
        ) : stats.value ? (
          <>
            {/* 核心指标卡片 */}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">总订单数</span>
                  <span class="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-stone-900" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.totalOrders}
                </div>
                <div class="mt-1 text-xs text-stone-400">完成 {stats.value.completedOrders} 单</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">总销售额</span>
                  <span class="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-green-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {formatCurrency(stats.value.totalSales)}
                </div>
                <div class="mt-1 text-xs text-stone-400">均单 {formatCurrency(avgOrderValue.value)}</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">完成率</span>
                  <span class="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-emerald-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {completionRate.value}%
                </div>
                <div class="mt-1 text-xs text-stone-400">待处理 {stats.value.pendingOrders} 单</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">退款率</span>
                  <span class="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-red-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.refundRate}%
                </div>
                <div class="mt-1 text-xs text-stone-400">退款 {stats.value.approvedRefunds} 单</div>
              </div>
            </div>

            {/* 订单状态分布 */}
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <h2 class="text-base font-bold text-stone-900 mb-4">订单状态分布</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(stats.value.statusStats || {}).map(([status, count]) => (
                  <div class="rounded-lg bg-stone-50 p-3 text-center">
                    <div class={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${statusColor(status)}`}>
                      {statusLabel(status)}
                    </div>
                    <div class="text-xl font-bold text-stone-900" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 最近7天趋势 + 商品排行 */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 订单趋势 */}
              <div class="rounded-xl border border-stone-200 bg-white p-6">
                <h2 class="text-base font-bold text-stone-900 mb-4">最近7天订单趋势</h2>
                <div class="space-y-3">
                  {stats.value.dailyTrend.map((day) => (
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-stone-400 w-12">{day.date}</span>
                      <div class="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all"
                          style={{
                            width: `${stats.value!.dailyTrend.length > 0 ? (day.count / Math.max(...stats.value!.dailyTrend.map(d => d.count))) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span class="text-xs font-medium text-stone-600 w-12 text-right">{day.count}单</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 商品销售排行 */}
              <div class="rounded-xl border border-stone-200 bg-white p-6">
                <h2 class="text-base font-bold text-stone-900 mb-4">商品销售排行</h2>
                <div class="space-y-3">
                  {stats.value.topProducts.length === 0 ? (
                    <div class="text-center py-8 text-stone-400">暂无销售数据</div>
                  ) : (
                    stats.value.topProducts.map((product, index) => (
                      <div class="flex items-center gap-3">
                        <span class={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                          index === 0 ? "bg-amber-100 text-amber-700" :
                            index === 1 ? "bg-stone-200 text-stone-700" :
                              index === 2 ? "bg-orange-100 text-orange-700" :
                                "bg-stone-100 text-stone-500"
                        }`}>
                          {index + 1}
                        </span>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-stone-900 truncate">{product.title}</div>
                          <div class="text-xs text-stone-400">{product.totalQty} 件</div>
                        </div>
                        <span class="text-sm font-semibold text-green-700">
                          {formatCurrency(product.totalSales)}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* 最近订单 */}
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <h2 class="text-base font-bold text-stone-900 mb-4">最近订单</h2>
              {stats.value.recentOrders.length === 0 ? (
                <div class="text-center py-8 text-stone-400">暂无订单数据</div>
              ) : (
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-stone-200">
                        <th class="text-left py-2 px-3 text-stone-500 font-medium">订单号</th>
                        <th class="text-left py-2 px-3 text-stone-500 font-medium">买家</th>
                        <th class="text-right py-2 px-3 text-stone-500 font-medium">金额</th>
                        <th class="text-center py-2 px-3 text-stone-500 font-medium">状态</th>
                        <th class="text-right py-2 px-3 text-stone-500 font-medium">时间</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.value.recentOrders.map((order) => (
                        <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                          <td class="py-2.5 px-3 font-medium text-stone-900">#{order.id}</td>
                          <td class="py-2.5 px-3 text-stone-600">{order.buyerName}</td>
                          <td class="py-2.5 px-3 text-right font-semibold text-stone-900">
                            {formatCurrency(order.totalCents)}
                          </td>
                          <td class="py-2.5 px-3 text-center">
                            <span class={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(order.status)}`}>
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td class="py-2.5 px-3 text-right text-stone-400 text-xs">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString("zh-CN") : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }
});
