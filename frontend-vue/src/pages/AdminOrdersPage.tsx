import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Order = {
  id: number;
  orderNo: string;
  buyerName: string;
  totalCents: number;
  status: string;
  createdAt: string;
  updatedAt: string;
};

type OrderListResp = {
  orders: Order[];
  total: number;
  page: number;
  size: number;
};

export const AdminOrdersPage = defineComponent({
  name: "AdminOrdersPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(true);
    const msg = ref("");
    const orders = ref<Order[]>([]);
    const total = ref(0);
    const page = ref(1);
    const size = ref(10);
    const searchKeyword = ref("");

    async function load() {
      loading.value = true;
      msg.value = "";
      try {
        const data = await apiFetch<OrderListResp>(`/api/admin/orders?page=${page.value}&size=${size.value}&keyword=${encodeURIComponent(searchKeyword.value)}`);
        orders.value = data.orders;
        total.value = data.total;
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

    function handleSearch() {
      page.value = 1;
      load();
    }

    function handlePageChange(newPage: number) {
      page.value = newPage;
      load();
    }

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
                <span class="h-6 w-1 rounded-full bg-blue-700" />
                <div>
                  <h1 class="text-xl font-bold text-stone-900">订单管理</h1>
                  <p class="mt-1 text-sm text-stone-500">管理所有订单，处理订单状态和退款</p>
                </div>
              </div>
            </div>
          </div>

          {/* 提示消息 */}
          {msg.value ? (
              <div class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {msg.value}
              </div>
          ) : null}

          {/* 搜索和筛选 */}
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div class="flex-1">
                <div class="relative">
                  <input
                      type="text"
                      class="wc-input w-full pr-10"
                      placeholder="搜索订单号、买家名称"
                      value={searchKeyword.value}
                      onInput={(e: Event) => {
                        const target = e.target as HTMLInputElement;
                        searchKeyword.value = target.value;
                      }}
                      onKeydown={(e: KeyboardEvent) => {
                        if (e.key === "Enter") handleSearch();
                      }}
                  />
                  <button
                      type="button"
                      class="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                      onClick={handleSearch}
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {loading.value ? (
              <div class="p-12 text-center">
                <div class="inline-block animate-spin h-10 w-10 border-4 border-stone-200 border-t-blue-700 rounded-full mb-3"></div>
                <div class="text-stone-500">加载中...</div>
              </div>
          ) : orders.value.length > 0 ? (
              <div class="rounded-xl border border-stone-200 bg-white overflow-hidden">
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                    <tr class="bg-stone-50 border-b border-stone-200">
                      <th class="text-left py-3 px-4 text-stone-600 font-medium">订单号</th>
                      <th class="text-left py-3 px-4 text-stone-600 font-medium">买家</th>
                      <th class="text-right py-3 px-4 text-stone-600 font-medium">金额</th>
                      <th class="text-center py-3 px-4 text-stone-600 font-medium">状态</th>
                      <th class="text-right py-3 px-4 text-stone-600 font-medium">创建时间</th>
                      <th class="text-center py-3 px-4 text-stone-600 font-medium">操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {orders.value.map((order) => (
                        <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                          <td class="py-3 px-4 font-medium text-stone-900">#{order.orderNo || order.id}</td>
                          <td class="py-3 px-4 text-stone-600">{order.buyerName}</td>
                          <td class="py-3 px-4 text-right font-semibold text-stone-900">
                            {formatCurrency(order.totalCents)}
                          </td>
                          <td class="py-3 px-4 text-center">
                            <span class={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusColor(order.status)}`}>
                              {statusLabel(order.status)}
                            </span>
                          </td>
                          <td class="py-3 px-4 text-right text-stone-400 text-xs">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString("zh-CN") : "-"}
                          </td>
                          <td class="py-3 px-4 text-center">
                            <button
                                type="button"
                                class="wc-btn wc-btn-sm wc-btn-outline text-blue-600 border-blue-200 hover:bg-blue-50"
                                onClick={() => router.push(`/admin/orders/${order.id}`)}
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                    ))}
                    </tbody>
                  </table>
                </div>

                {/* 分页 */}
                <div class="flex items-center justify-between p-4 border-t border-stone-200">
                  <div class="text-sm text-stone-500">
                    共 {total.value} 条记录
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                        type="button"
                        class="wc-btn wc-btn-sm wc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(page.value - 1)}
                        disabled={page.value === 1}
                    >
                      上一页
                    </button>
                    <span class="text-sm text-stone-600">
                      {page.value} / {Math.ceil(total.value / size.value)}
                    </span>
                    <button
                        type="button"
                        class="wc-btn wc-btn-sm wc-btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => handlePageChange(page.value + 1)}
                        disabled={page.value >= Math.ceil(total.value / size.value)}
                    >
                      下一页
                    </button>
                  </div>
                </div>
              </div>
          ) : (
              <div class="p-12 text-center">
                <div class="text-lg font-semibold text-stone-900">暂无订单数据</div>
                <div class="mt-1 text-sm text-stone-500">当用户下单后会在这里显示</div>
              </div>
          )}
        </div>
    );
  }
});