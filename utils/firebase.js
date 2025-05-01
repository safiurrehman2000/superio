// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB7__lp0oo37J-eVzncVELIZudV4ThBwQo",
  authDomain: "flexijobber-11a4c.firebaseapp.com",
  projectId: "flexijobber-11a4c",
  storageBucket: "flexijobber-11a4c.firebasestorage.app",
  messagingSenderId: "409931945808",
  appId: "1:409931945808:web:d20f763290e5ad92fdfe55",
  measurementId: "G-CT24VQ9WVR",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth();
