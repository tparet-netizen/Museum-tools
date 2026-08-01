"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Case, Project } from "@/lib/types";

export function AssignCaseForm({ project }: { project: Project }) {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cases")
      .then((res) => res.json())
      .then((body) => setCases(body.cases ?? []));
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            case_id: form.get("case_id"),
            project_id: project.id,
            start_date: form.get("start_date"),
            end_date: form.get("end_date"),
            notes: form.get("notes") || null,
          }),
        });
        setPending(false);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "Failed to assign case");
          return;
        }
        (e.target as HTMLFormElement).reset();
        router.refresh();
      }}
      className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
    >
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-black/70 dark:text-white/70">Case</span>
        <select
          name="case_id"
          required
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        >
          <option value="">Select a case&hellip;</option>
          {cases.map((c) => (
            <option key={c.id} value={c.id}>
              {c.code} &middot; {c.name}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-black/70 dark:text-white/70">Start date</span>
          <input
            type="date"
            name="start_date"
            required
            min={project.start_date}
            max={project.end_date}
            defaultValue={project.start_date}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-black/70 dark:text-white/70">End date</span>
          <input
            type="date"
            name="end_date"
            required
            min={project.start_date}
            max={project.end_date}
            defaultValue={project.end_date}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-black/70 dark:text-white/70">Notes</span>
        <input
          name="notes"
          placeholder="Optional"
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        />
      </label>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Assigning..." : "Assign case"}
      </button>
    </form>
  );
}
