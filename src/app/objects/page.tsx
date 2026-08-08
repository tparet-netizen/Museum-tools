import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { MuseumObject, ObjectGroup } from "@/lib/types";

export default async function ObjectsPage() {
  const supabase = await createClient();

  const [{ data: objects }, { data: groups }] = await Promise.all([
    supabase.from("objects").select("*, group:object_groups(*)").order("name"),
    supabase.from("object_groups").select("*").order("name"),
  ]);

  const grouped = new Map<string, MuseumObject[]>();
  const ungrouped: MuseumObject[] = [];
  for (const o of (objects ?? []) as MuseumObject[]) {
    if (o.group_id) {
      grouped.set(o.group_id, [...(grouped.get(o.group_id) ?? []), o]);
    } else {
      ungrouped.push(o);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Objects</h1>
        <Link
          href="/objects/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New object
        </Link>
      </div>

      {(groups ?? []).length > 0 && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
            Groups
          </h2>
          <div className="flex flex-col gap-2">
            {(groups as ObjectGroup[]).map((g) => (
              <Link
                key={g.id}
                href={`/groups/${g.id}`}
                className="flex items-center justify-between rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
              >
                <div>
                  <div className="font-medium">{g.name}</div>
                  {g.description && (
                    <div className="text-sm text-black/60 dark:text-white/60">{g.description}</div>
                  )}
                </div>
                <span className="text-sm text-black/60 dark:text-white/60">
                  {(grouped.get(g.id) ?? []).length} object(s)
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
          Ungrouped objects
        </h2>
        <div className="flex flex-col gap-2">
          {ungrouped.map((o) => (
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
          {ungrouped.length === 0 && (
            <p className="text-sm text-black/60 dark:text-white/60">No ungrouped objects yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
