import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AssignCaseForm } from "@/components/AssignCaseForm";
import { CancelBookingButton } from "@/components/CancelBookingButton";
import type { BookingWithCase } from "@/lib/types";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, case:cases(*)")
    .eq("project_id", id)
    .order("start_date");

  const all = (bookings ?? []) as BookingWithCase[];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{project.name}</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {project.start_date} &rarr; {project.end_date} &middot; {project.status}
        </p>
        {project.description && (
          <p className="mt-3 max-w-2xl text-sm">{project.description}</p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Assigned cases
        </h2>
        <div className="flex flex-col gap-2">
          {all.map((b) => (
            <div
              key={b.id}
              className="flex items-center justify-between rounded-lg border border-black/10 p-4 dark:border-white/15"
            >
              <div>
                <Link href={`/cases/${b.case_id}`} className="font-medium hover:underline">
                  {b.case?.code} &middot; {b.case?.name}
                </Link>
                <div className="text-sm text-black/60 dark:text-white/60">
                  {b.start_date} &rarr; {b.end_date}
                  {b.notes ? ` — ${b.notes}` : ""}
                </div>
              </div>
              {b.status === "cancelled" ? (
                <span className="rounded-full bg-black/10 px-2.5 py-1 text-xs font-medium dark:bg-white/10">
                  Cancelled
                </span>
              ) : (
                <CancelBookingButton bookingId={b.id} />
              )}
            </div>
          ))}
          {all.length === 0 && (
            <p className="text-sm text-black/60 dark:text-white/60">
              No cases assigned yet.
            </p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Assign a case
        </h2>
        <AssignCaseForm project={project} />
      </section>
    </div>
  );
}
