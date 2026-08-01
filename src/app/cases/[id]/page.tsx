import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { BookingWithProject } from "@/lib/types";

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: caseRow } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .single();

  if (!caseRow) notFound();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, project:projects(*)")
    .eq("case_id", id)
    .order("start_date", { ascending: false });

  const all = (bookings ?? []) as BookingWithProject[];
  const upcoming = all
    .filter((b) => b.status === "confirmed" && b.end_date >= today)
    .sort((a, b) => a.start_date.localeCompare(b.start_date));
  const past = all.filter((b) => b.status !== "confirmed" || b.end_date < today);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          {caseRow.code} &middot; {caseRow.name}
        </h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {caseRow.location ?? "No location set"}
        </p>
        {caseRow.description && (
          <p className="mt-3 max-w-2xl text-sm">{caseRow.description}</p>
        )}
        <dl className="mt-3 flex gap-6 text-sm text-black/60 dark:text-white/60">
          {caseRow.width_cm && <div>W {caseRow.width_cm}cm</div>}
          {caseRow.height_cm && <div>H {caseRow.height_cm}cm</div>}
          {caseRow.depth_cm && <div>D {caseRow.depth_cm}cm</div>}
        </dl>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Current &amp; upcoming bookings
        </h2>
        <BookingList bookings={upcoming} emptyText="No upcoming bookings — this case is available." />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Booking history
        </h2>
        <BookingList bookings={past} emptyText="No past bookings yet." />
      </section>
    </div>
  );
}

function BookingList({
  bookings,
  emptyText,
}: {
  bookings: BookingWithProject[];
  emptyText: string;
}) {
  if (bookings.length === 0) {
    return <p className="text-sm text-black/60 dark:text-white/60">{emptyText}</p>;
  }
  return (
    <div className="flex flex-col gap-2">
      {bookings.map((b) => (
        <Link
          key={b.id}
          href={`/projects/${b.project_id}`}
          className="flex items-center justify-between rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          <div>
            <div className="font-medium">{b.project?.name ?? "Untitled project"}</div>
            <div className="text-sm text-black/60 dark:text-white/60">
              {b.start_date} &rarr; {b.end_date}
            </div>
          </div>
          {b.status === "cancelled" && (
            <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium dark:bg-white/10">
              Cancelled
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
