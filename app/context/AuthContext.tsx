"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { Session } from "@supabase/supabase-js";

const AuthContext = createContext<{ session: Session | null }>({ session: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  return <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);