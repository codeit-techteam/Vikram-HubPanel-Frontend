/** Maps Customer App category slugs → inventory row icon keys. */
export const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  cement: "package",
  rmc: "layers",
  /** Legacy slug kept for older inventory / filter rows */
  steel: "layers",
  "structural-steel": "layers",
  structural_steel: "layers",
  sand: "mountain",
  aggregates: "mountain",
  stone: "mountain",
  bricks: "box",
  brick: "box",
  masonry: "box",
  blocks: "box",
  tiles: "box",
  plumbing: "pipette",
  pipes: "pipette",
  paint: "pipette",
  adhesives: "pipette",
  waterproofing: "pipette",
  "wall-repair": "pipette",
  "quick-repair": "pipette",
  putty: "pipette",
  hardware: "layers",
  electrical: "layers",
};

export function categoryIconForSlug(slug?: string | null): string {
  if (!slug) return "package";
  return CATEGORY_ICON_BY_SLUG[slug] ?? CATEGORY_ICON_BY_SLUG[slug.toLowerCase()] ?? "package";
}
