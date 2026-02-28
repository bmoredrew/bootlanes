// lib/schema/constants.ts

import type { Rotation, Environment, BootColor, Height, SoleType } from "./types";

// ============================================
// Rotation Weights (internal, invisible in UI)
// ============================================
export const ROTATION_WEIGHTS: Record<Rotation, number> = {
    core: 1.0,
    regular: 0.7,
    occasional: 0.3,
};

// ============================================
// Environment to Formality Range Mapping
// ============================================
export const ENVIRONMENT_FORMALITY_RANGES: Record<Environment, [number, number]> = {
    rugged_heritage: [1, 2],
    workwear_trades: [1, 2],
    business_casual: [2, 4],
    creative_casual: [2, 4],
    executive_formal: [4, 5],
    mixed: [1, 5],
};

// ============================================
// Color Adjacency Map
// Adjacent-only bridge logic
// ============================================
export const COLOR_ADJACENCY: Record<BootColor, BootColor[]> = {
    black: ["dark_brown", "burgundy", "grey"],
    dark_brown: ["black", "brown", "burgundy"],
    brown: ["dark_brown", "mid_brown"],
    mid_brown: ["brown", "light_tan"],
    light_tan: ["mid_brown", "natural"],
    natural: ["light_tan"],
    burgundy: ["black", "dark_brown"],
    grey: ["black"],
    other: [],
};

// Color order for bridge direction
export const COLOR_ORDER: BootColor[] = [
    "black",
    "dark_brown",
    "brown",
    "mid_brown",
    "light_tan",
    "natural",
];

// ============================================
// Height Adjacency Map
// tall ↔ mid ↔ low
// ============================================
export const HEIGHT_ADJACENCY: Record<Height, Height[]> = {
    tall: ["mid"],
    mid: ["tall", "low"],
    low: ["mid"],
};

export const HEIGHT_ORDER: Height[] = ["tall", "mid", "low"];

// ============================================
// Sole Adjacency Map
// heavy_lug → mid_lug → wedge → leather_minimal
// ============================================
export const SOLE_ADJACENCY: Record<SoleType, SoleType[]> = {
    heavy_lug: ["mid_lug"],
    mid_lug: ["heavy_lug", "vbar"],
    vbar: ["mid_lug", "wedge"],
    wedge: ["vbar", "leather_minimal"],
    leather_minimal: ["wedge"],
};

export const SOLE_ORDER: SoleType[] = [
    "heavy_lug",
    "mid_lug",
    "vbar",
    "wedge",
    "leather_minimal",
];

// ============================================
// Formality Scale
// 1 = Work/Rugged, 2 = Heritage Rugged, 3 = Neutral Everyday, 4 = Refined Casual, 5 = Dress-leaning
// Bridge may only move ±1
// ============================================
export const FORMALITY_MIN = 1;
export const FORMALITY_MAX = 5;

// ============================================
// Redundancy Detection Thresholds
// ============================================
export const REDUNDANCY_FORMALITY_THRESHOLD = 0.5;

// ============================================
// Clustering Threshold
// If dominant dimension exceeds this, trigger bridge
// ============================================
export const CLUSTERING_THRESHOLD = 0.85;

// ============================================
// Warm Tones (for palette gap detection)
// ============================================
export const WARM_BOOT_COLORS: BootColor[] = [
    "dark_brown",
    "mid_brown",
    "light_tan",
    "burgundy",
];

export const WARM_TOP_COLORS = ["earth_tones", "olive"] as const;

// ============================================
// Profile Version
// ============================================
export const CURRENT_PROFILE_VERSION = "1.0.0";
