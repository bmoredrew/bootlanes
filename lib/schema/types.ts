// lib/schema/types.ts

// ============================================
// Arrays (single source of truth)
// ============================================
export const ENVIRONMENTS = [
  "rugged_heritage",
  "business_casual",
  "creative_casual",
  "executive_formal",
  "workwear_trades",
  "mixed",
] as const;

export const TOP_COLORS = [
  "white",
  "black",
  "navy",
  "olive",
  "grey",
  "earth_tones",
  "patterned",
] as const;

export const BOTTOM_TYPES = [
  "dark_denim",
  "black_denim",
  "olive",
  "khaki",
  "tailored_trousers",
  "raw_denim",
  "work_pants",
] as const;

export const BOOT_COLORS = [
  "black",
  "dark_brown",
  "brown",
  "mid_brown",
  "light_tan",
  "natural",
  "burgundy",
  "grey",
  "other",
] as const;

export const LEATHER_TYPES = [
  "smooth",
  "roughout",
  "suede",
  "waxed_flesh",
  "other",
] as const;

export const SOLE_TYPES = [
  "heavy_lug",
  "mid_lug",
  "vbar",
  "wedge",
  "leather_minimal",
] as const;

export const HEIGHTS = ["low", "mid", "tall"] as const;
export const WEIGHTS = ["light", "medium", "heavy"] as const;
export const ROTATIONS = ["core", "regular", "occasional"] as const;

// ============================================
// Types (derived from arrays)
// ============================================
export type Environment = (typeof ENVIRONMENTS)[number];
export type TopColor = (typeof TOP_COLORS)[number];
export type BottomType = (typeof BOTTOM_TYPES)[number];
export type BootColor = (typeof BOOT_COLORS)[number];
export type LeatherType = (typeof LEATHER_TYPES)[number];
export type SoleType = (typeof SOLE_TYPES)[number];
export type Height = (typeof HEIGHTS)[number];
export type Weight = (typeof WEIGHTS)[number];
export type Rotation = (typeof ROTATIONS)[number];

export interface BootAttributes {
  color: BootColor;
  leatherType: LeatherType;
  /** Optional secondary color for two-tone boots */
  secondaryColor?: BootColor;
  /** Optional secondary leather type for two-tone boots */
  secondaryLeatherType?: LeatherType;
  soleType: SoleType;
  height: Height;
  weight: Weight;
  formality: number; // 1–5
}

export interface WardrobeItem {
  id: string;
  displayName?: string;
  category: "boots";
  attributes: BootAttributes;
  rotation: Rotation;
}

export interface Profile {
  version: string;
  context: {
    primaryEnvironments: Environment[];
  };
  wardrobe: {
    tops: TopColor[];
    bottoms: BottomType[];
  };
  items: WardrobeItem[];
}