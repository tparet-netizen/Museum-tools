import type { Case } from "@/lib/types";

export interface MatchTarget {
  name: string;
  width_in: number;
  height_in: number;
  depth_in: number;
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
 * Does target's box fit inside a case's box?
 * width_in/depth_in (the footprint) are always required. height_in may be
 * null - that means an open pedestal/platform with no enclosure, so there's
 * no ceiling to check against; any object height is fine there.
 * If orientation_fixed, only the exact W/H/D mapping is tried. Otherwise
 * also tries rotating around the vertical axis (swap width/depth) - height
 * is never flipped, since laying most display objects on their side isn't
 * physically realistic.
 */
function checkFit(target: MatchTarget, c: Case): "as-is" | "rotated" | null {
  if (c.width_in == null || c.depth_in == null) return null;
  const heightOk = (h: number) => c.height_in == null || h <= c.height_in;

  const asIs = target.width_in <= c.width_in && heightOk(target.height_in) && target.depth_in <= c.depth_in;
  if (asIs) return "as-is";

  if (!target.orientation_fixed) {
    const rotated =
      target.depth_in <= c.width_in && heightOk(target.height_in) && target.width_in <= c.depth_in;
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
    width_in: objects.reduce((sum, o) => sum + o.width_in, 0),
    height_in: Math.max(...objects.map((o) => o.height_in)),
    depth_in: Math.max(...objects.map((o) => o.depth_in)),
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
