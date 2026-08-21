import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CaseSearchForm } from "@/components/CaseSearchForm";
import { NewCaseForm } from "@/components/NewCaseForm";
import type { Case } from "@/lib/types";

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  let query = supabase.from("cases").select("*").order("code");
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,code.ilike.%${q}%,location.ilike.%${q}%`
    );
  }
  const { data: cases } = await query;

  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("case_id")
    .eq("status", "confirmed")
    .lte("start_date", today)
    .gte("end_date", today);

  const bookedCaseIds = new Set((activeBookings ?? []).map((b) => b.case_id));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Display Cases</h1>
        <NewCaseForm />
      </div>

      <CaseSearchForm />

      <div className="flex flex-col gap-2">
        {(cases ?? []).map((c: Case) => (
          <Link
            key={c.id}
            href={`/cases/${c.id}`}
            className="flex items-center justify-between rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <div>
              <div className="font-medium">
                {c.code} &middot; {c.name}
              </div>
              <div className="text-sm text-black/60 dark:text-white/60">
                {c.location ?? "No location set"}
                {c.finish ? ` · ${c.finish}` : ""}
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                bookedCaseIds.has(c.id)
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
              }`}
            >
              {bookedCaseIds.has(c.id) ? "In use" : "Available"}
            </span>
          </Link>
        ))}
        {(cases ?? []).length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            No display cases found.
          </p>
        )}
      </div>
    </div>
  );
}
