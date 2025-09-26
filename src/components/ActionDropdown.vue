<script setup>
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/vue";

// Define props and emits for component communication
defineProps({
  staff: {
    type: Object,
    required: true,
  },
});
const emit = defineEmits(["update", "toggle-status"]);
</script>

<template>
  <div class="relative inline-block text-left">
    <!-- The 'static' prop is the key to fixing the scrollbar issue. -->
    <Menu as="div" class="relative">
      <div>
        <MenuButton
          class="inline-flex justify-center w-full p-1 text-sm font-medium text-gray-500 rounded-full hover:bg-gray-200 focus:outline-none dark:hover:bg-gray-700"
        >
          <svg
            class="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"
            ></path>
          </svg>
        </MenuButton>
      </div>

      <transition
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <MenuItems
          class="absolute right-0 z-10 w-40 p-1 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-card dark:ring-gray-700 dark:divide-gray-700"
        >
          <MenuItem v-slot="{ active }">
            <button
              @click="emit('update', staff)"
              :class="[
                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                'group flex rounded-md items-center w-full px-2 py-2 text-sm text-gray-900 dark:text-dark-text',
              ]"
            >
              <svg
                class="w-5 h-5 mr-2 text-yellow-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                ></path>
              </svg>
              Update
            </button>
          </MenuItem>
          <MenuItem v-slot="{ active }">
            <button
              @click="emit('toggle-status', staff)"
              :class="[
                active ? 'bg-gray-100 dark:bg-gray-700' : '',
                staff.accountEnabled ? 'text-red-600' : 'text-green-600',
                'group flex rounded-md items-center w-full px-2 py-2 text-sm',
              ]"
            >
              <svg
                v-if="staff.accountEnabled"
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                ></path>
              </svg>
              <svg
                v-else
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {{ staff.accountEnabled ? "Disable" : "Enable" }}
            </button>
          </MenuItem>
        </MenuItems>
      </transition>
    </Menu>
  </div>
</template>
