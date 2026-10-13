import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

type UserStats = {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  avgActivity: number;
  roleStats: Record<string, number>;
  dailyTrend: Array<{ date: string; count: number }>;
  recentUsers: Array<{ id: number; nickname: string; email: string; phone: string; role: string; createdAt: string }>;
};

export const AdminUserStatsPage = defineComponent({
  name: "AdminUserStatsPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(true);
    const msg = ref("");
    const stats = ref<UserStats | null>(null);

    async function load() {
      loading.value = true;
      msg.value = "";
      try {
        const response = await fetch("/api/admin/user-stats", {
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

    function roleLabel(role: string) {
      const map: Record<string, string> = {
        ADMIN: "管理员",
        CREATOR: "创作者",
        USER: "普通用户",
      };
      return map[role] || role;
    }

    function roleColor(role: string) {
      const map: Record<string, string> = {
        ADMIN: "bg-red-100 text-red-700",
        CREATOR: "bg-purple-100 text-purple-700",
        USER: "bg-blue-100 text-blue-700",
      };
      return map[role] || "bg-stone-100 text-stone-700";
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
                <h1 class="text-xl font-bold text-stone-900">用户统计</h1>
                <p class="mt-1 text-sm text-stone-500">实时监控用户数据，分析用户行为</p>
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
            <div class="inline-block animate-spin h-10 w-10 border-4 border-stone-200 border-t-blue-700 rounded-full mb-3"></div>
            <div class="text-stone-500">加载中...</div>
          </div>
        ) : stats.value ? (
          <>
            {/* 核心指标卡片 */}
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">总用户数</span>
                  <span class="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-stone-900" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.totalUsers}
                </div>
                <div class="mt-1 text-xs text-stone-400">平台注册总用户</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">活跃用户</span>
                  <span class="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-green-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.activeUsers}
                </div>
                <div class="mt-1 text-xs text-stone-400">有订单记录的用户</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">新注册用户</span>
                  <span class="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-amber-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.newUsers}
                </div>
                <div class="mt-1 text-xs text-stone-400">最近30天注册用户</div>
              </div>

              <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-5 hover:shadow-lg transition-shadow">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-sm text-stone-500">平均活跃度</span>
                  <span class="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center">
                    <svg class="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                </div>
                <div class="text-2xl font-bold text-purple-700" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  {stats.value.avgActivity}%
                </div>
                <div class="mt-1 text-xs text-stone-400">活跃用户占比</div>
              </div>
            </div>

            {/* 用户角色分布 */}
            <div class="rounded-xl border border-stone-200 bg-white p-6">
              <h2 class="text-base font-bold text-stone-900 mb-4">用户角色分布</h2>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(stats.value.roleStats || {}).map(([role, count]) => (
                  <div class="rounded-lg bg-stone-50 p-3 text-center">
                    <div class={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${roleColor(role)}`}>
                      {roleLabel(role)}
                    </div>
                    <div class="text-xl font-bold text-stone-900" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 最近7天趋势 + 最近注册用户 */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 用户增长趋势 */}
              <div class="rounded-xl border border-stone-200 bg-white p-6">
                <h2 class="text-base font-bold text-stone-900 mb-4">最近7天用户增长趋势</h2>
                <div class="space-y-3">
                  {stats.value.dailyTrend.map((day) => (
                    <div class="flex items-center gap-3">
                      <span class="text-xs text-stone-400 w-12">{day.date}</span>
                      <div class="flex-1 h-6 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          class="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all"
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

              {/* 最近注册用户 */}
              <div class="rounded-xl border border-stone-200 bg-white p-6">
                <h2 class="text-base font-bold text-stone-900 mb-4">最近注册用户</h2>
                {stats.value.recentUsers.length === 0 ? (
                  <div class="text-center py-8 text-stone-400">暂无用户数据</div>
                ) : (
                  <div class="space-y-3">
                    {stats.value.recentUsers.map((user) => (
                      <div class="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors">
                        <div class="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span class="text-sm font-medium text-blue-700">{user.nickname.charAt(0)}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm font-medium text-stone-900 truncate">{user.nickname}</div>
                          <div class="text-xs text-stone-400 truncate">{user.email || user.phone}</div>
                        </div>
                        <span class={`inline-block px-2 py-0.5 rounded text-xs font-medium ${roleColor(user.role)}`}>
                          {roleLabel(user.role)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    );
  }
});
