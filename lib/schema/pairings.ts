// lib/schema/pairings.ts
// Curated pairing recommendations for boots → wardrobe

import type { BootColor, TopColor, BottomType, LeatherType } from "./types";

// ============================================
// Color-based pairings
// What tops/bottoms work with each boot color
// ============================================
export const COLOR_PAIRINGS: Record<
    BootColor,
    { tops: TopColor[]; bottoms: BottomType[] }
> = {
    black: {
        tops: ["black", "white", "grey", "navy"],
        bottoms: ["black_denim", "dark_denim", "tailored_trousers"],
    },
    dark_brown: {
        tops: ["navy", "earth_tones", "olive", "white", "grey"],
        bottoms: ["dark_denim", "raw_denim", "khaki", "earth_tones"],
    },
    brown: {
        tops: ["navy", "earth_tones", "olive", "white"],
        bottoms: ["dark_denim", "raw_denim", "khaki", "earth_tones"],
    },
    mid_brown: {
        tops: ["navy", "earth_tones", "olive", "white", "grey"],
        bottoms: ["dark_denim", "raw_denim", "khaki", "earth_tones"],
    },
    light_tan: {
        tops: ["navy", "white", "earth_tones", "olive"],
        bottoms: ["dark_denim", "raw_denim", "khaki"],
    },
    natural: {
        tops: ["navy", "white", "earth_tones", "olive"],
        bottoms: ["dark_denim", "raw_denim", "khaki"],
    },
    burgundy: {
        tops: ["navy", "grey", "white", "earth_tones"],
        bottoms: ["dark_denim", "raw_denim", "tailored_trousers", "khaki"],
    },
    grey: {
        tops: ["black", "white", "navy", "grey"],
        bottoms: ["black_denim", "dark_denim", "tailored_trousers"],
    },
    other: {
        tops: ["white", "grey", "navy"],
        bottoms: ["dark_denim", "black_denim"],
    },
};

// ============================================
// Formality-based bottom filtering
// Which bottoms are appropriate at each formality level
// ============================================
export const FORMALITY_BOTTOMS: Record<number, BottomType[]> = {
    1: ["work_pants", "raw_denim", "dark_denim"], // Work/Rugged
    2: ["raw_denim", "dark_denim", "work_pants", "earth_tones"], // Heritage Rugged
    3: ["dark_denim", "raw_denim", "khaki", "earth_tones"], // Neutral Everyday
    4: ["dark_denim", "khaki", "tailored_trousers", "earth_tones"], // Refined Casual
    5: ["tailored_trousers", "dark_denim", "khaki"], // Dress-leaning
};

// ============================================
// Leather texture influence
// roughout/suede lean more casual, smooth more versatile
// ============================================
export const TEXTURE_FORMALITY_CAP: Record<LeatherType, number> = {
    smooth: 5, // Can dress up
    roughout: 3, // Tops out at casual
    suede: 4, // Somewhat dressier than roughout
    waxed_flesh: 3, // Workwear vibes
    other: 4,
};
