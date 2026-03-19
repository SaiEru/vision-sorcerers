import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { db } from "@/lib/supabaseDb";
import type { User } from "@supabase/supabase-js";

type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: "admin" | "doctor";
  specialization: string;
  phone: string;
  license_number: string;
};

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const fallbackProfile = (user: User, role: "admin" | "doctor"): Profile => ({
  id: user.id,
  email: user.email || "",
  full_name: (user.user_metadata?.full_name as string) || "",
  role,
  specialization: "",
  phone: "",
  license_number: "",
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUser: User) => {
    const [profileRes, roleRes] = await Promise.all([
      db.from("profiles").select("*").eq("id", authUser.id).maybeSingle(),
      db.from("user_roles").select("role").eq("user_id", authUser.id),
    ]);

    const role: "admin" | "doctor" = (roleRes.data || []).some((r: any) => r.role === "admin") ? "admin" : "doctor";

    const mergedProfile: Profile = profileRes.data
      ? ({ ...(profileRes.data as Record<string, unknown>), role } as Profile)
      : fallbackProfile(authUser, role);

    setProfile(mergedProfile);
    return mergedProfile;
  };

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const authUser = session?.user ?? null;
      setUser(authUser);

      if (authUser) {
        await fetchProfile(authUser);
      } else {
        setProfile(null);
      }

      if (mounted) setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION" || event === "TOKEN_REFRESHED") return;

      const authUser = session?.user ?? null;
      setUser(authUser);

      if (!authUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setTimeout(async () => {
        await fetchProfile(authUser);
        setLoading(false);
      }, 0);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
