import { defineComponent, ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type Creator = {
  id: number;
  email: string;
  phone: string;
  nickname: string;
  avatarUrl: string;
  realName: string;
  idNumber: string;
  portfolioUrl: string;
  note: string;
  creatorStatus: string;
  applicationStatus: string;
  createdAt: string;
  applicationId: number;
};

type CreatorsResponse = {
  creators: Creator[];
  total: number;
  page: number;
  size: number;
};

export const AdminCreatorsPage = defineComponent({
  name: "AdminCreatorsPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const loading = ref(false);
    const msg = ref("");
    const creators = ref<Creator[]>([]);
    const total = ref(0);
    const currentPage = ref(0);
    const pageSize = ref(10);
    const keyword = ref("");
    const statusFilter = ref("");
    const showDetailModal = ref(false);
    const selectedCreator = ref<Creator | null>(null);
    const showStatusModal = ref(false);
    const statusActionCreator = ref<Creator | null>(null);

    async function loadCreators() {
      loading.value = true;
      msg.value = "";
      try {
        const params = new URLSearchParams();
        params.set("page", currentPage.value.toString());
        params.set("size", pageSize.value.toString());
        if (keyword.value.trim()) params.set("keyword", keyword.value.trim());
        if (statusFilter.value) params.set("status", statusFilter.value);

        const data = await apiFetch<CreatorsResponse>(`/api/admin/creators?${params}`);
        creators.value = data.creators || [];
        total.value = data.total || 0;
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "加载失败";
      } finally {
        loading.value = false;
      }
    }

    async function handleSearch() {
      currentPage.value = 0;
      await loadCreators();
    }

    async function handlePageChange(page: number) {
      currentPage.value = page;
      await loadCreators();
    }

    function openDetail(creator: Creator) {
      selectedCreator.value = creator;
      showDetailModal.value = true;
    }

    function openStatusModal(creator: Creator) {
      statusActionCreator.value = creator;
      showStatusModal.value = true;
    }

    async function toggleStatus() {
      if (!statusActionCreator.value) return;
      try {
        await apiFetch(`/api/admin/creators/${statusActionCreator.value.id}/toggle`, {
          method: "POST",
        });
        msg.value = "状态已切换";
        showStatusModal.value = false;
        statusActionCreator.value = null;
        await loadCreators();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "操作失败";
      }
    }

    function creatorStatusLabel(status: string) {
      const map: Record<string, string> = {
        NONE: "非创作者",
        PENDING: "审核中",
        APPROVED: "已通过",
        REJECTED: "已拒绝",
      };
      return map[status] || status;
    }

    function creatorStatusColor(status: string) {
      const map: Record<string, string> = {
        NONE: "bg-stone-100 text-stone-600",
        PENDING: "bg-amber-100 text-amber-700",
        APPROVED: "bg-green-100 text-green-700",
        REJECTED: "bg-red-100 text-red-700",
      };
      return map[status] || "bg-stone-100 text-stone-600";
    }

    function applicationStatusLabel(status: string | null) {
      if (!status) return "-";
      const map: Record<string, string> = {
        PENDING: "待审核",
        APPROVED: "已通过",
        REJECTED: "已拒绝",
      };
      return map[status] || status;
    }

    const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

    const approvedCount = computed(() => creators.value.filter(c => c.creatorStatus === "APPROVED").length);
    const pendingCount = computed(() => creators.value.filter(c => c.creatorStatus === "PENDING").length);
    const rejectedCount = computed(() => creators.value.filter(c => c.creatorStatus === "REJECTED").length);

    onMounted(async () => {
      auth.restore();
      if (!auth.isAuthed || !auth.isAdmin) {
        router.push("/login");
        return;
      }
      await loadCreators();
    });

    return () => (
        <div class="mx-auto max-w-7xl space-y-4">
          {/* 页面标题 */}
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="h-6 w-1 rounded-full bg-amber-700" />
                <div>
                  <h1 class="text-xl font-bold text-stone-900">创作者列表</h1>
                  <p class="mt-1 text-sm text-stone-500">管理已认证创作者信息，查看申请详情与状态</p>
                </div>
              </div>
              <button
                  type="button"
                  class="wc-btn wc-btn-outline px-4 py-2 flex items-center gap-2"
                  onClick={loadCreators}
                  disabled={loading.value}
              >
                <svg class={`w-4 h-4 ${loading.value ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                刷新
              </button>
            </div>
          </div>

          {/* 提示消息 */}
          {msg.value ? (
              <div class={`rounded-xl border p-4 text-sm ${
                  msg.value.includes("失败") ? "border-red-200 bg-red-50 text-red-800" : "border-green-200 bg-green-50 text-green-800"
              }`}>
                {msg.value}
              </div>
          ) : null}

          {/* 统计卡片 */}
          <div class="grid grid-cols-3 gap-4">
            <div class="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-4">
              <div class="text-xs text-green-600 mb-1">已通过</div>
              <div class="text-2xl font-bold text-green-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                {approvedCount.value}
              </div>
            </div>
            <div class="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
              <div class="text-xs text-amber-600 mb-1">审核中</div>
              <div class="text-2xl font-bold text-amber-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                {pendingCount.value}
              </div>
            </div>
            <div class="rounded-xl border border-red-200 bg-gradient-to-br from-red-50 to-white p-4">
              <div class="text-xs text-red-600 mb-1">已拒绝</div>
              <div class="text-2xl font-bold text-red-800" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                {rejectedCount.value}
              </div>
            </div>
          </div>

          {/* 搜索和筛选 */}
          <div class="rounded-xl border border-stone-200 bg-white p-4">
            <div class="flex items-center gap-3 flex-wrap">
              <div class="flex-1 min-w-[200px]">
                <input
                    type="text"
                    class="wc-input"
                    placeholder="搜索昵称或邮箱..."
                    value={keyword.value}
                    onInput={(e: Event) => {
                      const target = e.target as HTMLInputElement;
                      keyword.value = target.value;
                    }}
                    onKeydown={(e: KeyboardEvent) => {
                      if (e.key === "Enter") handleSearch();
                    }}
                />
              </div>
              <select
                  class="wc-input w-32"
                  value={statusFilter.value}
                  onChange={(e: Event) => {
                    const target = e.target as HTMLSelectElement;
                    statusFilter.value = target.value;
                    currentPage.value = 0;
                    loadCreators();
                  }}
              >
                <option value="">全部状态</option>
                <option value="PENDING">审核中</option>
                <option value="APPROVED">已通过</option>
                <option value="REJECTED">已拒绝</option>
              </select>
              <button
                  type="button"
                  class="wc-btn wc-btn-primary px-4 py-2"
                  onClick={handleSearch}
                  disabled={loading.value}
              >
                搜索
              </button>
            </div>
          </div>

          {/* 创作者列表 */}
          <div class="rounded-xl border border-stone-200 bg-white overflow-hidden">
            {loading.value ? (
                <div class="p-8 text-center text-stone-500">
                  <div class="inline-block animate-spin h-8 w-8 border-4 border-stone-200 border-t-amber-700 rounded-full mb-2"></div>
                  <div class="text-sm">加载中...</div>
                </div>
            ) : creators.value.length === 0 ? (
                <div class="p-12 text-center">
                  <div class="text-lg font-semibold text-stone-900">暂无创作者数据</div>
                  <div class="mt-1 text-sm text-stone-500">当用户申请成为创作者并审核通过后会在这里显示</div>
                </div>
            ) : (
                <>
                  <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                      <thead>
                      <tr class="border-b border-stone-200 bg-stone-50">
                        <th class="text-left py-3 px-4 text-stone-500 font-medium">创作者</th>
                        <th class="text-left py-3 px-4 text-stone-500 font-medium">联系方式</th>
                        <th class="text-center py-3 px-4 text-stone-500 font-medium">创作者状态</th>
                        <th class="text-center py-3 px-4 text-stone-500 font-medium">申请状态</th>
                        <th class="text-right py-3 px-4 text-stone-500 font-medium">注册时间</th>
                        <th class="text-center py-3 px-4 text-stone-500 font-medium">操作</th>
                      </tr>
                      </thead>
                      <tbody>
                      {creators.value.map((creator) => (
                          <tr class="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                            <td class="py-3 px-4">
                              <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-sm">
                                  {creator.nickname?.charAt(0) || "?"}
                                </div>
                                <div>
                                  <div class="font-medium text-stone-900">{creator.nickname}</div>
                                  <div class="text-xs text-stone-400">ID: {creator.id}</div>
                                </div>
                              </div>
                            </td>
                            <td class="py-3 px-4">
                              <div class="text-stone-600">{creator.email || "-"}</div>
                              <div class="text-xs text-stone-400">{creator.phone || "-"}</div>
                            </td>
                            <td class="py-3 px-4 text-center">
                          <span class={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${creatorStatusColor(creator.creatorStatus)}`}>
                            {creatorStatusLabel(creator.creatorStatus)}
                          </span>
                            </td>
                            <td class="py-3 px-4 text-center">
                          <span class={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              creator.applicationStatus === "APPROVED" ? "bg-green-100 text-green-700" :
                                  creator.applicationStatus === "REJECTED" ? "bg-red-100 text-red-700" :
                                      "bg-amber-100 text-amber-700"
                          }`}>
                            {applicationStatusLabel(creator.applicationStatus)}
                          </span>
                            </td>
                            <td class="py-3 px-4 text-right text-stone-400 text-xs">
                              {creator.createdAt ? new Date(creator.createdAt).toLocaleDateString("zh-CN") : "-"}
                            </td>
                            <td class="py-3 px-4 text-center">
                              <div class="flex items-center justify-center gap-2">
                                <button
                                    type="button"
                                    class="text-xs text-amber-700 hover:text-amber-900 font-medium"
                                    onClick={() => openDetail(creator)}
                                >
                                  详情
                                </button>
                                <button
                                    type="button"
                                    class={`text-xs font-medium ${
                                        creator.creatorStatus === "APPROVED"
                                            ? "text-red-600 hover:text-red-800"
                                            : "text-green-600 hover:text-green-800"
                                    }`}
                                    onClick={() => openStatusModal(creator)}
                                >
                                  {creator.creatorStatus === "APPROVED" ? "禁用" : "启用"}
                                </button>
                              </div>
                            </td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>

                  {/* 分页 */}
                  {totalPages.value > 1 && (
                      <div class="flex items-center justify-between px-4 py-3 border-t border-stone-200">
                        <div class="text-sm text-stone-500">
                          共 {total.value} 条记录，第 {currentPage.value + 1} / {totalPages.value} 页
                        </div>
                        <div class="flex items-center gap-2">
                          <button
                              type="button"
                              class="wc-btn wc-btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                              disabled={currentPage.value === 0 || loading.value}
                              onClick={() => handlePageChange(currentPage.value - 1)}
                          >
                            上一页
                          </button>
                          {Array.from({ length: Math.min(5, totalPages.value) }, (_, i) => {
                            let page: number;
                            if (totalPages.value <= 5) {
                              page = i;
                            } else if (currentPage.value < 3) {
                              page = i;
                            } else if (currentPage.value > totalPages.value - 4) {
                              page = totalPages.value - 5 + i;
                            } else {
                              page = currentPage.value - 2 + i;
                            }
                            return (
                                <button
                                    key={page}
                                    type="button"
                                    class={`w-8 h-8 rounded-lg text-xs font-medium transition ${
                                        page === currentPage.value
                                            ? "bg-amber-600 text-white"
                                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                                    }`}
                                    onClick={() => handlePageChange(page)}
                                >
                                  {page + 1}
                                </button>
                            );
                          })}
                          <button
                              type="button"
                              class="wc-btn wc-btn-outline px-3 py-1.5 text-xs disabled:opacity-50"
                              disabled={currentPage.value >= totalPages.value - 1 || loading.value}
                              onClick={() => handlePageChange(currentPage.value + 1)}
                          >
                            下一页
                          </button>
                        </div>
                      </div>
                  )}
                </>
            )}
          </div>

          {/* 创作者详情弹窗 */}
          {showDetailModal.value && selectedCreator.value ? (
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => showDetailModal.value = false}>
                <div class="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  {/* 弹窗头部 */}
                  <div class="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-center">
                    <div class="text-xs tracking-[0.3em] text-stone-400">CREATOR DETAIL</div>
                    <div class="mt-2 text-xl font-bold text-white tracking-[0.1em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                      创作者详情
                    </div>
                  </div>

                  {/* 弹窗内容 */}
                  <div class="p-6 max-h-[60vh] overflow-y-auto">
                    <div class="flex items-center gap-4 mb-6">
                      <div class="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-700 font-bold text-2xl">
                        {selectedCreator.value.nickname?.charAt(0) || "?"}
                      </div>
                      <div>
                        <div class="text-lg font-bold text-stone-900">{selectedCreator.value.nickname}</div>
                        <div class="text-sm text-stone-500">ID: {selectedCreator.value.id}</div>
                      </div>
                    </div>

                    <div class="space-y-4">
                      <div class="rounded-xl bg-stone-50 p-4 border border-stone-200">
                        <h3 class="text-sm font-semibold text-stone-700 mb-3">基本信息</h3>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-stone-400">邮箱：</span>
                            <span class="text-stone-900">{selectedCreator.value.email || "-"}</span>
                          </div>
                          <div>
                            <span class="text-stone-400">手机：</span>
                            <span class="text-stone-900">{selectedCreator.value.phone || "-"}</span>
                          </div>
                          <div>
                            <span class="text-stone-400">真实姓名：</span>
                            <span class="text-stone-900">{selectedCreator.value.realName || "-"}</span>
                          </div>
                          <div>
                            <span class="text-stone-400">身份证号：</span>
                            <span class="text-stone-900">{selectedCreator.value.idNumber || "-"}</span>
                          </div>
                        </div>
                      </div>

                      <div class="rounded-xl bg-stone-50 p-4 border border-stone-200">
                        <h3 class="text-sm font-semibold text-stone-700 mb-3">状态信息</h3>
                        <div class="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span class="text-stone-400">创作者状态：</span>
                            <span class={`inline-block px-2 py-0.5 rounded text-xs font-medium ml-1 ${creatorStatusColor(selectedCreator.value.creatorStatus)}`}>
                          {creatorStatusLabel(selectedCreator.value.creatorStatus)}
                        </span>
                          </div>
                          <div>
                            <span class="text-stone-400">申请状态：</span>
                            <span class="text-stone-900 ml-1">{applicationStatusLabel(selectedCreator.value.applicationStatus)}</span>
                          </div>
                          <div>
                            <span class="text-stone-400">注册时间：</span>
                            <span class="text-stone-900 ml-1">
                          {selectedCreator.value.createdAt ? new Date(selectedCreator.value.createdAt).toLocaleString("zh-CN") : "-"}
                        </span>
                          </div>
                        </div>
                      </div>

                      {selectedCreator.value.portfolioUrl && (
                          <div class="rounded-xl bg-stone-50 p-4 border border-stone-200">
                            <h3 class="text-sm font-semibold text-stone-700 mb-2">作品集</h3>
                            <a
                                href={selectedCreator.value.portfolioUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="text-sm text-amber-700 hover:text-amber-900 break-all"
                            >
                              {selectedCreator.value.portfolioUrl}
                            </a>
                          </div>
                      )}

                      {selectedCreator.value.note && (
                          <div class="rounded-xl bg-stone-50 p-4 border border-stone-200">
                            <h3 class="text-sm font-semibold text-stone-700 mb-2">备注</h3>
                            <p class="text-sm text-stone-600 whitespace-pre-wrap">{selectedCreator.value.note}</p>
                          </div>
                      )}
                    </div>
                  </div>

                  {/* 弹窗按钮 */}
                  <div class="px-6 py-4 border-t border-stone-200 flex justify-end">
                    <button
                        type="button"
                        class="wc-btn wc-btn-outline px-6 py-2"
                        onClick={() => showDetailModal.value = false}
                    >
                      关闭
                    </button>
                  </div>
                </div>
              </div>
          ) : null}

          {/* 切换状态确认弹窗 */}
          {showStatusModal.value && statusActionCreator.value ? (
              <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => showStatusModal.value = false}>
                <div class="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={(e: MouseEvent) => e.stopPropagation()}>
                  <div class="p-6 text-center">
                    <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                      <svg class="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h3 class="text-lg font-bold text-stone-900 mb-2">确认操作</h3>
                    <p class="text-sm text-stone-500">
                      确定要{statusActionCreator.value.creatorStatus === "APPROVED" ? "禁用" : "启用"}创作者 <span class="font-semibold text-stone-900">{statusActionCreator.value.nickname}</span> 吗？
                    </p>
                  </div>
                  <div class="px-6 py-4 border-t border-stone-200 flex gap-3">
                    <button
                        type="button"
                        class="flex-1 wc-btn wc-btn-outline"
                        onClick={() => showStatusModal.value = false}
                    >
                      取消
                    </button>
                    <button
                        type="button"
                        class={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all ${
                            statusActionCreator.value.creatorStatus === "APPROVED"
                                ? "bg-gradient-to-r from-red-600 to-red-700 hover:scale-[1.02]"
                                : "bg-gradient-to-r from-green-600 to-green-700 hover:scale-[1.02]"
                        }`}
                        onClick={toggleStatus}
                    >
                      确认{statusActionCreator.value.creatorStatus === "APPROVED" ? "禁用" : "启用"}
                    </button>
                  </div>
                </div>
              </div>
          ) : null}
        </div>
    );
  }
});