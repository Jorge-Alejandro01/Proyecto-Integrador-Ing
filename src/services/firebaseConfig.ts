// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // ✅ IMPORTACIÓN FALTANTE
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAThflY1xDJBntQFwYqnRfuPgr9YGYq_5k",
  authDomain: "cerraduras-int-4e5e9.firebaseapp.com",
  projectId: "cerraduras-int-4e5e9",
  storageBucket: "cerraduras-int-4e5e9.appspot.com", // ⚠️ ERROR CORREGIDO EN EL DOMINIO
  messagingSenderId: "827394725091",
  appId: "1:827394725091:web:a61fee05deda769b3221d6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
export default app;
