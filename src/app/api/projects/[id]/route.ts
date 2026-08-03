import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: project, error: projectError }, { data: bookings, error: bookingsError }] =
    await Promise.all([
      supabase.from("projects").select("*, location:locations(*)").eq("id", id).single(),
      supabase
        .from("bookings")
        .select("*, case:cases(*)")
        .eq("project_id", id)
        .order("start_date"),
    ]);

  if (projectError) {
    return NextResponse.json({ error: projectError.message }, { status: 404 });
  }
  if (bookingsError) {
    return NextResponse.json({ error: bookingsError.message }, { status: 500 });
  }

  return NextResponse.json({ project, bookings });
}
