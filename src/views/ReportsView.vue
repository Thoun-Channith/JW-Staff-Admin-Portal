<script setup>
import { ref } from "vue";
import AdminLayout from "../layouts/AdminLayout.vue";

const reportType = ref("workHours"); // or 'routeHistory'
</script>

<template>
  <AdminLayout>
    <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-dark-card">
      <h2 class="text-2xl font-semibold text-gray-900 dark:text-dark-text">Reports & Analytics</h2>

      <div class="mt-4">
        <div class="sm:hidden">
          <label for="tabs" class="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            class="block w-full py-2 pl-3 pr-10 text-base border-gray-300 rounded-md focus:outline-none focus:ring-primary-light focus:border-primary-light sm:text-sm"
          >
            <option @click="reportType = 'workHours'" :selected="reportType === 'workHours'">
              Work Hours
            </option>
            <option @click="reportType = 'routeHistory'" :selected="reportType === 'routeHistory'">
              Route History
            </option>
          </select>
        </div>
        <div class="hidden sm:block">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px space-x-8" aria-label="Tabs">
              <button
                @click="reportType = 'workHours'"
                :class="[
                  reportType === 'workHours'
                    ? 'border-primary-light text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                ]"
              >
                Work Hours
              </button>
              <button
                @click="reportType = 'routeHistory'"
                :class="[
                  reportType === 'routeHistory'
                    ? 'border-primary-light text-primary-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                ]"
              >
                Route History
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div class="mt-8">
        <div v-if="reportType === 'workHours'">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text">
            Daily, Weekly, and Monthly Work Hours
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Analytics on work hours will be displayed here.
          </p>
        </div>
        <div v-if="reportType === 'routeHistory'">
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-dark-text">
            Route History with Map Replay
          </h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Map replay functionality for staff routes will be available here.
          </p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
