import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyDzbmRXXrG-mLY9LMMq8RIn8pBQt-iPERo",
    authDomain: "questify-422722.firebaseapp.com",
    projectId: "questify-422722",
    storageBucket: "questify-422722.appspot.com",
    messagingSenderId: "183152635586",
    appId: "1:183152635586:web:52337dfcbacc0cdc4c955b"
  };
  export const appFs = initializeApp(firebaseConfig);
  export const db = getFirestore(appFs);  