import '../App.css'; // Import your CSS file
import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../Data/firebase'; // Assuming your Firebase config is here
import Header from './Header';
import TaskManager from './TaskManager';
import Footer from './Footer';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Import React Router DOM
import SignIn from './Signin'; // Assuming your SignIn component path

export default function App() {
  const [authState, setAuthState] = useState<boolean>(false); // Use boolean for authentication state
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(user !== null); // Update state based on user presence
    });

    return () => unsubscribe(); // Cleanup function for memory leaks
  }, [auth]);

  return (
      <Router>
  <Header />
  <Routes>
    {authState ? ( // Check authentication state
      <Route path="/" element={<TaskManager />} /> // Render TaskManager if authenticated
    ) : ( // If not authenticated
      <Route path="/*" element={<SignIn />} /> // Render SignIn for all routes
    )}
  </Routes>
  <Footer />
</Router>
  );
}
