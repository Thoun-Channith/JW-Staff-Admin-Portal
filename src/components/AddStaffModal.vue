<script setup>
import { ref } from "vue";
import { Dialog, DialogPanel, DialogTitle, TransitionRoot, TransitionChild } from "@headlessui/vue";
import { getFunctions, httpsCallable } from "firebase/functions";

defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(["close"]);

const newStaff = ref({
  displayName: "",
  email: "",
  password: "",
  employeeId: "",
  position: "",
});

const isLoading = ref(false);
const error = ref(null);
const successMessage = ref(null);

function closeModal() {
  emit("close");
  // Reset form after a short delay to allow closing animation
  setTimeout(() => {
    newStaff.value = { displayName: "", email: "", password: "", employeeId: "", position: "" };
    error.value = null;
    successMessage.value = null;
  }, 300);
}

async function handleAddStaff() {
  isLoading.value = true;
  error.value = null;
  successMessage.value = null;

  try {
    const functions = getFunctions();
    // 'createStaffUser' must match the exported function name in index.ts
    const createStaffUser = httpsCallable(functions, "createStaffUser");
    const result = await createStaffUser(newStaff.value);

    successMessage.value = result.data.message;

    // Close modal after a success message
    setTimeout(closeModal, 2000);
  } catch (err) {
    console.error("Error calling cloud function:", err);
    error.value = err.message || "An unexpected error occurred.";
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-10">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-40" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex items-center justify-center min-h-full p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md p-6 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl dark:bg-dark-card"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-semibold leading-6 text-gray-900 dark:text-dark-text"
              >
                Add New Staff Member
              </DialogTitle>

              <form @submit.prevent="handleAddStaff" class="mt-6 space-y-4">
                <div>
                  <label
                    for="add-employeeId"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Employee ID</label
                  >
                  <input
                    required
                    type="text"
                    v-model="newStaff.employeeId"
                    id="add-employeeId"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>
                <div>
                  <label
                    for="add-name"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Full Name</label
                  >
                  <input
                    required
                    type="text"
                    v-model="newStaff.displayName"
                    id="add-name"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>
                <div>
                  <label
                    for="add-position"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Position</label
                  >
                  <input
                    required
                    type="text"
                    v-model="newStaff.position"
                    id="add-position"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>
                <div>
                  <label
                    for="add-email"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Email Address</label
                  >
                  <input
                    required
                    type="email"
                    v-model="newStaff.email"
                    id="add-email"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>
                <div>
                  <label
                    for="add-password"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Initial Password</label
                  >
                  <input
                    required
                    type="password"
                    v-model="newStaff.password"
                    id="add-password"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>

                <!-- Error and Success Messages -->
                <div v-if="error" class="p-3 text-sm text-red-700 bg-red-100 rounded-md">
                  {{ error }}
                </div>
                <div
                  v-if="successMessage"
                  class="p-3 text-sm text-green-700 bg-green-100 rounded-md"
                >
                  {{ successMessage }}
                </div>

                <div class="flex justify-end pt-6 space-x-4">
                  <button
                    type="button"
                    @click="closeModal"
                    class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="isLoading"
                    class="inline-flex justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-primary-light hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light disabled:opacity-50"
                  >
                    <span v-if="isLoading">Creating...</span>
                    <span v-else>Create Staff</span>
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
