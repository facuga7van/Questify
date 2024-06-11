import "../App.css"; // Import your CSS file
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../Data/firebase"; // Assuming your Firebase config is here
import Header from "./Header";
import TaskManager from "./TaskManager";
import Footer from "./Footer";
import { HashRouter, Route, Routes } from "react-router-dom";
import Login from "./Auth/Login";
import Loading from "./Loading";
import { AuthProvider } from "../AuthContext/index";
import Register from "./Auth/Register";
import SideMenu from './SideMenu';
import Profile from "./Profile";

const useAuthState = () => {
  const [authState, setAuthState] = useState<true | false | null>(null);
  const auth = getAuth();


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      
      setTimeout(() => {
        
        setAuthState(!!user); 
      }, 500);
    });

    return () => unsubscribe(); 
  }, [auth]);
  
  return authState;
};





export default function App() {
  const authState = useAuthState();


  return (
    <AuthProvider>
      <HashRouter>
        <Header />
        {authState === null ? (
          <Loading />
        ) : (
          <Routes>
            {authState ? (
              <>
              <Route
                path="/"
                element={
                  <>
                    <SideMenu/> 
                    <TaskManager /> 
                    <Footer />
                  </>
                }
              />
              <Route
                path="/profile"
                element={
                  <>
                    <Profile/> 
                  </>
                }
              />
              </>
            ) : (
              <>
                <Route path="/*" element={<Login />} />
                <Route path="/register" element={<Register />} />
              </>
            )}
          </Routes>
        )}
      </HashRouter>
    </AuthProvider>
  );
}
