// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBDPS-cd27wnXZV18URJIRcMdzh3WTmmN8",
    authDomain: "body-station-b4b0d.firebaseapp.com",
    projectId: "body-station-b4b0d",
    storageBucket: "body-station-b4b0d.firebasestorage.app",
    messagingSenderId: "922751284660",
    appId: "1:922751284660:web:5e9c407087591450726ee1",
    measurementId: "G-7FE1P7VZTK"
};

// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };
