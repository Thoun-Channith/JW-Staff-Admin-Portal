// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUjaXB6K7YMdBBT0ZJyNzexBMMlylu3kY",
  authDomain: "jw-staff-tracking-app.firebaseapp.com",
  projectId: "jw-staff-tracking-app",
  storageBucket: "jw-staff-tracking-app.firebasestorage.app",
  messagingSenderId: "984352294269",
  appId: "1:984352294269:web:eeac3a3b3c897549cc7814",
  measurementId: "G-ZH0LJ5PG9G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services so we can use them in other files
export { auth, db };
