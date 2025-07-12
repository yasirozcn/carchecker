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

  useEffect(() => {
    // AsyncStorage'dan kullanıcı bilgisini yükle
    const loadUserFromStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error("AsyncStorage yükleme hatası:", error);
      }
    };

    // Firebase auth state listener
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Kullanıcı giriş yaptı
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
        };

        setUser(userData as User);

        // AsyncStorage'a kaydet
        try {
          await AsyncStorage.setItem("user", JSON.stringify(userData));
        } catch (error) {
          console.error("AsyncStorage kaydetme hatası:", error);
        }
      } else {
        // Kullanıcı çıkış yaptı
        setUser(null);

        // AsyncStorage'dan sil
        try {
          await AsyncStorage.removeItem("user");
        } catch (error) {
          console.error("AsyncStorage silme hatası:", error);
        }
      }

      setLoading(false);
    });

    // İlk yüklemede AsyncStorage'dan kontrol et
    loadUserFromStorage();

    return unsubscribe;
  }, []);

  const signOut = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Çıkış hatası:", error);
    }
  };

  const value = {
    user,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
