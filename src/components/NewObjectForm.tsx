"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ObjectGroup } from "@/lib/types";

export function NewObjectForm() {
  const router = useRouter();
  const [groups, setGroups] = useState<ObjectGroup[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/object-groups")
      .then((res) => res.json())
      .then((body) => setGroups(body.groups ?? []));
  }, []);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);

        let groupId = (form.get("group_id") as string) || null;
        const newGroupName = (form.get("new_group_name") as string)?.trim();
        if (newGroupName) {
          const groupRes = await fetch("/api/object-groups", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newGroupName }),
          });
          const groupBody = await groupRes.json();
          if (!groupRes.ok) {
            setPending(false);
            setError(groupBody.error ?? "Failed to create group");
            return;
          }
          groupId = groupBody.group.id;
        }

        const res = await fetch("/api/objects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            description: form.get("description") || null,
            width_cm: Number(form.get("width_cm")),
            height_cm: Number(form.get("height_cm")),
            depth_cm: Number(form.get("depth_cm")),
            weight_kg: form.get("weight_kg") ? Number(form.get("weight_kg")) : null,
            orientation_fixed: form.get("orientation_fixed") === "on",
            requires_climate_control: form.get("requires_climate_control") === "on",
            requires_uv_filtered: form.get("requires_uv_filtered") === "on",
            group_id: groupId,
          }),
        });
        setPending(false);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "Failed to create object");
          return;
        }
        router.push(`/objects/${body.object.id}`);
      }}
      className="flex max-w-md flex-col gap-3"
    >
      <Field label="Name" name="name" required placeholder="Bronze Amphora" />
      <Field label="Description" name="description" placeholder="Optional" />

      <div className="grid grid-cols-3 gap-3">
        <Field label="Width (cm)" name="width_cm" type="number" required />
        <Field label="Height (cm)" name="height_cm" type="number" required />
        <Field label="Depth (cm)" name="depth_cm" type="number" required />
      </div>
      <Field label="Weight (kg)" name="weight_kg" type="number" placeholder="Optional" />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="orientation_fixed" className="rounded" />
        <span>Orientation is fixed (can&apos;t be reoriented to fit)</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="requires_climate_control" className="rounded" />
        <span>Requires a climate-controlled case</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="requires_uv_filtered" className="rounded" />
        <span>Requires a UV-filtered case</span>
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="text-black/70 dark:text-white/70">Group (optional)</span>
        <select
          name="group_id"
          className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
        >
          <option value="">No group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </label>
      <Field
        label="Or create a new group named"
        name="new_group_name"
        placeholder="Overrides the dropdown above if filled in"
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save object"}
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
        step={type === "number" ? "any" : undefined}
        className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
      />
    </label>
  );
}
