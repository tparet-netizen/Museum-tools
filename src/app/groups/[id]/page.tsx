import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { MatchCasesPanel } from "@/components/MatchCasesPanel";
import type { MuseumObject } from "@/lib/types";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: group } = await supabase.from("object_groups").select("*").eq("id", id).single();
  if (!group) notFound();

  const { data: objects } = await supabase
    .from("objects")
    .select("*, project:projects(*)")
    .eq("group_id", id)
    .order("name");

  const members = (objects ?? []) as MuseumObject[];
  // Only default the search dates from a project if every object in the
  // group is assigned to the same one - a mixed group has no single answer.
  const firstProjectId = members[0]?.project_id ?? null;
  const allSameProject = members.length > 0 && members.every((o) => o.project_id === firstProjectId);
  const sharedProject = allSameProject && firstProjectId ? members[0].project : null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{group.name}</h1>
        {group.description && <p className="mt-1 text-sm text-black/60 dark:text-white/60">{group.description}</p>}
        {sharedProject && (
          <p className="mt-1 text-sm">
            Needed for project:{" "}
            <Link href={`/projects/${sharedProject.id}`} className="hover:underline">
              {sharedProject.name}
            </Link>{" "}
            ({sharedProject.start_date} &rarr; {sharedProject.end_date})
          </p>
        )}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Objects in this group
        </h2>
        <div className="flex flex-col gap-2">
          {((objects ?? []) as MuseumObject[]).map((o) => (
            <Link
              key={o.id}
              href={`/objects/${o.id}`}
              className="flex items-center justify-between rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
            >
              <div>
                <div className="font-medium">{o.name}</div>
                <div className="text-sm text-black/60 dark:text-white/60">
                  {o.width_cm} &times; {o.height_cm} &times; {o.depth_cm} cm
                  {o.weight_kg ? ` · ${o.weight_kg} kg` : ""}
                </div>
              </div>
            </Link>
          ))}
          {(objects ?? []).length === 0 && (
            <p className="text-sm text-black/60 dark:text-white/60">No objects in this group yet.</p>
          )}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Find a case for the whole group
        </h2>
        <p className="mb-3 text-xs text-black/50 dark:text-white/50">
          Combines all objects in this group into one footprint (assumed side-by-side), then looks for a
          single case that fits all of them together. This is an approximation, not a guaranteed physical
          layout.
        </p>
        <MatchCasesPanel
          groupId={group.id}
          defaultStartDate={sharedProject?.start_date}
          defaultEndDate={sharedProject?.end_date}
          datesFromProjectName={sharedProject?.name}
        />
      </section>
    </div>
  );
}
