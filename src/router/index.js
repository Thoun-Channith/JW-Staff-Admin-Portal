import { createRouter, createWebHistory } from "vue-router";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import DashboardView from "../views/DashboardView.vue";
import LoginView from "../views/LoginView.vue";
import TrackingView from "../views/TrackingView.vue"; // Import the new view

// Helper to wait for Firebase auth to be ready
const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(user);
      },
      reject
    );
  });
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "Dashboard", // Give the route a name
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: "/tracking", // Add the new tracking route
      name: "Tracking",
      component: TrackingView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "Login",
      component: LoginView,
    },
  ],
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const user = await getCurrentUser();

  if (requiresAuth && !user) {
    next("/login");
  } else if (to.path === "/login" && user) {
    next("/");
  } else {
    next();
  }
});

export default router;
