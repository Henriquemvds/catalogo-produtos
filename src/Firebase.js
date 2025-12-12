import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCsIHI9p5QbExtfneAbs_x1r5WkSbE5tg0",
  authDomain: "catalogo-produtos-f545f.firebaseapp.com",
  databaseURL: "https://catalogo-produtos-f545f-default-rtdb.firebaseio.com",
  projectId: "catalogo-produtos-f545f",
  storageBucket: "catalogo-produtos-f545f.firebasestorage.app",
  messagingSenderId: "509874075576",
  appId: "1:509874075576:web:99c0c12732f46f202a814d",
  measurementId: "G-MHW809H4EP"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);