"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface UserContextValue {
  userId: string | null;
  userName: string;
  userXp: number;
  addXp: (amount: number) => void;
}

const UserContext = createContext<UserContextValue>({
  userId: null,
  userName: "",
  userXp: 0,
  addXp: () => {},
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userXp, setUserXp] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: profile } = await supabase
        .from("profiles")
        .select("name, xp")
        .eq("id", user.id)
        .single();
      if (profile) {
        setUserName(profile.name);
        setUserXp(profile.xp);
      }
    }
    loadUser();
  }, []);

  const addXp = useCallback((amount: number) => {
    setUserXp((prev) => prev + amount);
  }, []);

  return (
    <UserContext.Provider value={{ userId, userName, userXp, addXp }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
