import { defineComponent, onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";
import { useAuthStore } from "../stores/auth";

type UserItem = {
    id: number;
    email: string | null;
    phone: string | null;
    nickname: string;
    avatarUrl: string;
    role: string;
    creatorStatus: string;
    createdAt: string;
};

type NewUserForm = {
    email: string;
    password: string;
    nickname: string;
    phone: string;
    role: string;
};

export const AdminUsersPage = defineComponent({
    name: "AdminUsersPage",
    setup() {
        const router = useRouter();
        const auth = useAuthStore();
        const users = ref<UserItem[]>([]);
        const loading = ref(false);
        const msg = ref("");
        const page = ref(0);
        const size = ref(10);
        const total = ref(0);
        const roleFilter = ref("");
        const keyword = ref("");
        const showEditModal = ref(false);
        const showAddModal = ref(false);
        const editingUser = ref<UserItem | null>(null);
        const newUser = ref<NewUserForm>({
            email: "",
            password: "",
            nickname: "",
            phone: "",
            role: "USER"
        });

        async function loadUsers() {
            loading.value = true;
            msg.value = "";
            try {
                const params = new URLSearchParams();
                params.set("page", String(page.value));
                params.set("size", String(size.value));
                if (roleFilter.value) params.set("role", roleFilter.value);
                if (keyword.value.trim()) params.set("keyword", keyword.value.trim());

                const data = await apiFetch<any>(`/api/admin/users?${params}`);
                users.value = data.users || [];
                total.value = data.total || 0;
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "加载失败";
            } finally {
                loading.value = false;
            }
        }

        function roleLabel(role: string) {
            switch (role) {
                case "ADMIN": return "管理员";
                case "CREATOR": return "创作者";
                default: return "普通用户";
            }
        }

        function roleColor(role: string) {
            switch (role) {
                case "ADMIN": return "bg-red-100 text-red-800";
                case "CREATOR": return "bg-blue-100 text-blue-800";
                default: return "bg-stone-100 text-stone-700";
            }
        }

        function creatorStatusLabel(status: string) {
            switch (status) {
                case "APPROVED": return "已通过";
                case "REJECTED": return "已拒绝";
                case "PENDING": return "待审核";
                default: return "未申请";
            }
        }

        async function handleEdit(user: UserItem) {
            editingUser.value = { ...user };
            showEditModal.value = true;
        }

        function openAddModal() {
            newUser.value = {
                email: "",
                password: "",
                nickname: "",
                phone: "",
                role: "USER"
            };
            showAddModal.value = true;
        }

        async function handleDelete(id: number, nickname: string) {
            if (!confirm(`确定要删除用户 "${nickname}" 吗？此操作不可恢复！`)) {
                return;
            }
            try {
                await apiFetch(`/api/admin/users/${id}`, { method: "DELETE" });
                msg.value = "用户已删除";
                await loadUsers();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "删除失败";
            }
        }

        async function updateRole() {
            if (!editingUser.value) return;
            try {
                await apiFetch(`/api/admin/users/${editingUser.value.id}/role`, {
                    method: "PUT",
                    body: JSON.stringify({ role: editingUser.value.role })
                });
                msg.value = "角色已更新";
                showEditModal.value = false;
                await loadUsers();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "更新失败";
            }
        }

        async function updateCreatorStatus() {
            if (!editingUser.value) return;
            try {
                await apiFetch(`/api/admin/users/${editingUser.value.id}/creator-status`, {
                    method: "PUT",
                    body: JSON.stringify({ creatorStatus: editingUser.value.creatorStatus })
                });
                msg.value = "创作者状态已更新";
                showEditModal.value = false;
                await loadUsers();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "更新失败";
            }
        }

        async function createNewUser() {
            if (!newUser.value.email.trim()) {
                msg.value = "请输入邮箱";
                return;
            }
            if (newUser.value.password.length < 6) {
                msg.value = "密码至少6位";
                return;
            }
            if (!newUser.value.nickname.trim()) {
                msg.value = "请输入昵称";
                return;
            }

            try {
                await apiFetch("/api/admin/users", {
                    method: "POST",
                    body: JSON.stringify(newUser.value)
                });
                msg.value = "用户创建成功";
                showAddModal.value = false;
                await loadUsers();
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "创建失败";
            }
        }

        const totalPages = computed(() => Math.ceil(total.value / size.value));

        async function changePage(newPage: number) {
            if (newPage < 0 || newPage >= totalPages.value) return;
            page.value = newPage;
            await loadUsers();
        }

        async function handleSearch() {
            page.value = 0;
            await loadUsers();
        }

        onMounted(async () => {
            auth.restore();
            if (!auth.isAuthed || !auth.isAdmin) {
                router.push("/login");
                return;
            }
            await loadUsers();
        });

        return () => (
            <div class="mx-auto max-w-7xl space-y-4">
                {/* 页面标题 */}
                <div class="rounded-2xl border border-stone-200 bg-gradient-to-br from-white to-stone-50 p-6 shadow-sm">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <span class="h-6 w-1 rounded-full bg-red-800" />
                            <div>
                                <h1 class="text-xl font-bold text-stone-900">用户管理</h1>
                                <p class="mt-1 text-sm text-stone-500">管理系统用户、分配角色、审核创作者</p>
                            </div>
                        </div>
                        <button
                            type="button"
                            class="wc-btn wc-btn-primary px-4 py-2 flex items-center gap-2"
                            onClick={openAddModal}
                        >
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                            </svg>
                            新增用户
                        </button>
                    </div>
                </div>

                {/* 提示消息 */}
                {msg.value ? (
                    <div class="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        {msg.value}
                    </div>
                ) : null}

                {/* 筛选和搜索 */}
                <div class="rounded-xl border border-stone-200 bg-white p-4">
                    <div class="flex flex-wrap gap-3">
                        <div class="flex-1 min-w-[200px]">
                            <label class="block text-xs font-medium text-stone-600 mb-1">关键词搜索</label>
                            <input
                                type="text"
                                class="wc-input"
                                placeholder="搜索昵称或邮箱"
                                v-model={keyword.value}
                                onKeyup={(e: KeyboardEvent) => e.key === "Enter" && handleSearch()}
                            />
                        </div>
                        <div class="w-[160px]">
                            <label class="block text-xs font-medium text-stone-600 mb-1">角色筛选</label>
                            <select class="wc-input" v-model={roleFilter.value} onChange={handleSearch}>
                                <option value="">全部角色</option>
                                <option value="ADMIN">管理员</option>
                                <option value="CREATOR">创作者</option>
                                <option value="USER">普通用户</option>
                            </select>
                        </div>
                        <div class="flex items-end">
                            <button
                                type="button"
                                class="wc-btn wc-btn-primary px-4 py-2"
                                onClick={handleSearch}
                            >
                                搜索
                            </button>
                        </div>
                    </div>
                </div>

                {/* 用户列表 */}
                <div class="rounded-xl border border-stone-200 bg-white overflow-hidden">
                    {loading.value ? (
                        <div class="p-8 text-center text-stone-500">加载中...</div>
                    ) : users.value.length === 0 ? (
                        <div class="p-8 text-center text-stone-500">暂无用户数据</div>
                    ) : (
                        <div class="overflow-x-auto">
                            <table class="w-full text-sm">
                                <thead class="bg-stone-50 border-b border-stone-200">
                                <tr>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">ID</th>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">昵称</th>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">邮箱</th>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">手机号</th>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">角色</th>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">创作者状态</th>
                                    <th class="px-4 py-3 text-left font-medium text-stone-700">注册时间</th>
                                    <th class="px-4 py-3 text-center font-medium text-stone-700">操作</th>
                                </tr>
                                </thead>
                                <tbody class="divide-y divide-stone-100">
                                {users.value.map((user) => (
                                    <tr class="hover:bg-stone-50">
                                        <td class="px-4 py-3 text-stone-500">#{user.id}</td>
                                        <td class="px-4 py-3 font-medium text-stone-900">{user.nickname}</td>
                                        <td class="px-4 py-3 text-stone-600">{user.email || "-"}</td>
                                        <td class="px-4 py-3 text-stone-600">{user.phone || "-"}</td>
                                        <td class="px-4 py-3">
                        <span class={`inline-block px-2 py-1 rounded text-xs font-medium ${roleColor(user.role)}`}>
                          {roleLabel(user.role)}
                        </span>
                                        </td>
                                        <td class="px-4 py-3 text-stone-600">{creatorStatusLabel(user.creatorStatus)}</td>
                                        <td class="px-4 py-3 text-stone-500 text-xs">
                                            {new Date(user.createdAt).toLocaleDateString("zh-CN")}
                                        </td>
                                        <td class="px-4 py-3 text-center">
                                            <button
                                                type="button"
                                                class="text-blue-600 hover:text-blue-800 text-xs mr-3"
                                                onClick={() => handleEdit(user)}
                                            >
                                                编辑
                                            </button>
                                            <button
                                                type="button"
                                                class="text-red-600 hover:text-red-800 text-xs"
                                                onClick={() => handleDelete(user.id, user.nickname)}
                                            >
                                                删除
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* 分页 */}
                    {totalPages.value > 1 && (
                        <div class="flex items-center justify-between px-4 py-3 border-t border-stone-200 bg-stone-50">
                            <div class="text-sm text-stone-600">
                                共 {total.value} 条记录，第 {page.value + 1} / {totalPages.value} 页
                            </div>
                            <div class="flex gap-2">
                                <button
                                    type="button"
                                    class="px-3 py-1 text-sm border border-stone-300 rounded hover:bg-white disabled:opacity-50"
                                    disabled={page.value === 0}
                                    onClick={() => changePage(page.value - 1)}
                                >
                                    上一页
                                </button>
                                <button
                                    type="button"
                                    class="px-3 py-1 text-sm border border-stone-300 rounded hover:bg-white disabled:opacity-50"
                                    disabled={page.value >= totalPages.value - 1}
                                    onClick={() => changePage(page.value + 1)}
                                >
                                    下一页
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* 编辑弹窗 */}
                {showEditModal.value && editingUser.value ? (
                    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => showEditModal.value = false}>
                        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e: MouseEvent) => e.stopPropagation()}>
                            <h3 class="text-lg font-bold text-stone-900 mb-4">编辑用户</h3>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">昵称</label>
                                    <input class="wc-input bg-stone-50" value={editingUser.value.nickname} disabled />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">邮箱</label>
                                    <input class="wc-input bg-stone-50" value={editingUser.value.email || "-"} disabled />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">角色</label>
                                    <select
                                        class="wc-input"
                                        value={editingUser.value.role}
                                        onChange={(e: Event) => {
                                            const target = e.target as HTMLSelectElement;
                                            editingUser.value!.role = target.value;
                                        }}
                                    >
                                        <option value="USER">普通用户</option>
                                        <option value="CREATOR">创作者</option>
                                        <option value="ADMIN">管理员</option>
                                    </select>
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">创作者状态</label>
                                    <select
                                        class="wc-input"
                                        value={editingUser.value.creatorStatus}
                                        onChange={(e: Event) => {
                                            const target = e.target as HTMLSelectElement;
                                            editingUser.value!.creatorStatus = target.value;
                                        }}
                                    >
                                        <option value="NONE">未申请</option>
                                        <option value="PENDING">待审核</option>
                                        <option value="APPROVED">已通过</option>
                                        <option value="REJECTED">已拒绝</option>
                                    </select>
                                </div>
                            </div>

                            <div class="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    class="flex-1 wc-btn wc-btn-primary"
                                    onClick={updateRole}
                                >
                                    更新角色
                                </button>
                                <button
                                    type="button"
                                    class="flex-1 wc-btn wc-btn-primary"
                                    onClick={updateCreatorStatus}
                                >
                                    更新创作者状态
                                </button>
                                <button
                                    type="button"
                                    class="wc-btn px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                                    onClick={() => showEditModal.value = false}
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}

                {/* 新增用户弹窗 */}
                {showAddModal.value ? (
                    <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => showAddModal.value = false}>
                        <div class="bg-white rounded-2xl p-6 w-full max-w-md mx-4" onClick={(e: MouseEvent) => e.stopPropagation()}>
                            <h3 class="text-lg font-bold text-stone-900 mb-4">新增用户</h3>

                            <div class="space-y-4">
                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">
                                        <span class="text-red-500">*</span> 邮箱
                                    </label>
                                    <input
                                        type="email"
                                        class="wc-input"
                                        placeholder="请输入邮箱"
                                        value={newUser.value.email}
                                        onInput={(e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            newUser.value.email = target.value;
                                        }}
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">
                                        <span class="text-red-500">*</span> 密码
                                    </label>
                                    <input
                                        type="password"
                                        class="wc-input"
                                        placeholder="至少6位密码"
                                        value={newUser.value.password}
                                        onInput={(e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            newUser.value.password = target.value;
                                        }}
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">
                                        <span class="text-red-500">*</span> 昵称
                                    </label>
                                    <input
                                        type="text"
                                        class="wc-input"
                                        placeholder="请输入昵称"
                                        value={newUser.value.nickname}
                                        onInput={(e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            newUser.value.nickname = target.value;
                                        }}
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">手机号</label>
                                    <input
                                        type="tel"
                                        class="wc-input"
                                        placeholder="可选"
                                        value={newUser.value.phone}
                                        onInput={(e: Event) => {
                                            const target = e.target as HTMLInputElement;
                                            newUser.value.phone = target.value;
                                        }}
                                    />
                                </div>

                                <div>
                                    <label class="block text-sm font-medium text-stone-700 mb-1">角色</label>
                                    <select
                                        class="wc-input"
                                        value={newUser.value.role}
                                        onChange={(e: Event) => {
                                            const target = e.target as HTMLSelectElement;
                                            newUser.value.role = target.value;
                                        }}
                                    >
                                        <option value="USER">普通用户</option>
                                        <option value="CREATOR">创作者</option>
                                        <option value="ADMIN">管理员</option>
                                    </select>
                                </div>
                            </div>

                            <div class="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    class="flex-1 wc-btn wc-btn-primary"
                                    onClick={createNewUser}
                                >
                                    创建用户
                                </button>
                                <button
                                    type="button"
                                    class="wc-btn px-4 py-2 border border-stone-300 text-stone-700 hover:bg-stone-50"
                                    onClick={() => showAddModal.value = false}
                                >
                                    取消
                                </button>
                            </div>
                        </div>
                    </div>
                ) : null}
            </div>
        );
    }
});