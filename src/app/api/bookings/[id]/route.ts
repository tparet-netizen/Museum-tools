import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { start_date, end_date, status, notes } = body ?? {};

  const update: Record<string, unknown> = {};
  if (start_date !== undefined) update.start_date = start_date;
  if (end_date !== undefined) update.end_date = end_date;
  if (status !== undefined) update.status = status;
  if (notes !== undefined) update.notes = notes;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .update(update)
    .eq("id", id)
    .select("*, case:cases(*), project:projects(*)")
    .single();

  if (error) {
    if (error.code === "23P01") {
      return NextResponse.json(
        { error: "This case is already booked for an overlapping date range." },
        { status: 409 }
      );
    }
    if (error.code === "23514") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ booking: data });
}
