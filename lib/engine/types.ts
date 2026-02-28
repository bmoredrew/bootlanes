// lib/engine/types.ts

export type SuggestionType = "consolidate" | "bridge" | "strengthen" | "none";

export interface SuggestedLane {
  color?: string;
  height?: string;
  soleType?: string;
  weight?: string;
  formality?: number;
}

export interface AnalysisResult {
  identity: string;
  structure: string[];
  observations: string[];
  suggestion: {
    type: SuggestionType;
    message: string;
    lane?: SuggestedLane;
  };
}