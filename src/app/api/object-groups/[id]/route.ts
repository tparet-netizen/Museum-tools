import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: group, error: groupError }, { data: objects, error: objectsError }] = await Promise.all([
    supabase.from("object_groups").select("*").eq("id", id).single(),
    supabase.from("objects").select("*").eq("group_id", id).order("name"),
  ]);

  if (groupError) {
    return NextResponse.json({ error: groupError.message }, { status: 404 });
  }
  if (objectsError) {
    return NextResponse.json({ error: objectsError.message }, { status: 500 });
  }

  return NextResponse.json({ group, objects });
}
