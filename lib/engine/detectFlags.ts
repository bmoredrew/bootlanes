// lib/engine/detectFlags.ts

import type { Profile, Environment, BootColor } from "../schema/types";
import type { SuggestionType, SuggestedLane } from "./types";
import type { ProfileMetrics } from "./calculateMetrics";
import {
    ENVIRONMENT_FORMALITY_RANGES,
    CLUSTERING_THRESHOLD,
    COLOR_ADJACENCY,
    HEIGHT_ADJACENCY,
    SOLE_ADJACENCY,
    WARM_BOOT_COLORS,
    WARM_TOP_COLORS,
} from "../schema/constants";
import { hasRedundancy } from "./detectRedundancy";

export interface FlagResult {
    type: SuggestionType;
    reason: string;
    lane?: SuggestedLane;
}

/**
 * Calculate expected formality range for given environments
 */
function getExpectedFormalityRange(environments: Environment[]): [number, number] {
    if (environments.length === 0) {
        return [1, 5]; // Default to full range
    }

    let minFormality = 5;
    let maxFormality = 1;

    for (const env of environments) {
        const [envMin, envMax] = ENVIRONMENT_FORMALITY_RANGES[env];
        minFormality = Math.min(minFormality, envMin);
        maxFormality = Math.max(maxFormality, envMax);
    }

    return [minFormality, maxFormality];
}

/**
 * Find adjacent color to bridge toward
 */
function findAdjacentColor(dominant: BootColor, direction: "lighter" | "darker"): BootColor | undefined {
    const adjacent = COLOR_ADJACENCY[dominant];
    if (!adjacent || adjacent.length === 0) return undefined;

    // Simple heuristic: return first adjacent that exists
    // Could be enhanced with more sophisticated direction logic
    return adjacent[0];
}

/**
 * Rule 1: Consolidate
 * If redundancy detected → return "consolidate"
 */
function checkConsolidate(profile: Profile): FlagResult | null {
    if (hasRedundancy(profile.items)) {
        return {
            type: "consolidate",
            reason: "Redundancy detected in core rotation",
        };
    }
    return null;
}

/**
 * Rule 2: Extreme Clustering
 * If dominant dimension exceeds 85% weighted share → return "bridge"
 */
function checkExtremeClustering(metrics: ProfileMetrics): FlagResult | null {
    // Check color clustering
    if (metrics.colorDistribution.dominantPercentage > CLUSTERING_THRESHOLD) {
        const dominant = metrics.colorDistribution.dominant;
        if (dominant && dominant !== "other") {
            const bridgeTo = findAdjacentColor(dominant, "lighter");
            return {
                type: "bridge",
                reason: `Color heavily clustered at ${dominant} (${Math.round(metrics.colorDistribution.dominantPercentage * 100)}%)`,
                lane: bridgeTo ? { color: bridgeTo } : undefined,
            };
        }
    }

    // Check height clustering
    if (metrics.heightDistribution.dominantPercentage > CLUSTERING_THRESHOLD) {
        const dominant = metrics.heightDistribution.dominant;
        if (dominant) {
            const adjacent = HEIGHT_ADJACENCY[dominant][0];
            return {
                type: "bridge",
                reason: `Height heavily clustered at ${dominant} (${Math.round(metrics.heightDistribution.dominantPercentage * 100)}%)`,
                lane: adjacent ? { height: adjacent } : undefined,
            };
        }
    }

    // Check sole clustering
    if (metrics.soleDistribution.dominantPercentage > CLUSTERING_THRESHOLD) {
        const dominant = metrics.soleDistribution.dominant;
        if (dominant) {
            const adjacent = SOLE_ADJACENCY[dominant][0];
            return {
                type: "bridge",
                reason: `Sole type heavily clustered at ${dominant} (${Math.round(metrics.soleDistribution.dominantPercentage * 100)}%)`,
                lane: adjacent ? { soleType: adjacent } : undefined,
            };
        }
    }

    return null;
}

/**
 * Rule 3: Context Misalignment
 * If weighted average formality outside expected range ±1 → return "bridge"
 */
function checkContextMisalignment(
    profile: Profile,
    metrics: ProfileMetrics
): FlagResult | null {
    const [expectedMin, expectedMax] = getExpectedFormalityRange(
        profile.context.primaryEnvironments
    );

    const avgFormality = metrics.weightedAverageFormality;
    const tolerance = 1;

    if (avgFormality < expectedMin - tolerance) {
        // Too casual for environment
        const bridgeFormality = Math.min(Math.round(avgFormality) + 1, 5);
        return {
            type: "bridge",
            reason: `Average formality (${avgFormality.toFixed(1)}) below expected range for environment`,
            lane: { formality: bridgeFormality },
        };
    }

    if (avgFormality > expectedMax + tolerance) {
        // Too formal for environment
        const bridgeFormality = Math.max(Math.round(avgFormality) - 1, 1);
        return {
            type: "bridge",
            reason: `Average formality (${avgFormality.toFixed(1)}) above expected range for environment`,
            lane: { formality: bridgeFormality },
        };
    }

    return null;
}

/**
 * Rule 4: Minor Palette Gap
 * If wardrobe contains warm tones but no adjacent footwear tone → return "strengthen"
 */
function checkPaletteGap(profile: Profile): FlagResult | null {
    // Check if wardrobe has warm tops
    const hasWarmTops = profile.wardrobe.tops.some((top) =>
        (WARM_TOP_COLORS as readonly string[]).includes(top)
    );

    if (!hasWarmTops) {
        return null;
    }

    // Check if boots have any warm tones
    const hasWarmBoots = profile.items.some((item) =>
        WARM_BOOT_COLORS.includes(item.attributes.color)
    );

    if (!hasWarmBoots) {
        return {
            type: "strengthen",
            reason: "Wardrobe includes warm tones but boot collection lacks warm footwear",
            lane: { color: "dark_brown" }, // Suggest safest warm entry point
        };
    }

    return null;
}

/**
 * Evaluate the deterministic rule tree
 * Rules are evaluated in strict order; first match wins
 * 
 * Order:
 * 1. Consolidate (redundancy)
 * 2. Extreme Clustering (>85% dominant)
 * 3. Context Misalignment (formality vs environment)
 * 4. Minor Palette Gap (warm tones)
 * 5. None (no issues)
 */
export function evaluateRules(profile: Profile, metrics: ProfileMetrics): FlagResult {
    // Rule 1: Consolidate
    const consolidateResult = checkConsolidate(profile);
    if (consolidateResult) return consolidateResult;

    // Rule 2: Extreme Clustering
    const clusteringResult = checkExtremeClustering(metrics);
    if (clusteringResult) return clusteringResult;

    // Rule 3: Context Misalignment
    const misalignmentResult = checkContextMisalignment(profile, metrics);
    if (misalignmentResult) return misalignmentResult;

    // Rule 4: Minor Palette Gap
    const paletteResult = checkPaletteGap(profile);
    if (paletteResult) return paletteResult;

    // Rule 5: None
    return {
        type: "none",
        reason: "No structural adjustments needed",
    };
}
