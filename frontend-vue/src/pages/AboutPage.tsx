import { defineComponent, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { apiFetch } from "../lib/api";

export const AboutPage = defineComponent({
    name: "AboutPage",
    setup() {
        const router = useRouter();
        const brands = ref<{ id: number; name: string; logo: string; description: string; origin: string; foundYear: number }[]>([]);
        const brandsLoading = ref(true);

        async function loadBrands() {
            try {
                const data = await apiFetch<any[]>('/api/brands/active');
                brands.value = data || [];
            } catch (e) {
                brands.value = [];
            } finally {
                brandsLoading.value = false;
            }
        }

        function navigateToIPProducts() {
            router.push("/ip-products");
        }

        onMounted(() => {
            void loadBrands();
        });

        return () => (
            <div class="mx-auto max-w-6xl">
                <div class="space-y-8">
                    {/* 页面标题区域 - 首页同款深色渐变 */}
                    <section class="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white rounded-3xl shadow-xl">
                        <div class="absolute inset-0 opacity-20">
                            <div class="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-red-900/30 blur-3xl" />
                            <div class="absolute -bottom-20 left-10 h-80 w-80 rounded-full bg-amber-900/20 blur-3xl" />
                        </div>
                        <div class="relative z-10 px-8 py-16 md:py-20 text-center">
                            <div class="inline-block px-4 py-2 bg-white/10 rounded-full text-white/80 text-sm mb-4 backdrop-blur-sm tracking-wider">
                                汴梁风物 · 宋韵雅集
                            </div>
                            <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-[0.2em]" style={{ fontFamily: "STSong, 'Noto Serif SC', serif" }}>
                                开封文创
                            </h1>
                            <p class="text-stone-300 text-lg md:text-xl tracking-[0.3em]">
                                深挖千年宋文化，打造当代文创精品
                            </p>
                            <div class="mt-6 text-xs text-stone-400 tracking-wider">
                                THE SERIES OF KAIFENG CULTURAL PRODUCTS
                            </div>
                        </div>
                    </section>

                    {/* IP文创入口卡片 */}
                    <div
                        class="relative overflow-hidden rounded-2xl p-8 md:p-10 shadow-lg cursor-pointer group hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                        onClick={navigateToIPProducts}
                    >
                        {/* 背景装饰光晕 */}
                        <div class="absolute inset-0 opacity-15">
                            <div class="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white blur-3xl"/>
                            <div class="absolute -left-10 -bottom-10 h-48 w-48 rounded-full bg-blue-300 blur-3xl"/>
                        </div>

                        <div class="relative z-10 flex flex-col md:flex-row items-start gap-6">
                            <div class="flex-1 text-left">
                                <div
                                    class="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-bold rounded-full mb-3 border border-white/30">
                                    <span>✨</span>
                                    <span>全新IP专区</span>
                                </div>
                                <h2 class="text-2xl md:text-3xl font-bold text-white mb-2"
                                    style={{fontFamily: "STSong, 'Noto Serif SC', serif"}}>
                                    开封IP文创
                                </h2>
                                <p class="text-white/90 text-base md:text-lg mb-3 leading-relaxed">
                                    清明娃、包公盲盒、宋小哥...萌化历史，让宋朝文化走进你的生活！
                                </p>
                                <div
                                    class="flex items-center justify-start gap-2 text-white/80 group-hover:text-white transition-colors">
                                    <span class="text-sm font-medium">立即探索 IP 文创</span>
                                    <svg class="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300"
                                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                              d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                                    </svg>
                                </div>
                            </div>
                            <div class="hidden md:block">
                                <div
                                    class="px-8 py-4 bg-white text-blue-600 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105 font-bold text-sm">
                                    进入专区 →
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 文创简介 */}
                    <div class="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                        <div class="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 md:px-8 py-5">
                            <div class="flex items-center gap-3">
                                <span class="h-5 w-1 rounded-full bg-red-800"></span>
                                <h2 class="text-xl font-bold text-stone-900">文创简介</h2>
                            </div>
                        </div>
                        <div class="px-6 md:px-8 py-8 space-y-4 text-stone-700 leading-relaxed">
                            <p class="text-base">
                                开封文创成立于2020年，致力于开封历史文化与文物文化创意延伸，深挖千年宋文化的内涵与文物背后的故事。
                                我们以"宋韵雅集"为核心理念，将传统文化与现代设计完美融合，让古老的汴梁文化在当代焕发新生。
                            </p>
                            <p class="text-base">
                                目前已开发文创产品近500款，涵盖汴绣、木版年画、清明上河图、开封府等经典文化元素。
                                与本地非遗传承人、手工艺者建立了深度合作关系，在传承传统文化的同时，助力乡村振兴与地方经济发展。
                            </p>
                            <p class="text-base">
                                我们以"汴梁风物"为主品牌，开发了"宋韵雅集""非遗传承""汴绣工坊""古城记忆"等子品牌，
                                全面打造产品类、活动类文创品牌矩阵。重视知识产权保护工作，多款产品荣获省级文创设计大赛奖项。
                            </p>
                        </div>
                    </div>

                    {/* 品牌故事 */}
                    <div class="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                        <div class="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 md:px-8 py-5">
                            <div class="flex items-center gap-3">
                                <span class="h-5 w-1 rounded-full bg-red-800"></span>
                                <h2 class="text-xl font-bold text-stone-900">品牌故事</h2>
                            </div>
                        </div>
                        <div class="px-6 md:px-8 py-8">
                            <div class="grid md:grid-cols-2 gap-5">
                                <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 hover:shadow-md transition-shadow">
                                    <h3 class="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                                        <span class="text-xl">🎨</span> 汴绣传承
                                    </h3>
                                    <p class="text-stone-600 leading-relaxed text-sm">
                                        汴绣作为中国四大名绣之一，已有千年历史。我们与汴绣非遗传承人合作，
                                        将传统汴绣技艺融入现代文创产品，让这门古老的手工艺走进当代生活。
                                    </p>
                                </div>
                                <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 hover:shadow-md transition-shadow">
                                    <h3 class="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                                        <span class="text-xl">🏛️</span> 清明上河图
                                    </h3>
                                    <p class="text-stone-600 leading-relaxed text-sm">
                                        以北宋张择端《清明上河图》为灵感源泉，提取汴梁城繁华市井的经典元素，
                                        打造系列文创产品，让人们在日常生活中感受宋代文化魅力。
                                    </p>
                                </div>
                                <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 hover:shadow-md transition-shadow">
                                    <h3 class="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                                        <span class="text-xl">🖼️</span> 木版年画
                                    </h3>
                                    <p class="text-stone-600 leading-relaxed text-sm">
                                        朱仙镇木版年画是国家级非物质文化遗产，色彩鲜艳、造型夸张。
                                        我们将传统年画元素创新设计，开发出适合现代审美的文创产品。
                                    </p>
                                </div>
                                <div class="rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 hover:shadow-md transition-shadow">
                                    <h3 class="text-base font-bold text-red-800 mb-3 flex items-center gap-2">
                                        <span class="text-xl">🏯</span> 开封府文化
                                    </h3>
                                    <p class="text-stone-600 leading-relaxed text-sm">
                                        开封府作为北宋时期的行政中心，承载着丰富的历史文化内涵。
                                        我们以包公文化、宋代官署文化为主题，开发系列文创纪念品。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 品牌列表 */}
                    <div class="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                        <div class="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 md:px-8 py-5">
                            <div class="flex items-center gap-3">
                                <span class="h-5 w-1 rounded-full bg-red-800"></span>
                                <h2 class="text-xl font-bold text-stone-900">合作品牌</h2>
                            </div>
                        </div>
                        <div class="px-6 md:px-8 py-8">
                            {brandsLoading.value ? (
                                <div class="text-center py-8 text-sm text-stone-500">加载中...</div>
                            ) : brands.value.length === 0 ? (
                                <div class="text-center py-8 text-sm text-stone-500">暂无合作品牌</div>
                            ) : (
                                <div class="grid gap-5 md:grid-cols-3">
                                    {brands.value.map((brand) => (
                                        <div class="group rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-6 hover:shadow-lg hover:border-red-200 transition-all duration-300">
                                            <div class="flex items-center gap-4 mb-4">
                                                <div class="h-14 w-14 rounded-lg bg-gradient-to-br from-red-800 to-amber-700 flex items-center justify-center text-white text-xl font-bold shadow-md">
                                                    {brand.logo ? (
                                                        <img src={brand.logo} alt="" class="h-full w-full object-cover rounded-lg" />
                                                    ) : (
                                                        brand.name.charAt(0)
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 class="text-lg font-bold text-stone-900 group-hover:text-red-800 transition-colors">{brand.name}</h3>
                                                    {brand.foundYear && (
                                                        <span class="inline-block mt-1 px-2 py-0.5 bg-red-50 text-red-800 text-xs rounded-full">
                                                            创立于 {brand.foundYear} 年
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {brand.origin && (
                                                <div class="flex items-center gap-2 text-xs text-stone-500 mb-3">
                                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                                    </svg>
                                                    {brand.origin}
                                                </div>
                                            )}
                                            {brand.description && (
                                                <p class="text-sm text-stone-600 leading-relaxed">
                                                    {brand.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 发展历程 */}
                    <div class="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                        <div class="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 md:px-8 py-5">
                            <div class="flex items-center gap-3">
                                <span class="h-5 w-1 rounded-full bg-red-800"></span>
                                <h2 class="text-xl font-bold text-stone-900">发展历程</h2>
                            </div>
                        </div>
                        <div class="px-6 md:px-8 py-8">
                            <div class="space-y-6">
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-20 md:w-24 text-right">
                                        <span class="inline-block px-3 py-1 bg-red-800 text-white rounded-full text-xs md:text-sm font-bold">2020</span>
                                    </div>
                                    <div class="flex-1 border-l-2 border-stone-200 pl-5 md:pl-6 pb-6">
                                        <h3 class="font-bold text-stone-900 mb-1 text-sm md:text-base">品牌创立</h3>
                                        <p class="text-stone-600 text-xs md:text-sm">开封文创品牌正式成立，确立"传承宋韵、匠心文创"的发展理念</p>
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-20 md:w-24 text-right">
                                        <span class="inline-block px-3 py-1 bg-red-800 text-white rounded-full text-xs md:text-sm font-bold">2021</span>
                                    </div>
                                    <div class="flex-1 border-l-2 border-stone-200 pl-5 md:pl-6 pb-6">
                                        <h3 class="font-bold text-stone-900 mb-1 text-sm md:text-base">产品发布</h3>
                                        <p class="text-stone-600 text-xs md:text-sm">首批文创产品上线，涵盖汴绣、年画、书签等系列，获得市场好评</p>
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-20 md:w-24 text-right">
                                        <span class="inline-block px-3 py-1 bg-red-800 text-white rounded-full text-xs md:text-sm font-bold">2022</span>
                                    </div>
                                    <div class="flex-1 border-l-2 border-stone-200 pl-5 md:pl-6 pb-6">
                                        <h3 class="font-bold text-stone-900 mb-1 text-sm md:text-base">非遗合作</h3>
                                        <p class="text-stone-600 text-xs md:text-sm">与多位非遗传承人建立合作，开发非遗文创系列，推动传统工艺活态传承</p>
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-20 md:w-24 text-right">
                                        <span class="inline-block px-3 py-1 bg-red-800 text-white rounded-full text-xs md:text-sm font-bold">2023</span>
                                    </div>
                                    <div class="flex-1 border-l-2 border-stone-200 pl-5 md:pl-6 pb-6">
                                        <h3 class="font-bold text-stone-900 mb-1 text-sm md:text-base">品牌升级</h3>
                                        <p class="text-stone-600 text-xs md:text-sm">推出线上电商平台，产品突破500款，荣获省级文创设计大赛金奖</p>
                                    </div>
                                </div>
                                <div class="flex gap-4">
                                    <div class="flex-shrink-0 w-20 md:w-24 text-right">
                                        <span class="inline-block px-3 py-1 bg-red-800 text-white rounded-full text-xs md:text-sm font-bold">2024</span>
                                    </div>
                                    <div class="flex-1 border-l-2 border-stone-200 pl-5 md:pl-6">
                                        <h3 class="font-bold text-stone-900 mb-1 text-sm md:text-base">未来展望</h3>
                                        <p class="text-stone-600 text-xs md:text-sm">持续深耕文创领域，打造国际化文化品牌，让世界感受开封文化魅力</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 文化理念 */}
                    <div class="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
                        <div class="border-b border-stone-100 bg-gradient-to-r from-stone-50 to-white px-6 md:px-8 py-5">
                            <div class="flex items-center gap-3">
                                <span class="h-5 w-1 rounded-full bg-red-800"></span>
                                <h2 class="text-xl font-bold text-stone-900">文化理念</h2>
                            </div>
                        </div>
                        <div class="px-6 md:px-8 py-10">
                            <div class="grid md:grid-cols-3 gap-6">
                                <div class="text-center p-6 rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white hover:shadow-md transition-shadow">
                                    <h3 class="font-bold text-red-800 mb-2 text-lg">传承</h3>
                                    <p class="text-stone-600 text-base">传承千年宋文化精髓，守护非遗技艺</p>
                                </div>
                                <div class="text-center p-6 rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white hover:shadow-md transition-shadow">
                                    <h3 class="font-bold text-red-800 mb-2 text-lg">创新</h3>
                                    <p class="text-stone-600 text-base">创新设计理念，让传统文化融入现代生活</p>
                                </div>
                                <div class="text-center p-6 rounded-xl border border-stone-200 bg-gradient-to-br from-stone-50 to-white hover:shadow-md transition-shadow">
                                    <h3 class="font-bold text-red-800 mb-2 text-lg">共赢</h3>
                                    <p class="text-stone-600 text-base">赋能非遗传承人，助力地方经济发展</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        );
    }
});