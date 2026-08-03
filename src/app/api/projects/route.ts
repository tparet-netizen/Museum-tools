import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, location:locations(*)")
    .order("start_date", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ projects: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description, start_date, end_date, status, location_id } = body ?? {};

  if (!name || !start_date || !end_date) {
    return NextResponse.json(
      { error: "name, start_date and end_date are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ name, description, start_date, end_date, status, location_id: location_id || null })
    .select("*, location:locations(*)")
    .single();

  if (error) {
    const status = error.code === "23514" ? 400 : 500; // check_violation, e.g. end < start
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ project: data }, { status: 201 });
}
