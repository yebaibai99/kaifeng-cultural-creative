import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

export const LoginPage = defineComponent({
  name: "LoginPage",
  setup() {
    const router = useRouter();
    const auth = useAuthStore();
    const email = ref("admin@local");
    const password = ref("admin123");
    const msg = ref("");

    async function login() {
      msg.value = "";
      try {
        await auth.loginByEmail(email.value.trim(), password.value);
        router.push("/");
      } catch (e) {
        msg.value = e instanceof Error ? e.message : "LOGIN_FAILED";
      }
    }

    return () => (
        <div class="mx-auto max-w-xl px-4 py-12">
          <div class="rounded-2xl border border-stone-200 bg-white shadow-lg shadow-red-900/5 overflow-hidden">
            <div class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-10 text-center">
              <div class="absolute inset-0 opacity-20">
                <div class="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-red-900/30 blur-3xl" />
                <div class="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-amber-900/20 blur-3xl" />
              </div>
              <div class="relative z-10">
                <div class="text-xs tracking-[0.3em] text-stone-400">开封文创会员</div>
                <div class="mt-3 text-3xl font-bold text-white tracking-[0.2em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                  登录 / 注册
                </div>
                <p class="mt-3 text-sm text-stone-300">使用种子账号或已注册邮箱登录</p>
              </div>
            </div>
            <div class="p-8">
              <div class="space-y-5">
                <div>
                  <div class="mb-2 text-sm font-medium text-stone-700">邮箱</div>
                  <input
                      class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                      v-model={email.value}
                      placeholder="admin@local"
                      autocomplete="username"
                  />
                </div>
                <div>
                  <div class="mb-2 text-sm font-medium text-stone-700">密码</div>
                  <input
                      type="password"
                      class="w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-700 outline-none focus:border-red-800 focus:ring-2 focus:ring-red-100"
                      v-model={password.value}
                      autocomplete="current-password"
                  />
                </div>
                <button
                    type="button"
                    class="w-full rounded-xl bg-gradient-to-r from-red-900 via-red-800 to-amber-700 py-3 text-base font-semibold text-white shadow-md shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-red-900/30"
                    onClick={() => void login()}
                >
                  登录
                </button>
                {msg.value ? <div class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-700">{msg.value}</div> : null}
              </div>
            </div>
          </div>
        </div>
    );
  }
});
