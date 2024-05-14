import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDERID,
    appId: import.meta.env.VITE_APP_ID
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
