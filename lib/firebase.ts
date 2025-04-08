import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCU7-o0ldeIHMVziDNU8FUo4TMmDOHi3_M",
  authDomain: "ecos-a2289.firebaseapp.com",
  projectId: "ecos-a2289",
  storageBucket: "ecos-a2289.firebasestorage.app",
  messagingSenderId: "825681899489",
  appId: "1:825681899489:web:f8b94cd3e30d19f4d76ca0",
  measurementId: "G-034RDTLXG9"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)
export const storage = getStorage(app)
