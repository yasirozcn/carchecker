import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { authService } from "../services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const initializeAuth = async () => {
      try {
        console.log("=== AUTH INITIALIZATION STARTED ===");

        // Önce AsyncStorage'dan kullanıcı bilgisini yükle
        const userData = await AsyncStorage.getItem("user");
        console.log(
          "AsyncStorage user data:",
          userData ? "Found" : "Not found"
        );

        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log("Setting user from AsyncStorage:", parsedUser.email);
          setUser(parsedUser);
        }

        // Firebase auth state listener'ı başlat
        unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
          console.log(
            "Firebase auth state changed:",
            firebaseUser
              ? `User logged in: ${firebaseUser.email}`
              : "User logged out"
          );

          if (firebaseUser) {
            // Kullanıcı giriş yaptı
            const userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
            };

            console.log("Setting user from Firebase:", userData.email);
            setUser(userData as User);

            // AsyncStorage'a kaydet
            try {
              await AsyncStorage.setItem("user", JSON.stringify(userData));
              console.log("User data saved to AsyncStorage");
            } catch (error) {
              console.error("AsyncStorage kaydetme hatası:", error);
            }
          } else {
            // Kullanıcı çıkış yaptı
            console.log("Clearing user data");
            setUser(null);

            // AsyncStorage'dan sil
            try {
              await AsyncStorage.removeItem("user");
              console.log("User data removed from AsyncStorage");
            } catch (error) {
              console.error("AsyncStorage silme hatası:", error);
            }
          }

          if (!initialized) {
            console.log("Setting initialized to true");
            setInitialized(true);
          }
          setLoading(false);
          console.log("=== AUTH INITIALIZATION COMPLETED ===");
        });
      } catch (error) {
        console.error("Auth initialization error:", error);
        setLoading(false);
        setInitialized(true);
      }
    };

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initialized]);

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const value = {
    user,
    loading: loading || !initialized,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
