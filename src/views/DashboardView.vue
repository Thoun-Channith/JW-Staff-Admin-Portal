<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout.vue";
import UpdateStaffModal from "../components/UpdateStaffModal.vue";
import AddStaffModal from "../components/AddStaffModal.vue";

const staffList = ref([]);
const isLoading = ref(true);
const errorMessage = ref(null);
const searchQuery = ref("");

const isUpdateModalOpen = ref(false);
const isAddModalOpen = ref(false);
const selectedStaff = ref(null);

let unsubscribe = null;
onMounted(() => {
  const q = query(collection(db, "users"), where("role", "==", "staff"));
  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      staffList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      isLoading.value = false;
      errorMessage.value = null;
    },
    (error) => {
      console.error("Error fetching staff list:", error);
      errorMessage.value =
        "Failed to load staff data. This could be due to database permissions (security rules) or a missing index. Please check the browser console for more details.";
      isLoading.value = false;
    }
  );
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const totalStaff = computed(() => staffList.value.length);
const clockedInCount = computed(() => staffList.value.filter((staff) => staff.isClockedIn).length);
const clockedOutCount = computed(() => totalStaff.value - clockedInCount.value);

const filteredStaffList = computed(() => {
  if (!searchQuery.value) return staffList.value;
  return staffList.value.filter((staff) => {
    const name = staff.displayName || staff.name || "";
    const email = staff.email || "";
    const position = staff.position || "";
    const employeeId = staff.employeeId || "";
    return (
      name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      position.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      employeeId.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

function openAddStaffModal() {
  isAddModalOpen.value = true;
}
function closeAddStaffModal() {
  isAddModalOpen.value = false;
}
function openUpdateModal(staff) {
  const staffToUpdate = { ...staff };
  if (!staffToUpdate.displayName && staffToUpdate.name) {
    staffToUpdate.displayName = staffToUpdate.name;
  } else if (!staffToUpdate.displayName) {
    staffToUpdate.displayName = "";
  }
  selectedStaff.value = staffToUpdate;
  isUpdateModalOpen.value = true;
}
function closeUpdateModal() {
  isUpdateModalOpen.value = false;
}
</script>

<template>
  <AdminLayout>
    <div class="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-3">
      <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-dark-card">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 text-white rounded-full bg-primary-dark">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-grey">Total Staff</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-dark-text">{{ totalStaff }}</p>
          </div>
        </div>
      </div>
      <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-dark-card">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 text-green-800 bg-green-100 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-grey">Clocked In</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              {{ clockedInCount }}
            </p>
          </div>
        </div>
      </div>
      <div class="p-6 bg-white rounded-lg shadow-sm dark:bg-dark-card">
        <div class="flex items-center">
          <div class="flex-shrink-0 p-3 text-red-800 bg-red-100 rounded-full">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-neutral-grey">Clocked Out</p>
            <p class="text-2xl font-semibold text-gray-900 dark:text-dark-text">
              {{ clockedOutCount }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="overflow-x-auto bg-white rounded-lg shadow-sm dark:bg-dark-card">
      <div v-if="isLoading" class="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>Loading staff data...</p>
      </div>
      <div v-else-if="errorMessage" class="p-6 text-center text-red-600 rounded-lg bg-red-50">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else>
        <div class="flex items-center justify-between p-4 border-b dark:border-dark-border">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg
                class="w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search by ID, name, etc..."
              class="w-full py-2 pl-10 pr-4 border border-gray-300 rounded-md sm:w-64 focus:ring-primary-light focus:border-primary-light dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
            />
          </div>
          <button
            @click="openAddStaffModal"
            title="Add New Staff"
            class="inline-flex items-center justify-center w-10 h-10 text-white border border-transparent rounded-full shadow-sm bg-primary-light hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
          </button>
        </div>

        <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Employee ID
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Position
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Email
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Status
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Last Seen
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-right text-gray-500 uppercase dark:text-gray-300"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white divide-y divide-gray-200 dark:bg-dark-card dark:divide-dark-border"
          >
            <tr v-if="filteredStaffList.length === 0">
              <td colspan="7" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No staff members found.
              </td>
            </tr>
            <tr
              v-for="staff in filteredStaffList"
              :key="staff.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td
                class="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap dark:text-gray-300"
              >
                {{ staff.employeeId || "N/A" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900 dark:text-dark-text">
                  {{ staff.displayName || staff.name || "No Name" }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                {{ staff.position || "N/A" }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-500 whitespace-nowrap dark:text-gray-400">
                {{ staff.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="
                    staff.accountEnabled === false
                      ? 'bg-red-100 text-red-800'
                      : staff.isClockedIn
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 dark:bg-gray-600 dark:text-gray-200 text-gray-800'
                  "
                  class="inline-flex px-3 py-1 text-xs font-semibold leading-5 rounded-full"
                  >{{
                    staff.accountEnabled === false
                      ? "Disabled"
                      : staff.isClockedIn
                      ? "Clocked In"
                      : "Clocked Out"
                  }}</span
                >
              </td>
              <td class="px-6 py-4 text-sm whitespace-nowrap text-neutral-grey">
                {{ formatTimestamp(staff.lastSeen) }}
              </td>
              <td class="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                <button
                  @click="openUpdateModal(staff)"
                  class="font-medium text-primary-light hover:text-primary-dark"
                >
                  Update
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <AddStaffModal :is-open="isAddModalOpen" @close="closeAddStaffModal" />

    <UpdateStaffModal
      :is-open="isUpdateModalOpen"
      :staff="selectedStaff"
      @close="closeUpdateModal"
    />
  </AdminLayout>
</template>
