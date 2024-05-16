import '../App.css'; // Import your CSS file
import  { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../Data/firebase'; // Assuming your Firebase config is here
import Header from './Header';
import TaskManager from './TaskManager';
import Footer from './Footer';
import {HashRouter,Route, Routes} from 'react-router-dom';
import Login from './Auth/Login';
import Loading from './Loading';
import { AuthProvider, useAuth } from '../AuthContext/index';
import Register from './Auth/Register';

export default function App() {
  const [authState, setAuthState] = useState<true | false | null>(null); // Use boolean for authentication state
  const auth = getAuth();
  const { userLoggedIn } = useAuth()
  console.log(userLoggedIn)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          setAuthState(true); // User is logged in
        } else {
          setAuthState(false); // User is logged out
        }
    });

    return () => unsubscribe(); // Cleanup function for memory leaks
  }, [auth]);

  return (

      <AuthProvider>
        <HashRouter>
      <Header />
      {authState === null ? ( // Render Loading if authState is null
        <Loading />
      ) : (
        <Routes>
          {authState ? ( // Check authentication state
            <Route path="/" element={<><TaskManager /> <Footer /></> } /> // Render TaskManager if authenticated
          ) : ( // If not authenticated
            <Route path="/*" element={<Login /> } /> // Render SignIn for all routes
          )}
          <Route path="/register" element={<Register /> } /> 
        </Routes>
      )}
      </HashRouter>
      </AuthProvider>

  );
}
