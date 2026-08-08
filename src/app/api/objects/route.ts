import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const groupId = request.nextUrl.searchParams.get("group_id");
  const supabase = createAdminClient();

  let query = supabase.from("objects").select("*, group:object_groups(*)").order("name");
  if (groupId) query = query.eq("group_id", groupId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ objects: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    name,
    description,
    width_cm,
    height_cm,
    depth_cm,
    weight_kg,
    orientation_fixed,
    requires_climate_control,
    requires_uv_filtered,
    group_id,
  } = body ?? {};

  if (!name || !width_cm || !height_cm || !depth_cm) {
    return NextResponse.json(
      { error: "name, width_cm, height_cm and depth_cm are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("objects")
    .insert({
      name,
      description: description || null,
      width_cm,
      height_cm,
      depth_cm,
      weight_kg: weight_kg || null,
      orientation_fixed: !!orientation_fixed,
      requires_climate_control: !!requires_climate_control,
      requires_uv_filtered: !!requires_uv_filtered,
      group_id: group_id || null,
    })
    .select("*, group:object_groups(*)")
    .single();

  if (error) {
    const status = error.code === "23514" ? 400 : 500; // check_violation, e.g. non-positive dims
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ object: data }, { status: 201 });
}
