<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout.vue";
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const staffList = ref([]);
const isLoading = ref(true);
let unsubscribe = null;

// The map will be centered on Phnom Penh, Cambodia by default
const mapCenter = ref({ lat: 11.5564, lng: 104.9282 });
const mapRef = ref(null);

// State to manage which info window is open
const activeMarkerId = ref(null);
const selectedStaff = ref(null);

// Computed properties to match your dashboard
const totalStaff = computed(() => staffList.value.length);
const clockedInCount = computed(() => staffList.value.filter((staff) => staff.isClockedIn).length);
const clockedOutCount = computed(() => totalStaff.value - clockedInCount.value);

// Staff with valid locations for the map
const staffWithLocations = computed(() => {
  return staffList.value.filter(
    (staff) =>
      staff.currentLocation && staff.currentLocation.latitude && staff.currentLocation.longitude
  );
});

onMounted(() => {
  // Use the same query as your dashboard to get ALL staff
  const q = query(collection(db, "users"), where("role", "==", "staff"));

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      staffList.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      isLoading.value = false;
    },
    (error) => {
      console.error("Error fetching staff list:", error);
      isLoading.value = false;
    }
  );
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const openInfoWindow = (staffId) => {
  activeMarkerId.value = staffId;
  selectedStaff.value = staffList.value.find((staff) => staff.id === staffId);
};

const focusOnStaff = (staff) => {
  selectedStaff.value = staff;

  // Only center map if staff has a location
  if (staff.currentLocation && staff.currentLocation.latitude && staff.currentLocation.longitude) {
    mapCenter.value = {
      lat: staff.currentLocation.latitude,
      lng: staff.currentLocation.longitude,
    };
    // Open info window
    activeMarkerId.value = staff.id;
  } else {
    // If staff has no location, clear any open info window
    activeMarkerId.value = null;
  }
};

// Format last seen time
const formatLastSeen = (staff) => {
  if (!staff.lastSeen) return "No activity";
  const date = new Date(staff.lastSeen.seconds * 1000);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
};

// Get status color and text
const getStatusInfo = (staff) => {
  if (!staff.accountEnabled) {
    return {
      color: "text-gray-500",
      bg: "bg-gray-100",
      dot: "bg-gray-500",
      text: "Account Disabled",
      icon: "❌",
    };
  }
  if (staff.isClockedIn) {
    return {
      color: "text-green-600",
      bg: "bg-green-50",
      dot: "bg-green-500",
      text: "Clocked In",
      icon: "🟢",
    };
  }
  return {
    color: "text-red-600",
    bg: "bg-red-50",
    dot: "bg-red-500",
    text: "Clocked Out",
    icon: "🔴",
  };
};

const hasLocation = (staff) => {
  return staff.currentLocation && staff.currentLocation.latitude && staff.currentLocation.longitude;
};
</script>

<template>
  <AdminLayout>
    <!-- Main Container with Horizontal Layout -->
    <div
      class="flex flex-col lg:flex-row h-[calc(100vh-10rem)] bg-white rounded-lg shadow-sm dark:bg-dark-card overflow-hidden border border-gray-200 dark:border-gray-700"
    >
      <!-- Staff List Sidebar - Original Width -->
      <div
        class="w-full overflow-y-auto border-b border-gray-200 lg:w-80 dark:border-gray-700 lg:border-b-0 lg:border-r border-r-gray-200 dark:border-r-gray-700 bg-gray-50 dark:bg-gray-800/50"
      >
        <!-- Header - Back to original position and style -->
        <div class="p-4 bg-white border-b border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <div class="flex items-center justify-between mb-2">
            <h2 class="text-lg font-semibold text-gray-800 dark:text-white">
              All Staff ({{ totalStaff }})
            </h2>
            <div class="text-xs text-gray-500 dark:text-gray-400">
              <span class="text-green-600 dark:text-green-400">{{ clockedInCount }} in</span> •
              <span class="text-red-600 dark:text-red-400">{{ clockedOutCount }} out</span>
            </div>
          </div>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ staffWithLocations.length }} staff with location data
          </p>
        </div>

        <!-- Loading State -->
        <div
          v-if="isLoading"
          class="p-4 bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="animate-pulse">
            <div class="h-4 mb-3 bg-gray-200 rounded dark:bg-gray-700"></div>
            <div class="w-3/4 h-4 bg-gray-200 rounded dark:bg-gray-700"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-else-if="staffList.length === 0"
          class="p-4 text-center bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700"
        >
          <p class="text-gray-500 dark:text-gray-400">No staff members found</p>
        </div>

        <!-- Staff List -->
        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="staff in staffList"
            :key="staff.id"
            class="p-4 transition-colors bg-white border-l-4 border-transparent cursor-pointer hover:bg-white dark:hover:bg-gray-800 dark:bg-gray-800"
            :class="{
              'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20': selectedStaff?.id === staff.id,
              'border-b border-gray-200 dark:border-gray-700': selectedStaff?.id !== staff.id,
            }"
            @click="focusOnStaff(staff)"
          >
            <!-- ListTile Structure -->
            <div class="flex items-start space-x-3">
              <!-- Leading - Avatar -->
              <div
                class="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-blue-100 border border-blue-200 rounded-full dark:bg-blue-900 dark:border-blue-800"
              >
                <span class="text-sm font-medium text-blue-600 dark:text-blue-300">
                  {{ (staff.displayName || staff.name || "U").charAt(0).toUpperCase() }}
                </span>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between">
                  <h3 class="text-sm font-medium text-gray-900 truncate dark:text-white">
                    {{ staff.displayName || staff.name || "Unknown Staff" }}
                  </h3>
                  <div class="flex items-center space-x-1">
                    <!-- Location Indicator -->
                    <div
                      v-if="hasLocation(staff)"
                      class="w-2 h-2 bg-blue-500 rounded-full"
                      title="Has location"
                    ></div>
                    <!-- Status Indicator -->
                    <div
                      class="w-2 h-2 rounded-full"
                      :class="getStatusInfo(staff).dot"
                      :title="getStatusInfo(staff).text"
                    ></div>
                  </div>
                </div>

                <p class="text-sm text-gray-500 truncate dark:text-gray-400">
                  {{ staff.position || "No position" }}
                </p>

                <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  <span v-if="staff.lastSeen">Last seen: {{ formatLastSeen(staff) }}</span>
                  <span v-else>No activity data</span>
                </p>

                <!-- Status Badges -->
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    class="text-xs px-1.5 py-0.5 rounded border"
                    :class="
                      getStatusInfo(staff).bg +
                      ' border-' +
                      getStatusInfo(staff).color.split('-')[1] +
                      '-200 dark:border-' +
                      getStatusInfo(staff).color.split('-')[1] +
                      '-800 ' +
                      getStatusInfo(staff).color
                    "
                  >
                    {{ getStatusInfo(staff).text }}
                  </span>
                  <span
                    v-if="!staff.accountEnabled"
                    class="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                  >
                    Disabled
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Container - Now takes the remaining space -->
      <div class="relative flex-1 bg-white dark:bg-gray-800">
        <div v-if="isLoading" class="flex items-center justify-center h-full">
          <div class="text-center">
            <div
              class="w-12 h-12 mx-auto mb-4 border-b-2 border-blue-500 rounded-full animate-spin"
            ></div>
            <p class="text-gray-500 dark:text-gray-400">Loading map and staff locations...</p>
          </div>
        </div>

        <!-- Google Map - Now much larger -->
        <GoogleMap
          v-else
          :api-key="apiKey"
          :center="mapCenter"
          :zoom="12"
          class="w-full h-full"
          ref="mapRef"
        >
          <Marker
            v-for="staff in staffWithLocations"
            :key="staff.id"
            :options="{
              position: {
                lat: staff.currentLocation.latitude,
                lng: staff.currentLocation.longitude,
              },
              title: staff.displayName || staff.name,
            }"
            @click="openInfoWindow(staff.id)"
          >
            <!-- InfoWindow shows when a marker is clicked -->
            <InfoWindow v-if="activeMarkerId === staff.id" @closeclick="activeMarkerId = null">
              <div class="max-w-xs p-3 font-sans border border-gray-200 rounded-lg shadow-sm">
                <div class="flex items-center mb-2 space-x-3">
                  <div
                    class="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full dark:bg-blue-900"
                  >
                    <span class="text-sm font-medium text-blue-600 dark:text-blue-300">
                      {{ (staff.displayName || staff.name || "U").charAt(0).toUpperCase() }}
                    </span>
                  </div>
                  <div>
                    <p class="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {{ staff.displayName || staff.name }}
                    </p>
                    <p class="text-sm text-gray-600 dark:text-gray-400">
                      {{ staff.position || "No position" }}
                    </p>
                  </div>
                </div>
                <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex justify-between">
                    <span>Status:</span>
                    <span :class="getStatusInfo(staff).color + ' font-medium'">
                      {{ getStatusInfo(staff).text }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span>Last seen:</span>
                    <span>{{ formatLastSeen(staff) }}</span>
                  </div>
                  <div v-if="staff.employeeId" class="flex justify-between">
                    <span>Employee ID:</span>
                    <span>{{ staff.employeeId }}</span>
                  </div>
                </div>
              </div>
            </InfoWindow>
          </Marker>
        </GoogleMap>

        <!-- Map Legend -->
        <div
          class="absolute p-4 text-xs bg-white border border-gray-200 rounded-lg shadow-lg bottom-4 left-4 dark:bg-gray-800 dark:border-gray-700"
        >
          <div class="mb-2 font-semibold text-gray-700 dark:text-gray-300">Staff Status</div>
          <div class="space-y-1">
            <div class="flex items-center">
              <div class="w-2 h-2 mr-2 bg-green-500 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">Clocked In</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 mr-2 bg-red-500 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">Clocked Out</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 mr-2 bg-gray-400 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">Disabled</span>
            </div>
            <div class="flex items-center">
              <div class="w-2 h-2 mr-2 bg-blue-500 rounded-full"></div>
              <span class="text-gray-600 dark:text-gray-400">Has Location</span>
            </div>
          </div>
        </div>

        <!-- Selected Staff Info Card (for mobile/tablet) -->
        <div
          v-if="selectedStaff && activeMarkerId"
          class="absolute p-4 bg-white border border-gray-300 rounded-lg shadow-lg top-4 left-4 right-4 lg:hidden dark:bg-gray-800 dark:border-gray-600"
        >
          <div class="flex items-center space-x-3">
            <div
              class="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full dark:bg-blue-900"
            >
              <span class="text-xs font-medium text-blue-600 dark:text-blue-300">
                {{
                  (selectedStaff.displayName || selectedStaff.name || "U").charAt(0).toUpperCase()
                }}
              </span>
            </div>
            <div class="flex-1">
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                {{ selectedStaff.displayName || selectedStaff.name }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ selectedStaff.position || "No position" }}
              </p>
              <p class="mt-1 text-xs" :class="getStatusInfo(selectedStaff).color">
                {{ getStatusInfo(selectedStaff).text }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>
