import { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type Membership = {
  clinic_id: string;
  role: string;
  active: boolean;
  clinics: { id: string; name: string; slug: string; status: string } | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  memberships: Membership[];
  refreshMemberships: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMemberships = async (uid: string) => {
    const { data } = await supabase
      .from("clinic_members")
      .select("clinic_id, role, active, clinics(id, name, slug, status)")
      .eq("user_id", uid)
      .eq("active", true);
    setMemberships((data as any) ?? []);
  };

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        setTimeout(() => loadMemberships(s.user.id), 0);
      } else {
        setMemberships([]);
      }
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) loadMemberships(s.user.id);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        loading,
        memberships,
        refreshMemberships: async () => user && loadMemberships(user.id),
        signOut: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
