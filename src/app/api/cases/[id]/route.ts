import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: caseRow, error: caseError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase.from("cases").select("*").eq("id", id).single(),
      supabase
        .from("bookings")
        .select("*, project:projects(*)")
        .eq("case_id", id)
        .order("start_date", { ascending: false }),
    ]);

  if (caseError) {
    return NextResponse.json({ error: caseError.message }, { status: 404 });
  }
  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  return NextResponse.json({ case: caseRow, bookings });
}
