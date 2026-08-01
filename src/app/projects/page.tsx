import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

const STATUS_STYLES: Record<Project["status"], string> = {
  planning: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  installed: "bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300",
  completed: "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("start_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl font-semibold tracking-tight">Projects</h1>
        <Link
          href="/projects/new"
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
        >
          New project
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(projects ?? []).map((p: Project) => (
          <Link
            key={p.id}
            href={`/projects/${p.id}`}
            className="flex items-center justify-between rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
          >
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-black/60 dark:text-white/60">
                {p.start_date} &rarr; {p.end_date}
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[p.status]}`}
            >
              {p.status}
            </span>
          </Link>
        ))}
        {(projects ?? []).length === 0 && (
          <p className="text-sm text-black/60 dark:text-white/60">
            No projects yet.
          </p>
        )}
      </div>
    </div>
  );
}
