// lib/schema/types.ts

export type Environment =
  | "rugged_heritage"
  | "business_casual"
  | "creative_casual"
  | "executive_formal"
  | "workwear_trades"
  | "mixed";

export type TopColor =
  | "white"
  | "black"
  | "navy"
  | "olive"
  | "grey"
  | "earth_tones"
  | "patterned";

export type BottomType =
  | "dark_denim"
  | "black_denim"
  | "olive"
  | "khaki"
  | "tailored_trousers"
  | "raw_denim"
  | "work_pants";

export type BootColor =
  | "black"
  | "dark_brown"
  | "mid_brown"
  | "light_tan"
  | "burgundy"
  | "grey"
  | "other";

export type LeatherType =
  | "smooth"
  | "roughout"
  | "suede"
  | "waxed_flesh"
  | "other";

export type SoleType =
  | "heavy_lug"
  | "mid_lug"
  | "wedge"
  | "leather_minimal";

export type Height = "low" | "mid" | "tall";
export type Weight = "light" | "medium" | "heavy";
export type Rotation = "core" | "regular" | "occasional";

export interface BootAttributes {
  color: BootColor;
  leatherType: LeatherType;
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