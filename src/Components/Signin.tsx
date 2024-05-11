import React, { useState, useEffect } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import '../Data/firebase'; // Assuming your Firebase config is here
import {User} from '../Data/Interfaces/taskTypes';
import '../Styles/Signin.css'

const provider = new GoogleAuthProvider();



 function SignIn() {
  const [user, setUser] = useState<User | null>(null); // Keep the type
  const auth = getAuth();

 useEffect(() => {
  // Handle user state changes for better UI control
  const unsubscribe = auth.onAuthStateChanged((currentUser) => {
   setUser(currentUser);
  });

  return () => unsubscribe(); // Cleanup function to prevent memory leaks
 }, [auth]);

 const handleGoogleSignIn = async () => {
  try {
   const result = await signInWithPopup(auth, provider);
   const { user } = result; // Destructure authenticated user
   setUser(user);

   // Handle successful sign-in (navigate, update UI, etc.)
   console.log('User signed in:', user); // Optional logging
  } catch (error) {
   console.error('Error signing in with Google:', error);
   // Handle errors appropriately (display error messages)
  }
 };

 return (
  <div className='SignIn'>
   {!user && ( // Only display sign-in button if not authenticated
    <button onClick={handleGoogleSignIn}>Sign In with Google</button>
   )}
   {user && ( // Display user information or redirect after sign-in
    <div>
     <p>Welcome, {user.displayName}!</p>
     <button onClick={() => auth.signOut()}>Sign Out</button>
    </div>
   )}
  </div>
 );
}

export default SignIn;