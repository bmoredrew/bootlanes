// lib/engine/calculateMetrics.ts

import type { Profile, WardrobeItem, BootColor, Height, SoleType } from "../schema/types";
import { BOOT_COLORS, HEIGHTS, SOLE_TYPES } from "../schema/types";
import { ROTATION_WEIGHTS } from "../schema/constants";

export interface WeightedDistribution<T extends string> {
    counts: Record<T, number>;
    percentages: Record<T, number>;
    totalWeight: number;
    dominant: T | null;
    dominantPercentage: number;
}

export interface ProfileMetrics {
    colorDistribution: WeightedDistribution<BootColor>;
    heightDistribution: WeightedDistribution<Height>;
    soleDistribution: WeightedDistribution<SoleType>;
    weightedAverageFormality: number;
    itemCount: number;
    coreCount: number;
}

/**
 * Calculate weighted distribution for a given attribute
 */
function calculateDistribution<T extends string>(
    items: WardrobeItem[],
    getAttribute: (item: WardrobeItem) => T,
    allValues: readonly T[]
): WeightedDistribution<T> {
    const counts = {} as Record<T, number>;
    let totalWeight = 0;

    // Initialize all values to 0
    for (const value of allValues) {
        counts[value] = 0;
    }

    // Sum weighted counts
    for (const item of items) {
        const weight = ROTATION_WEIGHTS[item.rotation];
        const value = getAttribute(item);
        counts[value] = (counts[value] || 0) + weight;
        totalWeight += weight;
    }

    // Calculate percentages
    const percentages = {} as Record<T, number>;
    for (const value of allValues) {
        percentages[value] = totalWeight > 0 ? counts[value] / totalWeight : 0;
    }

    // Find dominant
    let dominant: T | null = null;
    let dominantPercentage = 0;
    for (const value of allValues) {
        if (percentages[value] > dominantPercentage) {
            dominantPercentage = percentages[value];
            dominant = value;
        }
    }

    return {
        counts,
        percentages,
        totalWeight,
        dominant,
        dominantPercentage,
    };
}

/**
 * Calculate weighted average formality
 */
function calculateWeightedFormality(items: WardrobeItem[]): number {
    let totalWeight = 0;
    let weightedSum = 0;

    for (const item of items) {
        const weight = ROTATION_WEIGHTS[item.rotation];
        weightedSum += item.attributes.formality * weight;
        totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
}

/**
 * Calculate all metrics for a profile
 * Pure function - no side effects
 */
export function calculateMetrics(profile: Profile): ProfileMetrics {
    const { items } = profile;

    const colorDistribution = calculateDistribution(
        items,
        (item) => item.attributes.color,
        BOOT_COLORS
    );

    const heightDistribution = calculateDistribution(
        items,
        (item) => item.attributes.height,
        HEIGHTS
    );

    const soleDistribution = calculateDistribution(
        items,
        (item) => item.attributes.soleType,
        SOLE_TYPES
    );

    const weightedAverageFormality = calculateWeightedFormality(items);

    const coreCount = items.filter((item) => item.rotation === "core").length;

    return {
        colorDistribution,
        heightDistribution,
        soleDistribution,
        weightedAverageFormality,
        itemCount: items.length,
        coreCount,
    };
}
