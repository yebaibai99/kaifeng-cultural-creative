import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";

type ScenicSpot = {
    id: number;
    name: string;
    description: string;
    coverImageUrl: string;
    productCount: number;
};

export const ScenicSpotsPage = defineComponent({
    name: "ScenicSpotsPage",
    setup() {
        const router = useRouter();
        const spots = ref<ScenicSpot[]>([]);
        const loading = ref(false);
        const msg = ref("");

        async function loadScenicSpots() {
            loading.value = true;
            try {
                const data = await apiFetch<any[]>("/api/scenic-spots");
                spots.value = (data || []).map(spot => ({
                    ...spot,
                    productCount: spot.productCount || 0
                }));
            } catch (e) {
                msg.value = e instanceof Error ? e.message : "加载失败";
            } finally {
                loading.value = false;
            }
        }

        function navigateToSpot(id: number) {
            router.push(`/scenic-spots/${id}`);
        }

        onMounted(async () => {
            await loadScenicSpots();
        });

        return () => (
            <div class="mx-auto max-w-7xl">
                {/* 页面标题 - 修改为首页同款深色渐变 */}
                <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl mb-8 shadow-xl">
                    <div class="absolute inset-0 opacity-20">
                        <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-red-900/30 blur-3xl" />
                        <div class="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-amber-900/20 blur-3xl" />
                    </div>
                    <div class="relative z-10 px-8 py-16 md:py-20 text-center">
                        <div class="inline-block px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-4 backdrop-blur-sm tracking-wider">
                            开封名胜 · 文创精品
                        </div>
                        <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-[0.2em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                            景点文创
                        </h1>
                        <p class="text-stone-300 text-lg md:text-xl tracking-[0.3em]">
                            探索开封著名景点，发现独特文创产品
                        </p>
                        <div class="mt-6 text-xs text-stone-400 tracking-wider">
                            EXPLORE KAIFENG SCENIC SPOTS
                        </div>
                    </div>
                </section>

                {/* 提示消息 */}
                {msg.value ? (
                    <div class="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                        {msg.value}
                    </div>
                ) : null}

                {/* 景点列表 */}
                {loading.value ? (
                    <div class="text-center py-12 text-stone-500">加载中...</div>
                ) : spots.value.length === 0 ? (
                    <div class="text-center py-12 text-stone-500">暂无景点数据</div>
                ) : (
                    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {spots.value.map((spot) => (
                            <div
                                key={spot.id}
                                class="group bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-red-900/5 transition-all cursor-pointer"
                                onClick={() => navigateToSpot(spot.id)}
                            >
                                <div class="relative h-48 overflow-hidden">
                                    <img
                                        src={spot.coverImageUrl || "https://images.unsplash.com/photo-1599571234909-29ed5d1321d6?auto=format&fit=crop&w=800&q=80"}
                                        alt={spot.name}
                                        class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                    <div class="absolute bottom-0 left-0 right-0 p-6">
                                        <h3 class="text-xl font-bold text-white mb-1">{spot.name}</h3>
                                        <span class="inline-flex items-center px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">
                                            {spot.productCount || 0} 件文创
                                        </span>
                                    </div>
                                </div>
                                <div class="p-6">
                                    <p class="text-stone-600 text-sm leading-relaxed line-clamp-3 mb-4">
                                        {spot.description}
                                    </p>
                                    <div class="flex items-center justify-between">
                                        <span class="text-sm text-stone-500">查看文创产品 →</span>
                                        <div class="w-8 h-8 rounded-full bg-red-800 text-white flex items-center justify-center group-hover:bg-red-700 transition-colors">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    }
});