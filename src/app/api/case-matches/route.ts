import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { combineGroup, matchCase, type MatchTarget } from "@/lib/matching";
import type { Case, MuseumObject } from "@/lib/types";

function toTarget(o: MuseumObject): MatchTarget {
  return {
    name: o.name,
    width_in: o.width_in,
    height_in: o.height_in,
    depth_in: o.depth_in,
    weight_kg: o.weight_kg,
    orientation_fixed: o.orientation_fixed,
    requires_climate_control: o.requires_climate_control,
    requires_uv_filtered: o.requires_uv_filtered,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { object_id, group_id, start_date, end_date } = body ?? {};

  if (!object_id && !group_id) {
    return NextResponse.json({ error: "object_id or group_id is required" }, { status: 400 });
  }
  if ((start_date && !end_date) || (end_date && !start_date)) {
    return NextResponse.json(
      { error: "start_date and end_date must be provided together" },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  let target: MatchTarget;
  let groupMembers: MuseumObject[] | null = null;

  if (object_id) {
    const { data: obj, error } = await supabase.from("objects").select("*").eq("id", object_id).single();
    if (error || !obj) {
      return NextResponse.json({ error: "Object not found" }, { status: 404 });
    }
    target = toTarget(obj as MuseumObject);
  } else {
    const { data: objs, error } = await supabase.from("objects").select("*").eq("group_id", group_id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!objs || objs.length === 0) {
      return NextResponse.json({ error: "Group has no objects to match" }, { status: 400 });
    }
    groupMembers = objs as MuseumObject[];
    target = combineGroup(groupMembers.map(toTarget));
  }

  const { data: cases, error: casesError } = await supabase
    .from("cases")
    .select("*")
    .eq("is_active", true)
    .order("code");
  if (casesError) {
    return NextResponse.json({ error: casesError.message }, { status: 500 });
  }

  let bookedCaseIds: Set<string> | null = null;
  if (start_date && end_date) {
    // Overlap test mirrors the DB's own [start,end] inclusive-range logic:
    // a booking conflicts if it starts on/before our end and ends on/after our start.
    const { data: bookings, error: bookingsError } = await supabase
      .from("bookings")
      .select("case_id")
      .eq("status", "confirmed")
      .lte("start_date", end_date)
      .gte("end_date", start_date);
    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 });
    }
    bookedCaseIds = new Set((bookings ?? []).map((b) => b.case_id));
  }

  const results = (cases as Case[]).map((c) => matchCase(target, c, bookedCaseIds));
  results.sort((a, b) => Number(b.isMatch) - Number(a.isMatch));

  return NextResponse.json({ target, groupMembers, results });
}
