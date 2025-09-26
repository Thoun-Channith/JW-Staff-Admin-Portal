// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// IMPORTANT: Replace this with your project's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCIOBoDO6oOeW-j8mtXFLo2OWZhAIMzaOw",
  authDomain: "joinery-worx.firebaseapp.com",
  projectId: "joinery-worx",
  storageBucket: "joinery-worx.firebasestorage.app",
  messagingSenderId: "292388889288",
  appId: "1:292388889288:web:042e1a9242adc479523bfd",
  measurementId: "G-RRY10H7KF3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Export the services so we can use them in other files
export { auth, db };
