import type { Case } from "@/lib/types";

export interface MatchTarget {
  name: string;
  width_cm: number;
  height_cm: number;
  depth_cm: number;
  weight_kg: number | null;
  orientation_fixed: boolean;
  requires_climate_control: boolean;
  requires_uv_filtered: boolean;
}

export interface MatchResult {
  case: Case;
  fits: boolean;
  orientation: "as-is" | "rotated" | null; // which orientation fit, if any
  weightOk: boolean;
  climateOk: boolean;
  uvOk: boolean;
  available: boolean | null; // null when no date range was given, so unknown
  isMatch: boolean; // fits + weightOk + climateOk + uvOk + (available !== false)
}

/**
 * Does target's box fit inside a case's interior box?
 * If orientation_fixed, only the exact W/H/D mapping is tried. Otherwise
 * also tries rotating around the vertical axis (swap width/depth) - height
 * is never flipped, since laying most display objects on their side isn't
 * physically realistic.
 */
function checkFit(target: MatchTarget, c: Case): "as-is" | "rotated" | null {
  if (c.width_cm == null || c.height_cm == null || c.depth_cm == null) return null;

  const asIs =
    target.width_cm <= c.width_cm && target.height_cm <= c.height_cm && target.depth_cm <= c.depth_cm;
  if (asIs) return "as-is";

  if (!target.orientation_fixed) {
    const rotated =
      target.depth_cm <= c.width_cm && target.height_cm <= c.height_cm && target.width_cm <= c.depth_cm;
    if (rotated) return "rotated";
  }

  return null;
}

/**
 * Combine a group of objects into a single synthetic target for matching
 * against one case. This is a deliberately simple heuristic, not true 3D
 * bin-packing: it assumes items are arranged side-by-side along the width
 * axis on a shared shelf/base, which is a reasonable approximation for
 * small object groups but not a guarantee of an exact physical layout.
 */
export function combineGroup(objects: MatchTarget[]): MatchTarget {
  const totalWeight = objects.reduce((sum, o) => sum + (o.weight_kg ?? 0), 0);
  const hasWeight = objects.some((o) => o.weight_kg != null);
  return {
    name: `Group of ${objects.length} objects`,
    width_cm: objects.reduce((sum, o) => sum + o.width_cm, 0),
    height_cm: Math.max(...objects.map((o) => o.height_cm)),
    depth_cm: Math.max(...objects.map((o) => o.depth_cm)),
    weight_kg: hasWeight ? totalWeight : null,
    // A pre-arranged group's combined footprint isn't something to reorient.
    orientation_fixed: true,
    requires_climate_control: objects.some((o) => o.requires_climate_control),
    requires_uv_filtered: objects.some((o) => o.requires_uv_filtered),
  };
}

export function matchCase(
  target: MatchTarget,
  c: Case,
  bookedCaseIds: Set<string> | null // null = availability unknown (no date range given)
): MatchResult {
  const orientation = checkFit(target, c);
  const fits = orientation !== null;
  const weightOk = target.weight_kg == null || c.max_weight_kg == null || target.weight_kg <= c.max_weight_kg;
  const climateOk = !target.requires_climate_control || c.is_climate_controlled;
  const uvOk = !target.requires_uv_filtered || c.is_uv_filtered;
  const available = bookedCaseIds === null ? null : !bookedCaseIds.has(c.id);

  return {
    case: c,
    fits,
    orientation,
    weightOk,
    climateOk,
    uvOk,
    available,
    isMatch: fits && weightOk && climateOk && uvOk && available !== false,
  };
}
