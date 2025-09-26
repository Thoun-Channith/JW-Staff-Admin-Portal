<script setup>
import { ref, watch } from "vue";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionRoot,
  TransitionChild,
  Switch,
} from "@headlessui/vue";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const props = defineProps({
  isOpen: Boolean,
  staff: Object,
});

const emit = defineEmits(["close"]);

const staffData = ref({});
const isLoading = ref(false);

// When the staff prop changes, update the local state
watch(
  () => props.staff,
  (newStaff) => {
    if (newStaff) {
      staffData.value = { ...newStaff };
    }
  },
  { immediate: true }
);

function closeModal() {
  emit("close");
}

async function handleSaveChanges() {
  if (!staffData.value.id) return;
  isLoading.value = true;

  const userDocRef = doc(db, "users", staffData.value.id);

  try {
    await updateDoc(userDocRef, {
      displayName: staffData.value.displayName,
      employeeId: staffData.value.employeeId,
      position: staffData.value.position,
      accountEnabled: staffData.value.accountEnabled,
    });
    console.log("Successfully updated staff details.");
    closeModal();
  } catch (error) {
    console.error("Error updating document:", error);
    alert("Failed to save changes. Please try again.");
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
                Update Staff Details
              </DialogTitle>
              <div class="mt-2">
                <p class="text-sm text-gray-500 dark:text-gray-400">
                  Make changes to the staff member's profile.
                </p>
              </div>

              <form @submit.prevent="handleSaveChanges" class="mt-6 space-y-4">
                <div>
                  <label
                    for="employeeId"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Employee ID</label
                  >
                  <input
                    type="text"
                    v-model="staffData.employeeId"
                    id="employeeId"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>
                <div>
                  <label
                    for="name"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Full Name</label
                  >
                  <input
                    type="text"
                    v-model="staffData.displayName"
                    id="name"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>
                <div>
                  <label
                    for="position"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >Position</label
                  >
                  <input
                    type="text"
                    v-model="staffData.position"
                    id="position"
                    class="block w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary-light focus:border-primary-light sm:text-sm dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
                  />
                </div>

                <div class="flex items-center justify-between pt-2">
                  <span class="text-sm font-medium text-gray-900 dark:text-dark-text"
                    >Account Enabled</span
                  >
                  <Switch
                    v-model="staffData.accountEnabled"
                    :class="
                      staffData.accountEnabled ? 'bg-primary-light' : 'bg-gray-300 dark:bg-gray-700'
                    "
                    class="relative inline-flex items-center h-6 transition-colors rounded-full w-11 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light dark:focus:ring-offset-dark-card"
                  >
                    <span
                      :class="staffData.accountEnabled ? 'translate-x-6' : 'translate-x-1'"
                      class="inline-block w-4 h-4 transition-transform transform bg-white rounded-full"
                    />
                  </Switch>
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
                    <span v-if="isLoading">Saving...</span>
                    <span v-else>Save Changes</span>
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
