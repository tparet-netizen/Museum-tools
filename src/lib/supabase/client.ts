import { createBrowserClient } from "@supabase/ssr";

/** Browser client for Client Components. Read-only under RLS (see migration). */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
