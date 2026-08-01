"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  return (
    <button
      disabled={pending}
      onClick={async () => {
        if (!confirm("Cancel this booking? This frees up the case for those dates.")) {
          return;
        }
        setPending(true);
        await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" }),
        });
        setPending(false);
        router.refresh();
      }}
      className="rounded-md border border-black/10 px-3 py-1.5 text-xs font-medium hover:bg-black/5 disabled:opacity-50 dark:border-white/15 dark:hover:bg-white/10"
    >
      {pending ? "Cancelling..." : "Cancel"}
    </button>
  );
}
