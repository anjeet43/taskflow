"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Meta = Record<string, unknown> | undefined;
type AuthUser = { email?: string | null; user_metadata?: Meta } | null;

function pick(meta: Meta, ...keys: string[]) {
  for (const k of keys) {
    const v = meta?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

/** Name shown in the UI: saved display name > Google/OAuth name > the part of the email before "@". */
export function useProfile() {
  const [user, setUser] = useState<AuthUser>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    // getSession reads the local session (no network call), which keeps page navigation fast.
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ?? null);
      setLoaded(true);
    });
    // Also fires after updateUser(), so the greeting, avatar and Settings stay in sync.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUser(session?.user ?? null);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, []);

  const email = user?.email ?? "";
  const savedName = pick(user?.user_metadata, "display_name");
  const name = savedName || pick(user?.user_metadata, "full_name", "name") || email.split("@")[0] || "";
  const firstName = name.split(/\s+/)[0] ?? "";
  const initial = (firstName[0] ?? "?").toUpperCase();
  return { loaded, email, name, savedName, firstName, initial };
}
