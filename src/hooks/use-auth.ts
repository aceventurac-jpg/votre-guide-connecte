import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Reactive auth state: null while loading, false if guest, true if signed in. */
export function useIsAuthed(): { authed: boolean | null; userId: string | null } {
  const [state, setState] = useState<{ authed: boolean | null; userId: string | null }>({ authed: null, userId: null });
  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setState({ authed: !!data.user, userId: data.user?.id ?? null });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setState({ authed: !!session?.user, userId: session?.user?.id ?? null });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);
  return state;
}
