import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

type CreatorStats = {
  totalCreators: number;
  activeCreators: number;
  totalWorks: number;
  avgViews: number;
  statusStats: Record<string, number>;
  dailyTrend: Array<{ date: string; count: number }>;
  categoryStats: Record<string, number>;
  topCreators: Array<{ creatorId: number; nickname: string; avatarUrl: string; totalSales: number; productCount: number }>;
};

export const AdminCreatorStatsPage = defineComponent({
  name: "AdminCreatorStatsPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(true);
    const msg = ref("");
    const stats = ref<CreatorStats | null>(null);

    async function load() {
      loading.value = true;
      msg.value = "";
      try {
        const response = await fetch("/api/admin/creator-stats", {
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

    function statusLabel(status: string) {
      const map: Record<string, string> = {
        NONE: "非创作者",
        PENDING: "待审核",
        APPROVED: "已通过",
        REJECTED: "已驳回",
      };
      return map[status] || status;
    }

    function statusColor(status: string) {
      const map: Record<string, string> = {
        NONE: "bg-gray-100 text-gray-700",
        PENDING: "bg-blue-100 text-blue-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
      };
      return map[status] || "bg-stone-100 text-stone-700";
    }

    function getAvatarUrl(url: string) {
      return url || "https://neeko-copilot.bytedance.net/api/text2image?prompt=default%20user%20avatar&size=512x512";
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
              <span class="h-6 w-1 rounded-full bg-green-700" />
              <div>
                <h1 class="text-xl font-bold text-stone-900">创作者统计</h1>
                <p class="mt-1 text-sm text-stone-500">实时监控创作者数据，分析创作趋势</p>
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
            <div class="inline-block animate-spin h-10 w-10 border-4 border-stone-200 border-t-green-700 rounded-full mb-3"></div>
            <div class="text-stone-500">加载中...</div>
          </div>
        ) : stats.value ? (
          <>
            {/* 核心指标卡片 */}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">总创作者数</span>
                  <span class="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-stone-900" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.totalCreators}
                </div>
                <div class="mt-1 text-xs text-stone-400">已审核通过的创作者</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">活跃创作者</span>
                  <span class="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-green-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.activeCreators}
                </div>
                <div class="mt-1 text-xs text-stone-400">有发布作品的创作者</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">总作品数</span>
                  <span class="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-amber-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.totalWorks}
                </div>
                <div class="mt-1 text-xs text-stone-400">所有创作者的作品总数</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">作品平均浏览量</span>
                  <span class="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-blue-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.avgViews}
                </div>
                <div class="mt-1 text-xs text-stone-400">每件作品的平均浏览次数</div>
              </div>
            </div>

            {/* 创作者状态分布 */}
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <h2 class="text-base font-bold text-stone-900 mb-4">创作者状态分布</h2>
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
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

            {/* 最近7天趋势 + 作品分类 */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 创作者增长趋势 */}
              <div class="rounded-xl border border-stone-200 bg-white p-6">
                <h2 class="text-base font-bold text-stone-900 mb-4">最近7天创作者增长趋势</h2>
                <div class="space-y-3">
                  {stats.value.dailyTrend.map((day) => (
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-stone-400 w-12">{day.date}</span>
                      <div class="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                          style={{
                            width: `${stats.value!.dailyTrend.length > 0 ? (day.count / Math.max(...stats.value!.dailyTrend.map(d => d.count))) * 100 : 0}%`
                          }}
                        />
                      </div>
                      <span class="text-xs font-medium text-stone-600 w-12 text-right">{day.count}人</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 作品分类分布 */}
              <div class="rounded-xl border border-stone-200 bg-white p-6">
                <h2 class="text-base font-bold text-stone-900 mb-4">作品分类分布</h2>
                <div class="space-y-3">
                  {Object.entries(stats.value.categoryStats || {}).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([category, count]) => (
                    <div class="flex items-center gap-3">
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-stone-900 truncate">{category}</div>
                      </div>
                      <div class="w-24">
                        <div class="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            class="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all"
                            style={{
                              width: `${stats.value?.categoryStats ? (count / Object.values(stats.value.categoryStats).reduce((a, b) => a + b, 0)) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>
                      <span class="text-xs font-medium text-stone-600 w-12 text-right">{count}件</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 热门创作者 */}
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <h2 class="text-base font-bold text-stone-900 mb-4">热门创作者</h2>
              {stats.value.topCreators.length === 0 ? (
                <div class="text-center py-8 text-stone-400">暂无创作者数据</div>
              ) : (
                <div class="space-y-4">
                  {stats.value.topCreators.map((creator, index) => (
                    <div class="flex items-center gap-4 p-3 rounded-lg hover:bg-stone-50 transition-colors">
                      <span class={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? "bg-amber-100 text-amber-700" :
                          index === 1 ? "bg-stone-200 text-stone-700" :
                            index === 2 ? "bg-orange-100 text-orange-700" :
                              "bg-stone-100 text-stone-500"
                      }`}>
                        {index + 1}
                      </span>
                      <div class="flex-shrink-0">
                        <img
                          src={getAvatarUrl(creator.avatarUrl)}
                          alt={creator.nickname}
                          class="w-10 h-10 rounded-full object-cover border border-stone-200"
                        />
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="text-sm font-medium text-stone-900 truncate">{creator.nickname}</div>
                        <div class="text-xs text-stone-400">{creator.productCount} 件作品</div>
                      </div>
                      <div class="text-right">
                        <div class="text-sm font-semibold text-green-700">{creator.totalSales} 销量</div>
                        <div class="text-xs text-stone-400">排名 {index + 1}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }
});
