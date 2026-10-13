import { createApp } from "vue";
import { createPinia } from "pinia";
import { createRouter, createWebHistory } from "vue-router";
import "./style.css";
import App from "./App.vue";
import { useAuthStore } from "./stores/auth";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { CreatorApplyPage } from "./pages/CreatorApplyPage";
import { AdminCreatorApplicationsPage } from "./pages/AdminCreatorApplicationsPage";
import { AdminProductsPage } from "./pages/AdminProductsPage";
import { AdminOrdersPage } from "./pages/AdminOrdersPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminCategoriesPage } from "./pages/AdminCategoriesPage";
import { AdminBrandsPage } from "./pages/AdminBrandsPage";
import { AdminRefundsPage } from "./pages/AdminRefundsPage";
import { AdminOrderStatsPage } from "./pages/AdminOrderStatsPage";
import { AdminCreatorsPage } from "./pages/AdminCreatorsPage";
import { AdminCreatorStatsPage } from "./pages/AdminCreatorStatsPage";
import { AdminUserStatsPage } from "./pages/AdminUserStatsPage";
import { AboutPage } from "./pages/AboutPage";
import { ScenicSpotsPage } from "./pages/ScenicSpotsPage";
import { ScenicSpotDetailPage } from "./pages/ScenicSpotDetailPage";
import { IPProductsPage } from "./pages/IPProductsPage";
import { IPStoriesPage } from "./pages/IPStoriesPage";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: HomePage },
    { path: "/about", component: AboutPage },
    { path: "/ip-products", component: IPProductsPage },
    { path: "/ip-stories", component: IPStoriesPage },
    { path: "/scenic-spots", component: ScenicSpotsPage },
    { path: "/scenic-spots/:id", component: ScenicSpotDetailPage },
    { path: "/admin", redirect: "/admin/products" },
    { path: "/login", component: LoginPage },
    { path: "/products/:id", component: ProductDetailPage },
    { path: "/cart", component: CartPage, meta: { requiresAuth: true } },
    { path: "/checkout", component: CheckoutPage, meta: { requiresAuth: true } },
    { path: "/orders", component: OrdersPage, meta: { requiresAuth: true } },
    { path: "/orders/:id", component: OrderDetailPage, meta: { requiresAuth: true } },
    { path: "/creator/apply", component: CreatorApplyPage, meta: { requiresAuth: true } },
    { path: "/admin/creator-applications", component: AdminCreatorApplicationsPage, meta: { requiresAuth: true } },
    { path: "/admin/products", component: AdminProductsPage, meta: { requiresAuth: true } },
    { path: "/admin/categories", component: AdminCategoriesPage, meta: { requiresAuth: true } },
    { path: "/admin/brands", component: AdminBrandsPage, meta: { requiresAuth: true } },
    { path: "/admin/orders", component: AdminOrdersPage, meta: { requiresAuth: true } },
    { path: "/admin/orders/:id", component: OrderDetailPage, meta: { requiresAuth: true } },
    { path: "/admin/refunds", component: AdminRefundsPage, meta: { requiresAuth: true } },
    { path: "/admin/order-stats", component: AdminOrderStatsPage, meta: { requiresAuth: true } },
    { path: "/admin/creators", component: AdminCreatorsPage, meta: { requiresAuth: true } },
    { path: "/admin/creator-stats", component: AdminCreatorStatsPage, meta: { requiresAuth: true } },
    { path: "/admin/users", component: AdminUsersPage, meta: { requiresAuth: true } },
    { path: "/admin/user-stats", component: AdminUserStatsPage, meta: { requiresAuth: true } },
  ]
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  auth.restore();
  if (to.meta.requiresAuth && !auth.isAuthed) return "/login";
  return true;
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");