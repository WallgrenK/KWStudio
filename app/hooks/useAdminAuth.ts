import type { Session, User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured, supabase } from "~/lib/supabase";

type AdminAuthState = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  displayName: string;
  email: string;
  signOut: () => Promise<void>;
};

function getDisplayName(user: User | null) {
  const displayName = user?.user_metadata?.display_name;

  if (typeof displayName === "string" && displayName.trim()) {
    return displayName.trim();
  }

  return user?.email ?? "KWStudio";
}

export function useAdminAuth(): AdminAuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;

      if (error) {
        console.error("Could not read Supabase session.", error);
      }

      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured) return;

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  return useMemo(
    () => ({
      user,
      session,
      loading,
      displayName: getDisplayName(user),
      email: user?.email ?? "",
      signOut,
    }),
    [loading, session, signOut, user],
  );
}
