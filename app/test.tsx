import { analyzeProfile } from "@/lib/engine/analyzeProfile";
import type { Profile } from "@/lib/schema/types";

// Case 1: One black tall heavy_lug core boot (should NOT trigger redundancy)
const case1Profile: Profile = {
  version: "1.0.0",
  context: {
    primaryEnvironments: ["rugged_heritage"],
  },
  wardrobe: {
    tops: ["black", "navy"],
    bottoms: ["dark_denim", "black_denim"],
  },
  items: [
    {
      id: "1",
      displayName: "Single Black Logger",
      category: "boots",
      attributes: {
        color: "black",
        leatherType: "smooth",
        soleType: "heavy_lug",
        height: "tall",
        weight: "heavy",
        formality: 1,
      },
      rotation: "core",
    },
  ],
};

// Case 2: Two identical black tall heavy_lug core boots (SHOULD trigger redundancy)
const case2Profile: Profile = {
  version: "1.0.0",
  context: {
    primaryEnvironments: ["rugged_heritage"],
  },
  wardrobe: {
    tops: ["black", "navy"],
    bottoms: ["dark_denim", "black_denim"],
  },
  items: [
    {
      id: "1",
      displayName: "Black Logger A",
      category: "boots",
      attributes: {
        color: "black",
        leatherType: "smooth",
        soleType: "heavy_lug",
        height: "tall",
        weight: "heavy",
        formality: 1,
      },
      rotation: "core",
    },
    {
      id: "2",
      displayName: "Black Logger B",
      category: "boots",
      attributes: {
        color: "black",
        leatherType: "smooth",
        soleType: "heavy_lug",
        height: "tall",
        weight: "heavy",
        formality: 1,
      },
      rotation: "core",
    },
  ],
};

export default function Home() {
  const result1 = analyzeProfile(case1Profile);
  const result2 = analyzeProfile(case2Profile);

  const case1Pass = result1.suggestion.type !== "consolidate";
  const case2Pass = result2.suggestion.type === "consolidate";

  return (
    <div className="min-h-screen bg-zinc-900 p-8 font-mono text-sm text-zinc-100">
      <h1 className="mb-8 text-2xl font-bold text-white">BootLanes Engine Test</h1>

      {/* Case 1 */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">
          Case 1: Single boot (expect NO redundancy){" "}
          <span className={case1Pass ? "text-emerald-400" : "text-red-400"}>
            {case1Pass ? "PASS ✓" : "FAIL ✗"}
          </span>
        </h2>
        <p className="mb-2 text-zinc-400">
          Suggestion type: <span className="text-white">{result1.suggestion.type}</span>
        </p>
        <pre className="overflow-auto rounded bg-zinc-800 p-4 max-h-64">
          {JSON.stringify(result1, null, 2)}
        </pre>
      </section>

      {/* Case 2 */}
      <section className="mb-8">
        <h2 className="mb-2 text-lg font-semibold">
          Case 2: Two identical boots (expect CONSOLIDATE){" "}
          <span className={case2Pass ? "text-emerald-400" : "text-red-400"}>
            {case2Pass ? "PASS ✓" : "FAIL ✗"}
          </span>
        </h2>
        <p className="mb-2 text-zinc-400">
          Suggestion type: <span className="text-white">{result2.suggestion.type}</span>
        </p>
        <pre className="overflow-auto rounded bg-zinc-800 p-4 max-h-64">
          {JSON.stringify(result2, null, 2)}
        </pre>
      </section>

      {/* Summary */}
      <section className="rounded border border-zinc-700 p-4">
        <h2 className="mb-2 text-lg font-semibold text-white">Summary</h2>
        <p>
          Engine Status:{" "}
          <span className={case1Pass && case2Pass ? "text-emerald-400 font-bold" : "text-red-400 font-bold"}>
            {case1Pass && case2Pass ? "ALL TESTS PASS ✓" : "TESTS FAILING ✗"}
          </span>
        </p>
      </section>
    </div>
  );
}
