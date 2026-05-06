"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User } from "firebase/auth";
import { onAuth, getUserProfile } from "@/lib/auth";
import { UserProfile } from "@/lib/types";

interface AuthCtx {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const Ctx = createContext<AuthCtx>({ user: null, profile: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuth(async u => {
      setUser(u);
      if (u) {
        const p = await getUserProfile(u.uid);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
  }, []);

  return <Ctx.Provider value={{ user, profile, loading }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);