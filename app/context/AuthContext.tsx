"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  refreshUser: () => void;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  refreshUser: () => {},
});

import { createBrowserClient } from "@supabase/ssr";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [supabase, setSupabase] = useState<ReturnType<typeof createBrowserClient> | null>(null);
  const [user, setUser] = useState<User | null>(null);

  // Initialize supabase client once
  useEffect(() => {
    // Use @supabase/ssr browser client so auth from cookies is recognized
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!url || !anonKey) {
      console.error('Missing required Supabase environment variables');
      return;
    }
    
    try {
      const client = createBrowserClient(url, anonKey);
      setSupabase(client);
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!supabase) return;
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Error fetching user:", error);
      }
    }
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      refreshUser();
    });
    refreshUser();
    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, [supabase, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);