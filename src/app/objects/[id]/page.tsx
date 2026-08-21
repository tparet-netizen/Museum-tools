import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MatchCasesPanel } from "@/components/MatchCasesPanel";

export default async function ObjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: object } = await supabase
    .from("objects")
    .select("*, group:object_groups(*), project:projects(*)")
    .eq("id", id)
    .single();

  if (!object) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{object.name}</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          {object.width_in} &times; {object.height_in} &times; {object.depth_in} in
          {object.weight_kg ? ` · ${object.weight_kg} kg` : ""}
        </p>
        {object.group && (
          <p className="mt-1 text-sm">
            Part of group:{" "}
            <Link href={`/groups/${object.group.id}`} className="hover:underline">
              {object.group.name}
            </Link>
          </p>
        )}
        {object.project && (
          <p className="mt-1 text-sm">
            Needed for project:{" "}
            <Link href={`/projects/${object.project.id}`} className="hover:underline">
              {object.project.name}
            </Link>{" "}
            ({object.project.start_date} &rarr; {object.project.end_date})
          </p>
        )}
        {object.description && <p className="mt-3 max-w-2xl text-sm">{object.description}</p>}
        <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
          {object.orientation_fixed && (
            <span className="rounded bg-black/10 px-1.5 py-0.5 dark:bg-white/10">Fixed orientation</span>
          )}
          {object.requires_climate_control && (
            <span className="rounded bg-black/10 px-1.5 py-0.5 dark:bg-white/10">Needs climate control</span>
          )}
          {object.requires_uv_filtered && (
            <span className="rounded bg-black/10 px-1.5 py-0.5 dark:bg-white/10">Needs UV filtering</span>
          )}
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Find a case
        </h2>
        <MatchCasesPanel
          objectId={object.id}
          defaultStartDate={object.project?.start_date}
          defaultEndDate={object.project?.end_date}
          datesFromProjectName={object.project?.name}
        />
      </section>
    </div>
  );
}
