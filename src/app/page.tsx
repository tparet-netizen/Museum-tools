import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ count: caseCount }, { count: activeProjectCount }, { count: bookedTodayCount }] =
    await Promise.all([
      supabase.from("cases").select("*", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .in("status", ["planning", "confirmed", "installed"]),
      supabase
        .from("bookings")
        .select("*", { count: "exact", head: true })
        .eq("status", "confirmed")
        .lte("start_date", today)
        .gte("end_date", today),
    ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Museum Tools</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          Track display case bookings for exhibits and projects.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Display cases" value={caseCount ?? 0} />
        <StatCard label="Active projects" value={activeProjectCount ?? 0} />
        <StatCard label="Cases in use today" value={bookedTodayCount ?? 0} />
      </div>

      <div className="flex gap-3">
        <Link
          href="/cases"
          className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Browse display cases
        </Link>
        <Link
          href="/projects"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          View projects
        </Link>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="text-2xl font-semibold">{value}</div>
      <div className="text-sm text-black/60 dark:text-white/60">{label}</div>
    </div>
  );
}
