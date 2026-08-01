import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const caseId = request.nextUrl.searchParams.get("case_id");
  const projectId = request.nextUrl.searchParams.get("project_id");

  const supabase = createAdminClient();
  let query = supabase
    .from("bookings")
    .select("*, case:cases(*), project:projects(*)")
    .order("start_date");

  if (caseId) query = query.eq("case_id", caseId);
  if (projectId) query = query.eq("project_id", projectId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ bookings: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { case_id, project_id, start_date, end_date, notes } = body ?? {};

  if (!case_id || !project_id || !start_date || !end_date) {
    return NextResponse.json(
      { error: "case_id, project_id, start_date and end_date are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .insert({ case_id, project_id, start_date, end_date, notes })
    .select("*, case:cases(*), project:projects(*)")
    .single();

  if (error) {
    // 23P01 = exclusion_violation -> the case is already booked over an
    // overlapping range. 23514 = check_violation -> e.g. dates outside the
    // project's own date range, or end_date before start_date.
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

  return NextResponse.json({ booking: data }, { status: 201 });
}
