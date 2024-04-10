// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey : process.env.KEY,
  authDomain: "project304-bcfd2.firebaseapp.com",
  projectId: "project304-bcfd2",
  storageBucket: "project304-bcfd2.appspot.com",
  messagingSenderId: "160125660153",
  appId: "1:160125660153:web:ac5ccabc8697686999eb28",
  measurementId: "G-69E0C4EJLY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
export default app;