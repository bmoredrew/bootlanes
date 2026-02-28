// lib/engine/detectRedundancy.ts

import type { WardrobeItem } from "../schema/types";
import { REDUNDANCY_FORMALITY_THRESHOLD } from "../schema/constants";

export interface RedundancyPair {
    item1: WardrobeItem;
    item2: WardrobeItem;
    matchingAttributes: string[];
}

/**
 * Detect redundancy within core rotation only
 * 
 * Overlap is counted when two boots match on:
 * - Same color bucket
 * - Same height bucket
 * - Same sole bucket
 * - Formality difference ≤ 0.5
 */
export function detectRedundancy(items: WardrobeItem[]): RedundancyPair[] {
    // Filter to core rotation only
    const coreItems = items.filter((item) => item.rotation === "core");

    const redundantPairs: RedundancyPair[] = [];

    // Compare each pair of core items
    for (let i = 0; i < coreItems.length; i++) {
        for (let j = i + 1; j < coreItems.length; j++) {
            const item1 = coreItems[i];
            const item2 = coreItems[j];

            const matchingAttributes: string[] = [];

            // Check color match
            if (item1.attributes.color === item2.attributes.color) {
                matchingAttributes.push("color");
            }

            // Check height match
            if (item1.attributes.height === item2.attributes.height) {
                matchingAttributes.push("height");
            }

            // Check sole match
            if (item1.attributes.soleType === item2.attributes.soleType) {
                matchingAttributes.push("sole");
            }

            // Check formality proximity
            const formalityDiff = Math.abs(
                item1.attributes.formality - item2.attributes.formality
            );
            if (formalityDiff <= REDUNDANCY_FORMALITY_THRESHOLD) {
                matchingAttributes.push("formality");
            }

            // Redundancy requires ALL four conditions
            if (matchingAttributes.length === 4) {
                redundantPairs.push({
                    item1,
                    item2,
                    matchingAttributes,
                });
            }
        }
    }

    return redundantPairs;
}

/**
 * Check if any redundancy exists
 */
export function hasRedundancy(items: WardrobeItem[]): boolean {
    return detectRedundancy(items).length > 0;
}

/**
 * Get count of redundant pairs
 */
export function getRedundancyCount(items: WardrobeItem[]): number {
    return detectRedundancy(items).length;
}
