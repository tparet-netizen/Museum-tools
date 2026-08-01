"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export function CaseSearchForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (q) params.set("q", q);
        else params.delete("q");
        router.push(`/cases?${params.toString()}`);
      }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search by name, code, or location..."
        className="w-full max-w-sm rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/15 dark:bg-transparent"
      />
      <button
        type="submit"
        className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10"
      >
        Search
      </button>
    </form>
  );
}
