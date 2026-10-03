import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server-side Supabase client (Server Components, Server Actions, Route Handlers). Uses the anon key —
 *  every query still goes through RLS, scoped to whichever user's session cookie is attached. */
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list: { name: string; value: string; options?: any }[]) => {
        try {
          for (const { name, value, options } of list) cookieStore.set(name, value, options);
        } catch {
          // Called from a Server Component render, where cookies can't be written; middleware refreshes
          // the session instead, so this is safe to ignore.
        }
      },
    },
  });
}
