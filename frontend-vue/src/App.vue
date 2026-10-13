<template>
    <AdminLayout v-if="isAdminRoute">
        <RouterView />
    </AdminLayout>

    <div v-else class="wc-shell">
        <header
            class="sticky top-0 z-20 border-b border-stone-200/90 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/90"
        >
            <div class="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
                <RouterLink to="/" class="group flex items-center gap-3">
                    <div
                        class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-900 via-red-800 to-amber-700 text-xl font-bold text-white shadow-md ring-2 ring-red-900/20 ring-offset-2 ring-offset-white transition group-hover:shadow-lg group-hover:scale-105"
                    >
                        汴
                    </div>
                    <div>
                        <div class="text-lg font-bold tracking-wider text-stone-900 whitespace-nowrap">
                            开封文创
                        </div>
                        <div class="text-xs text-stone-500 tracking-wider whitespace-nowrap">宋韵雅集 · 汴梁风物</div>
                    </div>
                </RouterLink>

                <nav class="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
                    <RouterLink
                        to="/"
                        class="rounded-lg px-2.5 py-2 text-sm text-stone-700 transition hover:bg-red-50 hover:text-red-800 sm:px-3"
                    >
                        首页
                    </RouterLink>
                    <RouterLink
                        to="/about"
                        class="rounded-lg px-2.5 py-2 text-sm text-stone-700 transition hover:bg-red-50 hover:text-red-800 sm:px-3"
                    >
                        关于文创
                    </RouterLink>
                    <RouterLink
                        to="/scenic-spots"
                        class="rounded-lg px-2.5 py-2 text-sm text-stone-700 transition hover:bg-red-50 hover:text-red-800 sm:px-3"
                    >
                        景点文创
                    </RouterLink>
                    <RouterLink
                        to="/cart"
                        class="rounded-lg px-2.5 py-2 text-sm text-stone-700 transition hover:bg-red-50 hover:text-red-800 sm:px-3"
                    >



                        购物车
                    </RouterLink>
                    <RouterLink
                        to="/orders"
                        class="rounded-lg px-2.5 py-2 text-sm text-stone-700 transition hover:bg-red-50 hover:text-red-800 sm:px-3"
                    >
                        我的订单
                    </RouterLink>

                    <RouterLink
                        to="/creator/apply"
                        class="rounded-lg px-2.5 py-2 text-sm text-stone-700 transition hover:bg-red-50 hover:text-red-800 sm:px-3"
                    >
                        创作者
                    </RouterLink>
                    <RouterLink
                        v-if="!auth.isAuthed"
                        to="/login"
                        class="rounded-lg px-3 py-2 text-sm font-medium text-red-800 ring-1 ring-red-800/30 transition hover:bg-red-800 hover:text-white"
                    >
                        登录
                    </RouterLink>
                    <template v-else>
                        <RouterLink
                            v-if="auth.isAdmin"
                            to="/admin/products"
                            class="rounded-lg px-2.5 py-2 text-xs text-stone-500 transition hover:bg-stone-100 sm:px-3 sm:text-sm"
                        >
                            管理入口
                        </RouterLink>
                        <button
                            type="button"
                            class="rounded-lg px-2.5 py-2 text-sm text-stone-600 transition hover:bg-stone-100 sm:px-3"
                            @click="auth.logout()"
                        >
                            退出
                        </button>
                    </template>
                </nav>
            </div>
        </header>

        <main class="mx-auto max-w-6xl px-4 py-6 md:py-8">
            <RouterView />
        </main>

        <footer class="mt-12 border-t border-stone-200/80 bg-gradient-to-b from-white to-stone-50 py-8 text-center">
            <div class="mx-auto max-w-6xl px-4">
                <!-- 联系我们 -->
                <div class="mb-4">
                    <div class="grid md:grid-cols-3 gap-6 text-center">
                        <div class="p-4 rounded-xl bg-white">
                            <h3 class="font-bold text-red-800 mb-2 text-sm">地址</h3>
                            <p class="text-stone-600 text-xs">河南省开封市鼓楼区</p>
                        </div>
                        <div class="p-4 rounded-xl bg-white">
                            <h3 class="font-bold text-red-800 mb-2 text-sm">邮箱</h3>
                            <p class="text-stone-600 text-xs">contact@kaifengwenchuang.com</p>
                        </div>
                        <div class="p-4 rounded-xl bg-white">
                            <h3 class="font-bold text-red-800 mb-2 text-sm">电话</h3>
                            <p class="text-stone-600 text-xs">0371-XXXX-XXXX</p>
                        </div>
                    </div>
                </div>
                
                <div class="mb-2 flex justify-center gap-6 text-xs text-stone-600">
                    <span>开封文创 · 传承宋韵</span>
                    <span>·</span>
                    <span>非遗传承</span>
                    <span>·</span>
                    <span>匠心手作</span>
                </div>
                <p class="text-xs text-stone-500">开封文创购物 · 演示站点 · 图片与文案仅供学习展示</p>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import AdminLayout from "./layouts/AdminLayout.vue";
import { useAuthStore } from "./stores/auth";

const auth = useAuthStore();
auth.restore();

const route = useRoute();
const isAdminRoute = computed(() => route.path.startsWith("/admin"));
</script>