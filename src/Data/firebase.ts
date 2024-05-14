import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyDzbmRXXrG-mLY9LMMq8RIn8pBQt-iPERo",
    authDomain: "questify-422722.firebaseapp.com",
    projectId: "questify-422722",
    storageBucket: "questify-422722.appspot.com",
    messagingSenderId: "183152635586",
    appId: "1:183152635586:web:52337dfcbacc0cdc4c955b"
  };
  
  function createFirebaseAdminApp(firebaseConfig: any) {
    if (getApps().length === 0) {
      return initializeApp(firebaseConfig);
    } else {
      return getApp();
    }
  }

  
  const appFs = createFirebaseAdminApp(firebaseConfig);

   const auth =  getAuth();
   const db =  getFirestore();  

   export {appFs,db,auth};
