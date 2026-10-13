import { defineComponent, onMounted, ref } from "vue";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

type Application = {
  id: number;
  userId: number;
  realName: string;
  idNumber: string;
  portfolioUrl: string;
  note?: string;
  status: string;
  createdAt: string;
};

export const AdminCreatorApplicationsPage = defineComponent({
  name: "AdminCreatorApplicationsPage",
  setup() {
    const auth = useAuthStore();
    const router = useRouter();
    const loading = ref(true);
    const err = ref("");
    const msg = ref("");
    const items = ref<Application[]>([]);
    const selectedStatus = ref("pending");

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        let apiEndpoint = "/api/creator/pending";
        if (selectedStatus.value === "all") {
          apiEndpoint = "/api/creator/applications";
        } else if (selectedStatus.value === "approved") {
          apiEndpoint = "/api/creator/approved";
        } else if (selectedStatus.value === "rejected") {
          apiEndpoint = "/api/creator/rejected";
        }

        console.log("请求接口:", apiEndpoint);
        const response = await fetch(apiEndpoint, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${auth.token}`
          }
        });

        console.log("HTTP 状态码:", response.status);
        console.log("响应头:", Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error("错误响应体:", errorText);
          throw new Error(`HTTP ${response.status}: ${errorText || response.statusText}`);
        }

        const data = await response.json();
        console.log("加载成功，数据条数:", Array.isArray(data) ? data.length : "非数组");
        items.value = data;
      } catch (e) {
        console.error("加载失败:", e);
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    async function approve(id: number) {
      msg.value = "";
      try {
        await apiFetch(`/api/creator/applications/${id}/approve`, { method: "POST" });
        msg.value = "已通过";
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "APPROVE_FAILED";
      }
    }

    async function reject(id: number) {
      msg.value = "";
      try {
        await apiFetch(`/api/creator/applications/${id}/reject`, {
          method: "POST",
          body: JSON.stringify({ note: "未通过（演示）" })
        });
        msg.value = "已驳回";
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "REJECT_FAILED";
      }
    }

    onMounted(() => {
      auth.restore();
      console.log("页面加载，isAdmin:", auth.isAdmin);
      if (!auth.isAdmin) router.push("/");
      else void load();
    });

    return () => (
        <div class="mx-auto max-w-5xl space-y-4">
          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
              <span class="rounded-md bg-admin-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm">创作者审核</span>
              <span class="rounded-md border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500">待处理申请</span>
            </div>
            <div class="mt-5">
              <h1 class="text-xl font-semibold text-gray-900">创作者审核</h1>
              <p class="mt-1 text-sm text-gray-500">仅管理员可访问，处理待审核的创作者申请。</p>
            </div>
          </div>

          <div class="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3">
                <div class="text-sm font-semibold text-gray-900">申请列表</div>
                <select
                    class="admin-input w-40 py-1.5 text-sm"
                    value={selectedStatus.value}
                    onChange={(e) => {
                      selectedStatus.value = (e.target as HTMLSelectElement).value;
                      void load();
                    }}
                >
                  <option value="pending">待审核</option>
                  <option value="approved">已通过</option>
                  <option value="rejected">已驳回</option>
                  <option value="all">全部</option>
                </select>
              </div>
              <button type="button" class="admin-btn-ghost" onClick={() => void load()}>
                刷新
              </button>
            </div>

            {loading.value ? (
                <div class="mt-4 text-sm text-gray-500">加载中…</div>
            ) : err.value ? (
                <div class="mt-4 text-sm text-red-600">加载失败：{err.value}</div>
            ) : items.value.length === 0 ? (
                <div class="mt-4 text-sm text-gray-500">暂无数据</div>
            ) : (
                <div class="mt-4 space-y-3">
                  {items.value.map((a) => (
                      <div key={a.id} class="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                          <div class="text-sm font-semibold text-gray-900">申请 #{a.id}</div>
                          <div class="text-xs text-gray-400">{a.createdAt}</div>
                        </div>
                        <div class="mt-2 grid gap-1 text-sm text-gray-600">
                          <div>用户ID：{a.userId}</div>
                          <div>姓名：{a.realName}</div>
                          <div>证件号：{a.idNumber}</div>
                          <div>作品集：{a.portfolioUrl || "—"}</div>
                          <div class="text-gray-400">备注：{a.note || "—"}</div>
                        </div>
                        <div class="mt-3 flex flex-wrap gap-2">
                          <button type="button" class="admin-btn-primary px-3 py-2 text-xs" onClick={() => void approve(a.id)}>
                            通过
                          </button>
                          <button type="button" class="admin-btn-ghost" onClick={() => void reject(a.id)}>
                            驳回
                          </button>
                        </div>
                      </div>
                  ))}
                </div>
            )}

            {msg.value ? <div class="mt-3 text-sm text-admin-700">{msg.value}</div> : null}
          </div>
        </div>
    );
  }
});