"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { Location } from "@/lib/types";

export function NewProjectForm() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((body) => setLocations(body.locations ?? []));
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            description: form.get("description") || null,
            start_date: form.get("start_date"),
            end_date: form.get("end_date"),
            location_id: form.get("location_id") || null,
          }),
        });
        setPending(false);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "Failed to create project");
          return;
        }
        router.push(`/projects/${body.project.id}`);
      }}
      className="flex max-w-md flex-col gap-3"
    >
      <Field label="Name" name="name" required placeholder="Ancient Trade Routes" />
      <Field label="Description" name="description" placeholder="Optional" />
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-black/70 dark:text-white/70">Location</span>
        <select
          name="location_id"
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        >
          <option value="">No location set</option>
          {locations.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </select>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start date" name="start_date" type="date" required />
        <Field label="End date" name="end_date" type="date" required />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Create project"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-black/70 dark:text-white/70">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
      />
    </label>
  );
}
