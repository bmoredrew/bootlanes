// lib/engine/getPairings.ts
// Generate wardrobe pairing recommendations for a boot

import type { WardrobeItem, TopColor, BottomType } from "../schema/types";
import {
    COLOR_PAIRINGS,
    FORMALITY_BOTTOMS,
    TEXTURE_FORMALITY_CAP,
} from "../schema/pairings";

export interface BootPairings {
    bootId: string;
    bootName: string;
    tops: TopColor[];
    bottoms: BottomType[];
}

/**
 * Get recommended pairings for a single boot
 * Considers: color compatibility, formality level, leather texture
 */
export function getBootPairings(boot: WardrobeItem): BootPairings {
    const { color, leatherType, formality } = boot.attributes;

    // Start with color-based recommendations
    const colorPairings = COLOR_PAIRINGS[color] || COLOR_PAIRINGS.other;

    // Get texture-adjusted formality ceiling
    const textureCap = TEXTURE_FORMALITY_CAP[leatherType] || 4;
    const effectiveFormality = Math.min(formality, textureCap);

    // Filter bottoms by formality appropriateness
    const formalityBottoms = FORMALITY_BOTTOMS[effectiveFormality] || [];

    // Intersect color-appropriate bottoms with formality-appropriate bottoms
    const filteredBottoms = colorPairings.bottoms.filter((b) =>
        formalityBottoms.includes(b)
    );

    // If intersection is empty, fall back to color pairings
    const finalBottoms =
        filteredBottoms.length > 0 ? filteredBottoms : colorPairings.bottoms;

    return {
        bootId: boot.id,
        bootName: boot.displayName || `${color} ${leatherType}`,
        tops: colorPairings.tops,
        bottoms: finalBottoms,
    };
}

/**
 * Get pairings for all boots in collection
 */
export function getAllPairings(boots: WardrobeItem[]): BootPairings[] {
    return boots.map(getBootPairings);
}
