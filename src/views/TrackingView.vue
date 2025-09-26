<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "../layouts/AdminLayout.vue";
import { GoogleMap, Marker, InfoWindow } from "vue3-google-map";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const activeStaff = ref([]);
const isLoading = ref(true);
let unsubscribe = null;

// The map will be centered on Phnom Penh, Cambodia by default
const mapCenter = { lat: 11.5564, lng: 104.9282 };

// State to manage which info window is open
const activeMarkerId = ref(null);

onMounted(() => {
  // Query to get only staff who are clocked in and enabled
  const q = query(
    collection(db, "users"),
    where("role", "==", "staff"),
    where("isClockedIn", "==", true),
    where("accountEnabled", "==", true)
  );

  unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      activeStaff.value = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((staff) => staff.currentLocation); // Only include staff with a location

      isLoading.value = false;
    },
    (error) => {
      console.error("Error fetching active staff:", error);
      isLoading.value = false;
    }
  );
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});

const openInfoWindow = (staffId) => {
  activeMarkerId.value = staffId;
};
</script>

<template>
  <AdminLayout>
    <div
      class="w-full h-[calc(100vh-10rem)] bg-white rounded-lg shadow-sm dark:bg-dark-card overflow-hidden"
    >
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <p class="text-gray-500 dark:text-gray-400">Loading map and staff locations...</p>
      </div>
      <GoogleMap v-else :api-key="apiKey" :center="mapCenter" :zoom="12" class="w-full h-full">
        <Marker
          v-for="staff in activeStaff"
          :key="staff.id"
          :options="{
            position: { lat: staff.currentLocation.latitude, lng: staff.currentLocation.longitude },
            title: staff.displayName,
          }"
          @click="openInfoWindow(staff.id)"
        >
          <!-- InfoWindow shows when a marker is clicked -->
          <InfoWindow v-if="activeMarkerId === staff.id" @closeclick="activeMarkerId = null">
            <div class="p-2 font-sans">
              <p class="text-base font-bold text-gray-800">{{ staff.displayName }}</p>
              <p class="text-sm text-gray-600">{{ staff.position }}</p>
              <p class="mt-1 text-xs text-neutral-grey">
                Last update: {{ new Date(staff.lastSeen.seconds * 1000).toLocaleTimeString() }}
              </p>
            </div>
          </InfoWindow>
        </Marker>
      </GoogleMap>
    </div>
  </AdminLayout>
</template>
