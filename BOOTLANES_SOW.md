# BootLanes --- Statement of Work (SOW)

## 1. Project Overview

BootLanes is a stateless, deterministic wardrobe audit tool focused
initially on boots.

The tool analyzes a structured profile input and outputs:

-   Identity summary
-   Structural observations
-   Redundancy detection
-   A single deterministic suggestion
-   Adjacent-only bridge logic
-   Cohesion-first philosophy

The system must be:

-   Stateless (URL-encoded profiles, no database)
-   Deterministic (no AI randomness)
-   Pure-function engine
-   Expandable to full wardrobe categories in future versions

This project prioritizes cohesion over completeness. It evaluates
whether a collection is intentional, coherent, and free of unnecessary
overlap.

------------------------------------------------------------------------

## 2. Technical Stack

-   Next.js 16.x (App Router)
-   TypeScript
-   Tailwind CSS 4
-   Stateless URL encoding (LZ-string + encodeURIComponent)
-   No backend
-   No authentication
-   No database (v1)
-   Deployment target: Vercel

------------------------------------------------------------------------

## 3. Core Philosophy

BootLanes evaluates:

-   Cohesion over completeness
-   Lived usage over theoretical coverage
-   Identity strength over diversification
-   Adjacent expansion over radical change

The engine must:

-   Respect strong identity
-   Flag redundancy first
-   Suggest only one structural adjustment
-   Avoid gamification (no scoring system in v1)

------------------------------------------------------------------------

## 4. Architecture

### Directory Structure

/app\
page.tsx

/lib\
/schema\
types.ts\
constants.ts\
/engine\
analyzeProfile.ts\
calculateMetrics.ts\
detectFlags.ts\
detectRedundancy.ts\
buildOutput.ts\
/utils\
encodeProfile.ts\
decodeProfile.ts

Separation of concerns is mandatory:

-   Schema layer: types and enums only
-   Engine layer: deterministic logic only
-   UI layer: rendering only
-   No engine logic inside React components

------------------------------------------------------------------------

## 5. Data Model

### Profile Structure

``` ts
interface Profile {
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
```

### Wardrobe Item (Boot v1)

``` ts
interface WardrobeItem {
  id: string;
  displayName?: string;
  category: "boots";
  attributes: BootAttributes;
  rotation: Rotation;
}
```

### Boot Attributes

``` ts
interface BootAttributes {
  color: BootColor;
  leatherType: LeatherType;
  soleType: SoleType;
  height: Height;
  weight: Weight;
  formality: number; // 1–5
}
```

### Rotation Weighting

-   core = 1.0
-   regular = 0.7
-   occasional = 0.3

Weighting is internal and invisible in UI.

------------------------------------------------------------------------

## 6. Engine Contract

Primary entry point:

``` ts
analyzeProfile(profile: Profile): AnalysisResult
```

Must be:

-   Pure
-   Deterministic
-   Side-effect free
-   No async logic
-   No external calls

Identical input must always produce identical output.

------------------------------------------------------------------------

## 7. Metrics Calculation Requirements

Engine must compute:

-   Weighted color distribution
-   Weighted height distribution
-   Weighted sole distribution
-   Weighted average formality
-   Dominant axis per dimension
-   Core-only redundancy count

All metrics are derived at runtime.

------------------------------------------------------------------------

## 8. Redundancy Detection Rules

Within core rotation only:

If two boots match on:

-   Same color bucket
-   Same height bucket
-   Same sole bucket
-   Formality difference ≤ 0.5

Count as overlap.

If overlap ≥ 1: → Suggestion type = "consolidate" → Stop further rule
evaluation

Redundancy has highest priority.

------------------------------------------------------------------------

## 9. Deterministic Rule Tree

Rules must be evaluated in this order:

### Rule 1 --- Consolidate

If redundancy detected → return "consolidate"

### Rule 2 --- Extreme Clustering

If dominant dimension exceeds 85% weighted share → return "bridge"

### Rule 3 --- Context Misalignment

Map environment to expected formality range:

-   rugged_heritage → 1--2
-   workwear_trades → 1--2
-   business_casual → 2--4
-   creative_casual → 2--4
-   executive_formal → 4--5
-   mixed → 1--5

If weighted average formality outside range ±1 → return "bridge"

### Rule 4 --- Minor Palette Gap

If wardrobe contains warm tones but no adjacent footwear tone → return
"strengthen"

### Rule 5 --- None

If no rules triggered → return "none"

Only one suggestion may be returned.

------------------------------------------------------------------------

## 10. Adjacent-Only Bridge Logic

Bridge suggestions must move only one adjacent step.

### Color Adjacency

black → dark_brown → mid_brown → light_tan\
burgundy adjacent to black and dark_brown\
grey adjacent to black

No multi-step jumps allowed.

### Height Adjacency

tall ↔ mid ↔ low

### Sole Order

heavy_lug → mid_lug → wedge → leather_minimal

### Formality

Scale 1--5\
Bridge may only move ±1

------------------------------------------------------------------------

## 11. Output Structure

``` ts
interface AnalysisResult {
  identity: string;
  structure: string[];
  observations: string[];
  suggestion: {
    type: "consolidate" | "bridge" | "strengthen" | "none";
    message: string;
    lane?: SuggestedLane;
  };
}
```

Output must include:

-   Identity statement
-   Structural summary (3--4 lines max)
-   Observations
-   One suggestion only

Tone must be:

-   Analytical
-   Calm
-   Structured
-   Non-judgmental

------------------------------------------------------------------------

## 12. Shareable URL Requirement

Profiles must be encoded into a URL parameter:

bootlanes.com/?p=ENCODED_STRING

Implementation flow:

1.  JSON.stringify(profile)
2.  Compress (LZ-string)
3.  encodeURIComponent
4.  Append to URL

No backend storage in v1.

------------------------------------------------------------------------

## 13. Non-Goals (v1)

-   No scoring system
-   No gamification
-   No AI-generated suggestions
-   No database
-   No authentication
-   No product recommendations

------------------------------------------------------------------------

## 14. Future Expansion (Not in v1)

-   Additional categories (jackets, pants, shirts)
-   Optional persistence
-   Account system
-   Visual distribution charts
-   Affiliate integration

Engine must remain extensible without breaking schema contract.

------------------------------------------------------------------------

## 15. Success Criteria

BootLanes v1 is considered complete when:

-   Engine produces deterministic results
-   Redundancy is correctly detected
-   Adjacent-only bridge logic functions
-   URL encoding/decoding works reliably
-   UI renders structured output cleanly
-   No hidden state exists

End of SOW.
