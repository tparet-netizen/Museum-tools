"use client";

import Link from "next/link";
import { useState } from "react";
import type { Case } from "@/lib/types";

type MatchResult = {
  case: Case;
  fits: boolean;
  orientation: "as-is" | "rotated" | null;
  weightOk: boolean;
  climateOk: boolean;
  uvOk: boolean;
  available: boolean | null;
  isMatch: boolean;
};

export function MatchCasesPanel({ objectId, groupId }: { objectId?: string; groupId?: string }) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [results, setResults] = useState<MatchResult[] | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runMatch() {
    setPending(true);
    setError(null);
    const res = await fetch("/api/case-matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        object_id: objectId,
        group_id: groupId,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
      }),
    });
    const body = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(body.error ?? "Failed to find matching cases");
      return;
    }
    setResults(body.results);
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-black/10 p-4 dark:border-white/15">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-black/70 dark:text-white/70">Needed from</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-black/70 dark:text-white/70">Until</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/15 dark:bg-transparent"
          />
        </label>
        <button
          onClick={runMatch}
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Searching..." : "Find matching cases"}
        </button>
        <p className="text-xs text-black/50 dark:text-white/50">
          Leave dates blank to check fit/requirements only, without checking availability.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {results && (
        <div className="flex flex-col gap-2">
          {results.length === 0 && (
            <p className="text-sm text-black/60 dark:text-white/60">No active cases to check against.</p>
          )}
          {results.map((r) => (
            <div
              key={r.case.id}
              className={`flex items-center justify-between rounded-lg border p-3 ${
                r.isMatch
                  ? "border-green-300 dark:border-green-800"
                  : "border-black/10 dark:border-white/15 opacity-70"
              }`}
            >
              <div>
                <Link href={`/cases/${r.case.id}`} className="font-medium hover:underline">
                  {r.case.code} &middot; {r.case.name}
                </Link>
                <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                  <Badge ok={r.fits} label={r.fits ? `Fits (${r.orientation === "rotated" ? "rotated" : "as-is"})` : "Doesn't fit"} />
                  <Badge ok={r.weightOk} label="Weight" />
                  <Badge ok={r.climateOk} label="Climate" />
                  <Badge ok={r.uvOk} label="UV" />
                  {r.available !== null && <Badge ok={r.available} label={r.available ? "Available" : "Booked"} />}
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  r.isMatch
                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                    : "bg-black/10 text-black/60 dark:bg-white/10 dark:text-white/60"
                }`}
              >
                {r.isMatch ? "Match" : "No match"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Badge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 ${
        ok
          ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
          : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      }`}
    >
      {label}
    </span>
  );
}
