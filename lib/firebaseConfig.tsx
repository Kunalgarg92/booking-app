import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyDcNPWmRrOKBH4UFnOnl2q7lSM6d8llwMg",
    authDomain: "kunal-f6f64.firebaseapp.com",
    projectId: "kunal-f6f64",
    storageBucket: "kunal-f6f64.firebasestorage.app",
    messagingSenderId: "697342095668",
    appId: "1:697342095668:web:59cf9db03f52287186b561"
  };


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

