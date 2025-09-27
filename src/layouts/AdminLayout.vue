<script setup>
import { useRouter, useRoute, RouterLink } from "vue-router";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import { ref, onMounted, onUnmounted } from "vue";

const router = useRouter();
const route = useRoute();
const userEmail = ref("admin@example.com");
let authUnsubscribe = null;

const isDarkMode = ref(true);

const applyTheme = () => {
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value;
  localStorage.setItem("darkMode", isDarkMode.value);
  applyTheme();
};

onMounted(() => {
  const savedMode = localStorage.getItem("darkMode");
  isDarkMode.value = savedMode === "true";
  applyTheme();

  authUnsubscribe = onAuthStateChanged(auth, (user) => {
    if (user) {
      userEmail.value = user.email;
    }
  });
});

onUnmounted(() => {
  if (authUnsubscribe) authUnsubscribe();
});

const handleLogout = async () => {
  try {
    await signOut(auth);
    router.push("/login");
  } catch (error) {
    console.error("Error signing out:", error);
  }
};
</script>

<template>
  <div class="flex h-screen font-sans bg-gray-50 dark:bg-dark-bg">
    <aside
      class="flex-col hidden w-64 bg-white border-r md:flex dark:bg-dark-card dark:border-dark-border"
    >
      <div class="flex items-center justify-center h-20 border-b shrink-0 dark:border-dark-border">
        <img src="/images/text-logo.svg" class="h-6 py-0.5" alt="Company Name" />
      </div>

      <nav class="flex-1 px-4 py-6 space-y-4 overflow-y-auto">
        <div>
          <h3 class="px-4 mb-2 text-xs font-semibold tracking-wider uppercase text-neutral-grey">
            Dashboard
          </h3>
          <RouterLink
            to="/"
            :class="[
              'flex items-center px-4 py-2 text-sm font-medium rounded-md',
              route.name === 'Dashboard'
                ? 'bg-primary-light text-white'
                : 'text-neutral-grey hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
              ></path>
            </svg>
            Staff List
          </RouterLink>
          <RouterLink
            to="/tracking"
            :class="[
              'flex items-center px-4 py-2 text-sm font-medium rounded-md',
              route.name === 'Tracking'
                ? 'bg-primary-light text-white'
                : 'text-neutral-grey hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              ></path>
            </svg>
            Tracking
          </RouterLink>
          <RouterLink
            to="/attendance"
            :class="[
              'flex items-center px-4 py-2 text-sm font-medium rounded-md',
              route.name === 'Attendance'
                ? 'bg-primary-light text-white'
                : 'text-neutral-grey hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            Attendance
          </RouterLink>
          <RouterLink
            to="/reports"
            :class="[
              'flex items-center px-4 py-2 text-sm font-medium rounded-md',
              route.name === 'Reports'
                ? 'bg-primary-light text-white'
                : 'text-neutral-grey hover:bg-gray-100 dark:hover:bg-gray-700',
            ]"
          >
            <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              ></path>
            </svg>
            Reports
          </RouterLink>
        </div>
        <div>
          <h3 class="px-4 mb-2 text-xs font-semibold tracking-wider uppercase text-neutral-grey">
            System
          </h3>
          <div
            class="flex items-center justify-between px-4 py-2 text-sm font-medium rounded-md text-neutral-grey"
          >
            <div class="flex items-center">
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                ></path>
              </svg>
              Dark mode
            </div>
            <button
              @click="toggleDarkMode"
              :class="isDarkMode ? 'bg-primary-light' : 'bg-gray-200'"
              class="relative inline-flex items-center h-6 transition-colors rounded-full w-11"
            >
              <span
                :class="isDarkMode ? 'translate-x-6' : 'translate-x-1'"
                class="inline-block w-4 h-4 transition-transform transform bg-white rounded-full"
              />
            </button>
          </div>
        </div>
      </nav>

      <div class="px-4 py-4 border-t shrink-0 dark:border-dark-border">
        <div class="flex items-center">
          <div
            class="flex items-center justify-center w-10 h-10 font-bold text-white rounded-full bg-primary-dark"
          >
            A
          </div>
          <div class="ml-3">
            <p class="text-sm font-medium text-gray-800 dark:text-dark-text">Admin Manager</p>
            <p class="text-xs text-neutral-grey">{{ userEmail }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex items-center w-full px-4 py-2 mt-4 text-sm rounded-md text-neutral-grey hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            ></path>
          </svg>
          Log out
        </button>
      </div>
    </aside>

    <div class="flex flex-col flex-1 overflow-y-auto">
      <header
        class="flex items-center justify-between h-20 px-6 bg-white border-b dark:bg-dark-card dark:border-dark-border"
      >
        <h1 class="text-xl font-semibold text-gray-800 dark:text-dark-text">{{ route.name }}</h1>
      </header>
      <main class="p-6 sm:p-8 md:p-10">
        <slot></slot>
      </main>
    </div>
  </div>
</template>
