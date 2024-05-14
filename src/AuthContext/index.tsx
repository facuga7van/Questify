import React, { useContext, useState, useEffect } from "react";
import { auth } from "../Data/firebase";
import { User } from "firebase/auth"; // Import User type
import { GoogleAuthProvider } from "firebase/auth"; // Import GoogleAuthProvider
import { onAuthStateChanged } from "firebase/auth";

const AuthContext = React.createContext<AuthContextValue>({
  userLoggedIn: false,
  isEmailUser: false,
  isGoogleUser: false,
  currentUser: null,
  setCurrentUser: () => {},
});

interface AuthContextValue {
  userLoggedIn: boolean;
  isEmailUser: boolean;
  isGoogleUser: boolean;
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: User | null) {
    if (user) {
      setCurrentUser({ ...user });
      
      // Check if provider is email and password login
      const isEmail = user.providerData.some((provider: any) => provider.providerId === "password");
      setIsEmailUser(isEmail);

      // Check if the auth provider is google or not
      const isGoogle = user.providerData.some((provider: any) => provider.providerId === GoogleAuthProvider.PROVIDER_ID);
      setIsGoogleUser(isGoogle);

      setUserLoggedIn(true);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }

    setLoading(false);
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    isGoogleUser,
    currentUser,
    setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
