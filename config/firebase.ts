import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// import { getStorage } from "firebase/storage"; // Storage henüz etkinleştirilmedi

const firebaseConfig = {
  apiKey: "AIzaSyB8GyEQ2MYVK-P0-tgYa9enKb1FORFCukM",
  authDomain: "carchecker-753f4.firebaseapp.com",
  projectId: "carchecker-753f4",
  storageBucket: "carchecker-753f4.firebasestorage.app",
  messagingSenderId: "682109125200",
  appId: "1:682109125200:web:fc605e2b9b3b3094b18755",
  measurementId: "G-V17P4BTZX4",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
// export const storage = getStorage(app); // Storage henüz etkinleştirilmedi

export default app;
