"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function NewCaseForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
      >
        New case
      </button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const form = new FormData(e.currentTarget);
        const res = await fetch("/api/cases", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            code: form.get("code"),
            name: form.get("name"),
            location: form.get("location") || null,
            description: form.get("description") || null,
            finish: form.get("finish") || null,
            condition: form.get("condition") || null,
            width_in: form.get("width_in") ? Number(form.get("width_in")) : null,
            height_in: form.get("height_in") ? Number(form.get("height_in")) : null,
            depth_in: form.get("depth_in") ? Number(form.get("depth_in")) : null,
            max_weight_kg: form.get("max_weight_kg") ? Number(form.get("max_weight_kg")) : null,
            is_climate_controlled: form.get("is_climate_controlled") === "on",
            is_uv_filtered: form.get("is_uv_filtered") === "on",
          }),
        });
        setPending(false);
        if (!res.ok) {
          const body = await res.json();
          setError(body.error ?? "Failed to create case");
          return;
        }
        setOpen(false);
        router.refresh();
      }}
      className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/15"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Code" name="code" required placeholder="G1-01" />
        <Field label="Name" name="name" required placeholder="Entrance Vitrine" />
        <Field label="Location" name="location" placeholder="e.g. 2nd Fl. South Gallery" />
        <Field label="Description" name="description" placeholder="Optional" />
        <Field label="Finish" name="finish" placeholder="e.g. White laminate pedestal" />
        <Field label="Condition" name="condition" placeholder="e.g. Good" />
      </div>
      <p className="text-xs text-black/50 dark:text-white/50">
        Width/height/depth below are the effective size used for matching objects to this case - the
        vitrine interior if enclosed, or the open deck footprint (leave height blank) if not.
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Field label="Width (in)" name="width_in" type="number" placeholder="Interior" />
        <Field label="Height (in)" name="height_in" type="number" placeholder="Interior" />
        <Field label="Depth (in)" name="depth_in" type="number" placeholder="Interior" />
        <Field label="Max weight (kg)" name="max_weight_kg" type="number" placeholder="Optional" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_climate_controlled" className="rounded" />
        <span>Climate controlled</span>
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="is_uv_filtered" className="rounded" />
        <span>UV filtered</span>
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save case"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
        >
          Cancel
        </button>
      </div>
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
        step={type === "number" ? "any" : undefined}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
      />
    </label>
  );
}
