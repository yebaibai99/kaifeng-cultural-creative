<template>
    <div
            class="admin-app flex min-h-screen flex-col font-sans text-zinc-800"
            style="font-family: system-ui, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif"
    >
        <header
                class="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-black/10 px-4 text-white shadow-sm"
                style="background: #1e3a8a"
        >
            <div class="flex min-w-0 flex-1 items-center gap-3">
                <RouterLink to="/admin/products" class="flex min-w-0 items-center gap-2.5">
                    <div
                            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 text-sm font-bold text-white ring-1 ring-white/20"
                    >
                        文
                    </div>
                    <div class="min-w-0 leading-tight">
                        <div class="truncate text-sm font-semibold tracking-tight">开封文创后台管理系统</div>
                        <div class="hidden text-[11px] text-white/70 sm:block">运营控制台</div>
                    </div>
                </RouterLink>

                <nav class="hidden items-center gap-0.5 md:flex">
                    <RouterLink
                            v-for="item in topNav"
                            :key="item.to"
                            :to="item.to"
                            class="admin-top-link rounded-md px-3 py-2 text-sm text-white/90 transition hover:bg-white/10"
                            active-class="admin-top-link--active"
                    >
                        {{ item.label }}
                    </RouterLink>
                </nav>
            </div>

            <div class="relative flex shrink-0 items-center gap-2" data-admin-user @click.stop>
                <RouterLink
                        to="/"
                        class="hidden rounded-md px-2 py-1.5 text-xs text-white/85 ring-1 ring-white/20 transition hover:bg-white/10 sm:inline"
                >
                    前往前台
                </RouterLink>
                <button
                        type="button"
                        class="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-white/95 transition hover:bg-white/10"
                        aria-haspopup="true"
                        :aria-expanded="userOpen"
                        @click="userOpen = !userOpen"
                >
                    <span class="max-w-[10rem] truncate">{{ displayName }}</span>
                    <svg class="h-4 w-4 text-white/80" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path
                                fill-rule="evenodd"
                                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                clip-rule="evenodd"
                        />
                    </svg>
                </button>

                <Transition
                        enter-active-class="transition ease-out duration-100"
                        enter-from-class="transform opacity-0 scale-95"
                        enter-to-class="transform opacity-100 scale-100"
                        leave-active-class="transition ease-in duration-75"
                        leave-from-class="transform opacity-100 scale-100"
                        leave-to-class="transform opacity-0 scale-95"
                >
                    <div
                            v-if="userOpen"
                            class="absolute right-0 top-full z-50 mt-1 w-48 overflow-hidden rounded-md border border-gray-200 bg-white py-1 text-zinc-800 shadow-lg"
                            role="menu"
                    >
                        <RouterLink
                                to="/"
                                class="block px-3 py-2 text-sm hover:bg-gray-50"
                                role="menuitem"
                                @click="userOpen = false"
                        >
                            前往前台
                        </RouterLink>
                        <button
                                type="button"
                                class="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                                role="menuitem"
                                @click="onLogout"
                        >
                            退出登录
                        </button>
                    </div>
                </Transition>
            </div>
        </header>

        <nav
                class="flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 md:hidden"
                aria-label="快捷导航"
        >
            <RouterLink
                    v-for="item in mobileLinks"
                    :key="item.to"
                    :to="item.to"
                    class="shrink-0 rounded-md px-3 py-1.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200 transition hover:bg-gray-50"
                    active-class="bg-admin-500 text-white ring-1 ring-admin-500"
            >
                {{ item.label }}
            </RouterLink>
        </nav>

        <div class="flex min-h-0 flex-1">
            <aside
                    class="hidden w-56 shrink-0 flex-col border-r border-gray-200 bg-white shadow-sm md:flex"
                    aria-label="侧栏导航"
            >
                <div class="border-b border-gray-100 px-3 py-3 text-xs font-medium uppercase tracking-wide text-gray-400">
                    功能菜单
                </div>
                <nav class="flex-1 space-y-1 overflow-y-auto p-2">
                    <div v-for="group in menuGroups" :key="group.id" class="rounded-lg">
                        <button
                                type="button"
                                class="flex w-full items-center justify-between rounded-md px-2 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                @click="toggleGroup(group.id)"
                        >
              <span class="flex items-center gap-2">
                <component :is="group.icon" class="h-4 w-4 text-gray-400" />
                {{ group.title }}
              </span>
                            <svg
                                    class="h-4 w-4 text-gray-400 transition"
                                    :class="{ 'rotate-180': openGroups[group.id] }"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                            >
                                <path
                                        fill-rule="evenodd"
                                        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                        clip-rule="evenodd"
                                />
                            </svg>
                        </button>
                        <div v-show="openGroups[group.id]" class="space-y-0.5 pb-2 pl-1 pt-0.5">
                            <RouterLink
                                    v-for="child in group.children"
                                    :key="child.to"
                                    :to="child.to"
                                    class="admin-side-link flex items-center gap-2 rounded-md py-2 pl-8 pr-2 text-sm text-gray-600 transition hover:bg-[#e0e7ff]/60 hover:text-gray-900"
                                    active-class="admin-side-link--active"
                            >
                                {{ child.label }}
                            </RouterLink>
                        </div>
                    </div>
                </nav>
            </aside>

            <main class="min-w-0 flex-1 overflow-y-auto bg-[#f0f2f5] p-4 md:p-6">
                <slot />
            </main>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, onUnmounted, ref } from "vue";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
const userOpen = ref(false);

const topNav = [
    { label: "工作台", to: "/admin/products" },
    { label: "订单中心", to: "/admin/orders" },
    { label: "创作者", to: "/admin/creator-applications" },
    { label: "用户管理", to: "/admin/users" }
];

const mobileLinks = [
    { label: "商品", to: "/admin/products" },
    { label: "订单", to: "/admin/orders" },
    { label: "创作者", to: "/admin/creator-applications" },
    { label: "用户", to: "/admin/users" }
];

const IconBag = () =>
    h(
        "svg",
        { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
        h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        })
    );

const IconClipboard = () =>
    h(
        "svg",
        { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
        h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M9 5h6m-6 4h6m-6 4h6M5 5a2 2 0 012-2h10a2 2 0 012 2v14l-7-3-7 3V5z"
        })
    );

const IconUser = () =>
    h(
        "svg",
        { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
        h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        })
    );

const IconUsers = () =>
    h(
        "svg",
        { fill: "none", stroke: "currentColor", viewBox: "0 0 24 24" },
        h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            "stroke-width": "2",
            d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        })
    );

const menuGroups = [
    {
        id: "mall",
        title: "文创商城",
        icon: IconBag,
        children: [
            { label: "商品管理", to: "/admin/products" },
            { label: "分类管理", to: "/admin/categories" },
            { label: "品牌管理", to: "/admin/brands" }
        ]
    },
    {
        id: "orders",
        title: "订单与履约",
        icon: IconClipboard,
        children: [
            { label: "订单管理", to: "/admin/orders" },
            { label: "退款管理", to: "/admin/refunds" },
            { label: "订单统计", to: "/admin/order-stats" }
        ]
    },
    {
        id: "creator",
        title: "创作者",
        icon: IconUser,
        children: [
            { label: "创作者审核", to: "/admin/creator-applications" },
            { label: "创作者列表", to: "/admin/creators" },
            { label: "创作者统计", to: "/admin/creator-stats" }
        ]
    },
    {
        id: "users",
        title: "用户管理",
        icon: IconUsers,
        children: [
            { label: "用户列表", to: "/admin/users" },
            { label: "用户统计", to: "/admin/user-stats" }
        ]
    }
];

const openGroups = ref<Record<string, boolean>>({
    mall: true,
    orders: true,
    creator: true,
    users: true
});

function toggleGroup(id: string) {
    openGroups.value = { ...openGroups.value, [id]: !openGroups.value[id] };
}

const displayName = computed(() => auth.nickname?.trim() || "运营账号");

function onLogout() {
    userOpen.value = false;
    auth.logout();
    window.location.href = "/login";
}

function onDocumentClick() {
    userOpen.value = false;
}

onMounted(() => {
    document.addEventListener("click", onDocumentClick);
});

onUnmounted(() => {
    document.removeEventListener("click", onDocumentClick);
});
</script>

<script lang="ts">
export default {
    name: "AdminLayout"
};
</script>