<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { collection, onSnapshot, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout.vue";

const attendanceRecords = ref([]);
const staffList = ref([]);
const isLoading = ref(true);
const filterDate = ref(new Date().toISOString().slice(0, 10));

// Fetch staff data to map user IDs to names
let staffUnsubscribe = null;
onMounted(() => {
  const staffQuery = query(collection(db, "users"), where("role", "==", "staff"));
  staffUnsubscribe = onSnapshot(staffQuery, (snapshot) => {
    const staff = {};
    snapshot.docs.forEach((doc) => {
      staff[doc.id] = doc.data().displayName || doc.data().name || "Unknown";
    });
    staffList.value = staff;
  });
});

// Fetch attendance data
let attendanceUnsubscribe = null;
onMounted(() => {
  const attendanceQuery = query(collection(db, "attendance"), orderBy("checkInTime", "desc"));
  attendanceUnsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
    attendanceRecords.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    isLoading.value = false;
  });
});

onUnmounted(() => {
  if (staffUnsubscribe) staffUnsubscribe();
  if (attendanceUnsubscribe) attendanceUnsubscribe();
});

const getStaffName = (userId) => {
  return staffList.value[userId] || "Unknown";
};

const filteredAttendanceRecords = computed(() => {
  if (!filterDate.value) {
    return attendanceRecords.value;
  }
  return attendanceRecords.value.filter((record) => {
    const recordDate = new Date(record.checkInTime.seconds * 1000).toISOString().slice(0, 10);
    return recordDate === filterDate.value;
  });
});

const formatTimestamp = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp.seconds * 1000).toLocaleString("en-US", {
    dateStyle: "short",
    timeStyle: "short",
  });
};

const exportToCSV = () => {
  // Placeholder for CSV export functionality
  alert("Exporting to CSV...");
};

const exportToPDF = () => {
  // Placeholder for PDF export functionality
  alert("Exporting to PDF...");
};
</script>

<template>
  <AdminLayout>
    <div class="overflow-x-auto bg-white rounded-lg shadow-sm dark:bg-dark-card">
      <div v-if="isLoading" class="p-8 text-center text-gray-500 dark:text-gray-400">
        <p>Loading attendance data...</p>
      </div>
      <div v-else>
        <div class="flex items-center justify-between p-4 border-b dark:border-dark-border">
          <input
            type="date"
            v-model="filterDate"
            class="w-full px-4 py-2 border border-gray-300 rounded-md sm:w-64 focus:ring-primary-light focus:border-primary-light dark:bg-dark-bg dark:border-dark-border dark:text-dark-text"
          />
          <div>
            <button
              @click="exportToCSV"
              class="px-4 py-2 mr-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Export CSV
            </button>
            <button
              @click="exportToPDF"
              class="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600"
            >
              Export PDF
            </button>
          </div>
        </div>

        <table class="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
          <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Staff Name
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Check-in Time
              </th>
              <th
                scope="col"
                class="px-6 py-3 text-xs font-semibold tracking-wider text-left text-gray-500 uppercase dark:text-gray-300"
              >
                Check-out Time
              </th>
            </tr>
          </thead>
          <tbody
            class="bg-white divide-y divide-gray-200 dark:bg-dark-card dark:divide-dark-border"
          >
            <tr v-if="filteredAttendanceRecords.length === 0">
              <td colspan="3" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                No records found for this date.
              </td>
            </tr>
            <tr
              v-for="record in filteredAttendanceRecords"
              :key="record.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td
                class="px-6 py-4 text-sm font-semibold text-gray-600 whitespace-nowrap dark:text-gray-300"
              >
                {{ getStaffName(record.userId) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatTimestamp(record.checkInTime) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatTimestamp(record.checkOutTime) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>
