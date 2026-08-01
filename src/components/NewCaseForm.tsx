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
        <Field label="Location" name="location" placeholder="Gallery 1" />
        <Field label="Description" name="description" placeholder="Optional" />
      </div>
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
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-black/70 dark:text-white/70">{label}</span>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
      />
    </label>
  );
}
