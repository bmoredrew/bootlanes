// lib/engine/buildOutput.ts

import type { Profile } from "../schema/types";
import type { AnalysisResult } from "./types";
import type { ProfileMetrics } from "./calculateMetrics";
import type { FlagResult } from "./detectFlags";
import { detectRedundancy } from "./detectRedundancy";

/**
 * Build identity statement based on profile characteristics
 */
function buildIdentity(profile: Profile, metrics: ProfileMetrics): string {
    const parts: string[] = [];

    // Environment descriptor
    const envs = profile.context.primaryEnvironments;
    if (envs.length === 1) {
        const envLabels: Record<string, string> = {
            rugged_heritage: "Heritage-focused",
            workwear_trades: "Workwear-oriented",
            business_casual: "Business casual",
            creative_casual: "Creative casual",
            executive_formal: "Executive formal",
            mixed: "Multi-context",
        };
        parts.push(envLabels[envs[0]] || "Multi-context");
    } else if (envs.length > 1) {
        parts.push("Multi-context");
    }

    // Dominant color character
    const dominantColor = metrics.colorDistribution.dominant;
    if (dominantColor && dominantColor !== "other") {
        const colorLabels: Record<string, string> = {
            black: "with dark foundation",
            dark_brown: "with heritage browns",
            brown: "with classic brown tones",
            mid_brown: "with versatile mid-tones",
            light_tan: "with light casual tones",
            natural: "with natural undyed leather",
            burgundy: "with distinctive burgundy accent",
            grey: "with neutral grey base",
        };
        if (colorLabels[dominantColor]) {
            parts.push(colorLabels[dominantColor]);
        }
    }

    // Formality character
    const avgFormality = metrics.weightedAverageFormality;
    if (avgFormality <= 1.5) {
        parts.push("emphasizing work/rugged utility");
    } else if (avgFormality <= 2.5) {
        parts.push("with heritage rugged character");
    } else if (avgFormality <= 3.5) {
        parts.push("balanced for everyday versatility");
    } else if (avgFormality <= 4.5) {
        parts.push("leaning refined casual");
    } else {
        parts.push("dress-leaning refined");
    }

    // Collection size descriptor
    const itemCount = profile.items.length;
    if (itemCount <= 3) {
        parts.push("in a focused collection");
    } else if (itemCount >= 7) {
        parts.push("across an extensive rotation");
    }

    return parts.join(" ") || "Boot collection under analysis";
}

/**
 * Build structural summary (3-4 lines max)
 */
function buildStructure(profile: Profile, metrics: ProfileMetrics): string[] {
    const structure: string[] = [];

    // Item count and core breakdown
    const coreCount = profile.items.filter((i) => i.rotation === "core").length;
    const regularCount = profile.items.filter((i) => i.rotation === "regular").length;
    const occasionalCount = profile.items.filter((i) => i.rotation === "occasional").length;

    structure.push(
        `${profile.items.length} boots total: ${coreCount} core, ${regularCount} regular, ${occasionalCount} occasional`
    );

    // Dominant attributes
    const dominantColor = metrics.colorDistribution.dominant;
    const colorPct = Math.round(metrics.colorDistribution.dominantPercentage * 100);
    if (dominantColor && colorPct > 40) {
        structure.push(`Color emphasis: ${dominantColor.replace("_", " ")} (${colorPct}%)`);
    }

    const dominantHeight = metrics.heightDistribution.dominant;
    const heightPct = Math.round(metrics.heightDistribution.dominantPercentage * 100);
    if (dominantHeight && heightPct > 40) {
        structure.push(`Height preference: ${dominantHeight} (${heightPct}%)`);
    }

    // Formality summary
    const avgFormality = metrics.weightedAverageFormality;
    structure.push(`Average formality: ${avgFormality.toFixed(1)} / 5`);

    return structure.slice(0, 4); // Max 4 lines
}

/**
 * Build observations list
 */
function buildObservations(profile: Profile, metrics: ProfileMetrics): string[] {
    const observations: string[] = [];

    // Check for redundancy
    const redundantPairs = detectRedundancy(profile.items);
    if (redundantPairs.length > 0) {
        observations.push(
            `${redundantPairs.length} redundant pair${redundantPairs.length > 1 ? "s" : ""} detected in core rotation`
        );
    }

    // Clustering observations
    if (metrics.colorDistribution.dominantPercentage > 0.7) {
        observations.push(
            `Strong color clustering toward ${metrics.colorDistribution.dominant}`
        );
    }

    if (metrics.heightDistribution.dominantPercentage > 0.7) {
        observations.push(
            `Height distribution favors ${metrics.heightDistribution.dominant}`
        );
    }

    if (metrics.soleDistribution.dominantPercentage > 0.7) {
        observations.push(
            `Sole types cluster around ${metrics.soleDistribution.dominant?.replace("_", " ")}`
        );
    }

    // Core balance observation
    const coreRatio = metrics.coreCount / profile.items.length;
    if (coreRatio > 0.7) {
        observations.push("Most boots designated as core rotation");
    } else if (coreRatio < 0.2 && profile.items.length > 2) {
        observations.push("Few boots designated as core rotation");
    }

    // Formality spread
    const formalities = profile.items.map((i) => i.attributes.formality);
    const formalitySpread = Math.max(...formalities) - Math.min(...formalities);
    if (formalitySpread >= 3) {
        observations.push("Wide formality range across collection");
    } else if (formalitySpread <= 1 && profile.items.length > 2) {
        observations.push("Narrow formality range — cohesive but limited versatility");
    }

    return observations;
}

/**
 * Build suggestion message based on flag result
 */
function buildSuggestionMessage(flag: FlagResult): string {
    switch (flag.type) {
        case "consolidate":
            return "Consider consolidating redundant pairs in core rotation before expanding.";

        case "bridge":
            if (flag.lane?.color) {
                return `Consider bridging toward ${flag.lane.color.replace("_", " ")} to balance color distribution.`;
            }
            if (flag.lane?.height) {
                return `Consider adding ${flag.lane.height} height option to balance rotation.`;
            }
            if (flag.lane?.soleType) {
                return `Consider a ${flag.lane.soleType.replace("_", " ")} sole to diversify utility.`;
            }
            if (flag.lane?.formality) {
                return `Consider a boot around formality ${flag.lane.formality} to align with environment.`;
            }
            return "Consider a bridge piece to reduce clustering.";

        case "strengthen":
            if (flag.lane?.color) {
                return `Consider a ${flag.lane.color.replace("_", " ")} option to connect with wardrobe tones.`;
            }
            return "Consider strengthening wardrobe cohesion with an adjacent option.";

        case "none":
            return "Collection is cohesive with no immediate structural gaps.";

        default:
            return "";
    }
}

/**
 * Build complete analysis output
 * Pure function - deterministic output from inputs
 */
export function buildOutput(
    profile: Profile,
    metrics: ProfileMetrics,
    flag: FlagResult
): AnalysisResult {
    return {
        identity: buildIdentity(profile, metrics),
        structure: buildStructure(profile, metrics),
        observations: buildObservations(profile, metrics),
        suggestion: {
            type: flag.type,
            message: buildSuggestionMessage(flag),
            lane: flag.lane,
        },
    };
}
