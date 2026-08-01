import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Read-only client for Server Components, scoped by RLS to the anon "public
 * read" policies. There's no user auth yet, so cookies are wired up now for
 * when that's added, but nothing depends on them today.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render; safe to ignore since
            // middleware (if added later) would refresh the session cookie.
          }
        },
      },
    }
  );
}
