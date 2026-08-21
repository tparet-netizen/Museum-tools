import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  const supabase = createAdminClient();

  let query = supabase.from("cases").select("*").order("code");
  if (q) {
    query = query.or(
      `name.ilike.%${q}%,code.ilike.%${q}%,location.ilike.%${q}%`
    );
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ cases: data });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const {
    code,
    name,
    location,
    width_in,
    height_in,
    depth_in,
    description,
    finish,
    condition,
    max_weight_kg,
    is_climate_controlled,
    is_uv_filtered,
  } = body ?? {};

  if (!code || !name) {
    return NextResponse.json(
      { error: "code and name are required" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("cases")
    .insert({
      code,
      name,
      location,
      width_in: width_in || null,
      height_in: height_in || null,
      depth_in: depth_in || null,
      description,
      finish: finish || null,
      condition: condition || null,
      max_weight_kg: max_weight_kg || null,
      is_climate_controlled: !!is_climate_controlled,
      is_uv_filtered: !!is_uv_filtered,
    })
    .select()
    .single();

  if (error) {
    const status = error.code === "23505" ? 409 : 500; // unique_violation on code
    return NextResponse.json({ error: error.message }, { status });
  }
  return NextResponse.json({ case: data }, { status: 201 });
}
