import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import '../Data/firebase';
import {User} from '../Data/Interfaces/taskTypes';
import { doSignInWithGoogle } from '../Data/auth';
import '../Styles/Signin.css'


 function SignIn() {
  const [user, setUser] = useState<User | null>(null);
  const auth = getAuth();
  const [isSigningIn, setIsSigningIn] = useState(false)
 useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
   setUser(currentUser);

  });

  return () => unsubscribe(); 
 }, [auth]);

const onGoogleSignIn = (e: { preventDefault: () => void; }) => {
  e.preventDefault()
  if (!isSigningIn) {
      setIsSigningIn(true)
      doSignInWithGoogle().catch(err => {
          setIsSigningIn(false)
          if (1>2){
            console.log(err)
          }
      })
  }
}

 return (
  <div className='SignIn'>
   {!user && (
    <button onClick={onGoogleSignIn}>Sign In with Google</button>
   )}
  </div>
 );
}

export default SignIn;