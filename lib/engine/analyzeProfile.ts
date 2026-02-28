// lib/engine/analyzeProfile.ts

import type { Profile } from "../schema/types";
import type { AnalysisResult } from "./types";
import { calculateMetrics } from "./calculateMetrics";
import { evaluateRules } from "./detectFlags";
import { buildOutput } from "./buildOutput";

/**
 * Primary entry point for profile analysis
 * 
 * Contract:
 * - Pure function
 * - Deterministic (identical input → identical output)
 * - Side-effect free
 * - No async logic
 * - No external calls
 */
export function analyzeProfile(profile: Profile): AnalysisResult {
    // Step 1: Calculate all weighted metrics
    const metrics = calculateMetrics(profile);

    // Step 2: Evaluate deterministic rule tree
    const flag = evaluateRules(profile, metrics);

    // Step 3: Build structured output
    const result = buildOutput(profile, metrics, flag);

    return result;
}

// Re-export types and utilities for convenience
export type { ProfileMetrics } from "./calculateMetrics";
export type { FlagResult } from "./detectFlags";
export { calculateMetrics } from "./calculateMetrics";
export { evaluateRules } from "./detectFlags";
export { detectRedundancy, hasRedundancy, getRedundancyCount } from "./detectRedundancy";
