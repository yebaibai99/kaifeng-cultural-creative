import { defineComponent, onMounted, ref } from "vue";
import { apiFetch } from "../lib/api";

type Application = {
  id: number;
  realName: string;
  idNumber: string;
  portfolioUrl: string;
  note?: string;
  status: string;
  createdAt: string;
};

export const CreatorApplyPage = defineComponent({
  name: "CreatorApplyPage",
  setup() {
    const loading = ref(true);
    const err = ref("");
    const msg = ref("");

    const latest = ref<Application | null>(null);

    const realName = ref("李四");
    const idNumber = ref("410000000000000000");
    const portfolioUrl = ref("");
    const note = ref("希望成为创作者，上传作品集链接。");

    async function load() {
      loading.value = true;
      err.value = "";
      msg.value = "";
      try {
        const res = await apiFetch<any>("/api/creator/application");
        latest.value = res && res.exists === false ? null : (res as Application);
      } catch (e) {
        err.value = e instanceof Error ? e.message : "LOAD_FAILED";
      } finally {
        loading.value = false;
      }
    }

    async function submit() {
      msg.value = "";
      try {
        await apiFetch("/api/creator/apply", {
          method: "POST",
          body: JSON.stringify({
            real_name: realName.value.trim(),
            id_number: idNumber.value.trim(),
            portfolio_url: portfolioUrl.value.trim(),
            note: note.value.trim()
          })
        });
        msg.value = "已提交申请，等待管理员审核";
        await load();
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "SUBMIT_FAILED";
      }
    }

    onMounted(() => void load());


    return () => (
        <div class="mx-auto max-w-2xl space-y-6">
          <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
            <div class="flex items-center gap-3">
              <span class="h-6 w-1 rounded-full bg-red-800" />
              <div>
                <h1 class="text-xl font-bold text-stone-900">创作者认证</h1>
                <p class="mt-1 text-sm text-stone-500">提交实名信息与作品集链接，审核通过后可发布文创商品（演示流程）</p>
              </div>
            </div>
          </div>

          <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <span class="h-5 w-1 rounded-full bg-red-800" />
              <div class="text-base font-semibold text-stone-900">申请记录</div>
            </div>
            {loading.value ? (
                <div class="py-8 text-center text-sm text-stone-500">加载中…</div>
            ) : err.value ? (
                <div class="py-8 text-center text-sm text-red-600">加载失败：{err.value}</div>
            ) : latest.value ? (
                <div class="space-y-3 rounded-xl border border-stone-100 bg-gradient-to-br from-stone-50 to-white p-5 text-sm text-stone-700">
                  <div class="flex items-center justify-between">
                    <span class="font-semibold text-stone-900">最近一次申请</span>
                    <span class="inline-flex rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                  {latest.value.status}
                </span>
                  </div>
                  <div class="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100">
                    <div>
                      <span class="text-stone-500">姓名：</span>
                      <span class="text-stone-900">{latest.value.realName}</span>
                    </div>
                    <div>
                      <span class="text-stone-500">证件号：</span>
                      <span class="text-stone-900">{latest.value.idNumber}</span>
                    </div>
                    <div>
                      <span class="text-stone-500">作品集：</span>
                      <span class="text-stone-900">{latest.value.portfolioUrl || "—"}</span>
                    </div>
                    <div>
                      <span class="text-stone-500">时间：</span>
                      <span class="text-stone-900">{latest.value.createdAt}</span>
                    </div>
                  </div>
                  <div class="pt-3 border-t border-stone-100">
                    <span class="text-stone-500">备注：</span>
                    <span class="text-stone-700">{latest.value.note || "—"}</span>
                  </div>
                </div>
            ) : (
                <div class="py-8 text-center text-sm text-stone-500">暂无申请记录，你可以直接提交一次申请。</div>
            )}
          </div>

          <div class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="flex items-center gap-2 mb-5">
              <span class="h-5 w-1 rounded-full bg-red-800" />
              <div class="text-base font-semibold text-stone-900">提交申请</div>
            </div>
            <div class="grid gap-5">
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">姓名</div>
                <input
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    v-model={realName.value}
                />
              </div>
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">证件号</div>
                <input
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    v-model={idNumber.value}
                />
              </div>
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">作品集链接（可选）</div>
                <input
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                    v-model={portfolioUrl.value}
                    placeholder="https://…"
                />
              </div>
              <div>
                <div class="mb-2 text-sm font-medium text-stone-700">备注（可选）</div>
                <textarea
                    rows={3}
                    class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100 resize-none"
                    v-model={note.value}
                />
              </div>
              <button
                  type="button"
                  class="rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                  onClick={() => void submit()}
              >
                提交申请
              </button>
              {msg.value ? <div class="rounded-lg bg-stone-50 p-3 text-center text-sm text-stone-600">{msg.value}</div> : null}
            </div>
          </div>
        </div>
    );
  }
});
