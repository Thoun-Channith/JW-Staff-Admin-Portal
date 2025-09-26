<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref(null);
const isLoading = ref(false);

const handleLogin = async () => {
  error.value = null;
  isLoading.value = true;
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;

    // After login, check the user's role in Firestore
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().role === "admin") {
      // If user is an admin, proceed to the dashboard
      router.push("/");
    } else {
      // If not an admin, sign them out and show an error
      await signOut(auth);
      error.value = "You do not have permission to access the admin portal.";
    }
  } catch (e) {
    console.error("Login failed:", e.message);
    // Provide a generic error for security reasons
    error.value = "Invalid email or password.";
  } finally {
    isLoading.value = false;
  }
};
</script>

<!-- Your existing <template> code goes here -->

<template>
  <div class="flex min-h-screen px-56 py-16 bg-primary-dark">
    <!-- Branding Section (Left Side) -->
    <div class="flex-col justify-between hidden p-12 text-white lg:flex lg:w-1/2 bg-creamy-white">
      <div class="flex flex-col items-center justify-start h-full text-center">
        <img class="w-52 h-52" src="/images/O-logo.svg" alt="Company Logo" />
        <img class="mt-10 w-69" src="/images/text-logo.svg" alt="Company Name" />
        <h1 class="mt-6 text-3xl font-bold tracking-tight text-primary-dark">
          Welcome to the Admin Portal
        </h1>
        <p class="mt-4 text-lg text-neutral-grey">
          Monitor your staff's activity and status in real-time.
        </p>
      </div>
    </div>

    <!-- Form Section (Right Side) -->
    <div class="flex flex-col items-center justify-center flex-1 p-6 bg-gray-50 lg:p-12">
      <div class="w-full max-w-md mx-auto">
        <!-- Logo for smaller screens -->
        <div class="mb-8 text-center lg:hidden">
          <img class="w-20 h-20 mx-auto" src="/images/O-logo.svg" alt="Company Logo" />
        </div>

        <div>
          <h2 class="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p class="mt-2 text-sm text-neutral-grey">Please enter your credentials to continue.</p>
        </div>

        <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
            <div class="mt-1">
              <input
                v-model="email"
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <div class="mt-1">
              <input
                v-model="password"
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="w-full px-4 py-3 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-light focus:border-primary-light"
              />
            </div>
          </div>

          <div v-if="error" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
            {{ error }}
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex justify-center w-full px-4 py-3 text-sm font-medium text-white transition-colors border border-transparent rounded-md shadow-sm bg-primary-light hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50"
            >
              <span v-if="!isLoading">Sign in</span>
              <svg
                v-else
                class="w-5 h-5 text-white animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
