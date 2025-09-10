"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { createClient } from "@/app/lib/supabase/client";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  refreshUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      // Replace with a non-noisy logger if available
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user:", error);
      }
    }
  }, [supabase]);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      () => {
        refreshUser();
      }
    );

    refreshUser();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);