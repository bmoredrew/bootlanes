"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { analyzeProfile } from "@/lib/engine/analyzeProfile";
import { encodeProfile } from "@/lib/utils/encodeProfile";
import { decodeProfile, createEmptyProfile } from "@/lib/utils/decodeProfile";
import { formatLabel } from "@/lib/utils/formatLabel";
import { createEmptyBoot } from "@/lib/utils/createEmptyBoot";
import {
  ENVIRONMENTS,
  TOP_COLORS,
  BOTTOM_TYPES,
  BOOT_COLORS,
  LEATHER_TYPES,
  SOLE_TYPES,
  HEIGHTS,
  WEIGHTS,
  ROTATIONS,
} from "@/lib/schema/types";
import type {
  Profile,
  WardrobeItem,
  Environment,
  TopColor,
  BottomType,
  BootColor,
  LeatherType,
  SoleType,
  Height,
  Weight,
  Rotation,
} from "@/lib/schema/types";
import type { AnalysisResult } from "@/lib/engine/types";

// ============================================
// Main Component
// ============================================
export default function Home() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ----------------------------------------
  // State
  // ----------------------------------------
  const [profile, setProfile] = useState<Profile>(createEmptyProfile());
  const [decodeError, setDecodeError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [darkMode, setDarkMode] = useState(true); // Default dark
  const [expandedBoots, setExpandedBoots] = useState<Set<string>>(new Set());

  // ----------------------------------------
  // Initialize from URL on mount
  // ----------------------------------------
  useEffect(() => {
    const encodedParam = searchParams.get("p");
    if (encodedParam) {
      try {
        const decoded = decodeProfile(encodedParam);
        setProfile(decoded);
        setDecodeError(null);
      } catch (e) {
        setDecodeError(e instanceof Error ? e.message : "Failed to decode profile");
        setProfile(createEmptyProfile());
      }
    }
    setInitialized(true);
  }, [searchParams]);

  // ----------------------------------------
  // Dark mode: initialize from localStorage + apply class
  // ----------------------------------------
  useEffect(() => {
    const stored = localStorage.getItem("bootlanes-theme");
    if (stored === "light") {
      setDarkMode(false);
    } else {
      setDarkMode(true); // default dark
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("bootlanes-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("bootlanes-theme", "light");
    }
  }, [darkMode]);

  // ----------------------------------------
  // Handlers: Profile Actions
  // ----------------------------------------
  const handleGenerateLink = () => {
    const encoded = encodeProfile(profile);
    const url = `${window.location.origin}/?p=${encoded}`;
    window.history.replaceState(null, "", url);
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setProfile(createEmptyProfile());
    setAnalysisResult(null);
    window.history.replaceState(null, "", "/");
  };

  const handleAnalyze = () => {
    if (profile.items.length === 0) {
      alert("Add at least one boot to analyze.");
      return;
    }
    const result = analyzeProfile(profile);
    setAnalysisResult(result);
  };

  // ----------------------------------------
  // Handlers: Context (Environments)
  // ----------------------------------------
  const toggleEnvironment = (env: Environment) => {
    setProfile((prev) => {
      const current = prev.context.primaryEnvironments;
      if (current.includes(env)) {
        return {
          ...prev,
          context: {
            ...prev.context,
            primaryEnvironments: current.filter((e) => e !== env),
          },
        };
      } else if (current.length < 2) {
        return {
          ...prev,
          context: {
            ...prev.context,
            primaryEnvironments: [...current, env],
          },
        };
      }
      return prev; // Max 2 reached
    });
  };

  // ----------------------------------------
  // Handlers: Wardrobe (Tops/Bottoms)
  // ----------------------------------------
  const toggleTop = (top: TopColor) => {
    setProfile((prev) => {
      const current = prev.wardrobe.tops;
      if (current.includes(top)) {
        return {
          ...prev,
          wardrobe: { ...prev.wardrobe, tops: current.filter((t) => t !== top) },
        };
      }
      return {
        ...prev,
        wardrobe: { ...prev.wardrobe, tops: [...current, top] },
      };
    });
  };

  const toggleBottom = (bottom: BottomType) => {
    setProfile((prev) => {
      const current = prev.wardrobe.bottoms;
      if (current.includes(bottom)) {
        return {
          ...prev,
          wardrobe: { ...prev.wardrobe, bottoms: current.filter((b) => b !== bottom) },
        };
      }
      return {
        ...prev,
        wardrobe: { ...prev.wardrobe, bottoms: [...current, bottom] },
      };
    });
  };

  // ----------------------------------------
  // Handlers: Boots CRUD
  // ----------------------------------------
  const addBoot = () => {
    const newBoot = createEmptyBoot();
    setProfile((prev) => ({
      ...prev,
      items: [...prev.items, newBoot],
    }));
    // Auto-expand new boot
    setExpandedBoots((prev) => new Set(prev).add(newBoot.id));
  };

  const removeBoot = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }));
    // Clean up expanded state
    setExpandedBoots((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleBootExpanded = (id: string) => {
    setExpandedBoots((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const updateBoot = (id: string, updates: Partial<WardrobeItem>) => {
    setProfile((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const updateBootAttribute = (
    id: string,
    key: keyof WardrobeItem["attributes"],
    value: string | number | undefined
  ) => {
    setProfile((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id !== id) return item;
        const newAttributes = { ...item.attributes };
        if (value === undefined) {
          delete (newAttributes as Record<string, unknown>)[key];
        } else {
          (newAttributes as Record<string, unknown>)[key] = value;
        }
        return { ...item, attributes: newAttributes };
      }),
    }));
  };

  // ----------------------------------------
  // Render: Loading state
  // ----------------------------------------
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[var(--background)] p-8 font-mono text-[var(--foreground)]">
        <p className="text-[var(--muted)]">Loading...</p>
      </div>
    );
  }

  // ----------------------------------------
  // Render: Main UI
  // ----------------------------------------
  return (
    <div className="min-h-screen bg-[var(--background)] p-6 font-mono text-sm text-[var(--foreground)] md:p-8">
      {/* Header */}
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">BootLanes</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded bg-[var(--surface)] px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--surface-alt)]"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button
            onClick={handleGenerateLink}
            className="rounded bg-[var(--surface)] px-3 py-1.5 text-[var(--foreground)] hover:bg-[var(--surface-alt)]"
          >
            {copied ? "Copied! ✓" : "Share Link"}
          </button>
          <button
            onClick={handleReset}
            className="rounded bg-[var(--surface-alt)] px-3 py-1.5 text-[var(--muted)] hover:bg-[var(--surface)]"
          >
            Reset
          </button>
        </div>
      </header>

      {/* Decode Error Banner */}
      {decodeError && (
        <div className="mb-6 rounded border border-amber-700 bg-amber-900/20 p-3 text-amber-300">
          ⚠ Could not load profile from URL: {decodeError}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* ============================== */}
        {/* LEFT COLUMN: Input Sections */}
        {/* ============================== */}
        <div className="space-y-8">
          {/* Section A: Context */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
              Context
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                (select up to 2)
              </span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {ENVIRONMENTS.map((env) => {
                const selected = profile.context.primaryEnvironments.includes(env);
                const disabled =
                  !selected && profile.context.primaryEnvironments.length >= 2;
                return (
                  <button
                    key={env}
                    onClick={() => toggleEnvironment(env)}
                    disabled={disabled}
                    className={`rounded px-3 py-1.5 text-xs transition ${selected
                      ? "bg-[var(--accent)] text-white"
                      : disabled
                        ? "cursor-not-allowed bg-[var(--surface-alt)] text-[var(--muted)]"
                        : "bg-[var(--surface-alt)] text-[var(--foreground)] hover:bg-[var(--surface)]"
                      }`}
                  >
                    {formatLabel(env)}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section B: Wardrobe Palette */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
              Wardrobe Palette
            </h2>

            {/* Tops */}
            <div className="mb-4">
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Tops
              </h3>
              <div className="flex flex-wrap gap-2">
                {TOP_COLORS.map((top) => {
                  const selected = profile.wardrobe.tops.includes(top);
                  return (
                    <label
                      key={top}
                      className={`cursor-pointer rounded px-2.5 py-1 text-xs transition ${selected
                        ? "bg-blue-600 text-white"
                        : "bg-[var(--surface-alt)] text-[var(--muted)] hover:bg-[var(--surface)]"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleTop(top)}
                        className="sr-only"
                      />
                      {formatLabel(top)}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottoms */}
            <div>
              <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                Bottoms
              </h3>
              <div className="flex flex-wrap gap-2">
                {BOTTOM_TYPES.map((bottom) => {
                  const selected = profile.wardrobe.bottoms.includes(bottom);
                  return (
                    <label
                      key={bottom}
                      className={`cursor-pointer rounded px-2.5 py-1 text-xs transition ${selected
                        ? "bg-blue-600 text-white"
                        : "bg-[var(--surface-alt)] text-[var(--muted)] hover:bg-[var(--surface)]"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleBottom(bottom)}
                        className="sr-only"
                      />
                      {formatLabel(bottom)}
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section C: Boots List */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">
                Boots
                <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                  ({profile.items.length})
                </span>
              </h2>
              <button
                onClick={addBoot}
                className="rounded bg-[var(--accent)] px-3 py-1 text-xs text-white hover:bg-[var(--accent-hover)]"
              >
                + Add Boot
              </button>
            </div>

            {profile.items.length === 0 ? (
              <p className="text-[var(--muted)]">No boots added yet.</p>
            ) : (
              <div className="space-y-4">
                {profile.items.map((boot, index) => {
                  const isExpanded = expandedBoots.has(boot.id);
                  const bootSummary = boot.displayName || `${formatLabel(boot.attributes.color)} ${formatLabel(boot.attributes.leatherType)}`;
                  return (
                    <div
                      key={boot.id}
                      className="rounded border border-[var(--border)] bg-[var(--surface)] overflow-hidden"
                    >
                      {/* Boot Header - Clickable */}
                      <div
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[var(--surface-alt)] transition"
                        onClick={() => toggleBootExpanded(boot.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-[var(--muted)]">{isExpanded ? "▼" : "▶"}</span>
                          <div>
                            <span className="text-xs text-[var(--muted)]">Boot #{index + 1}</span>
                            {!isExpanded && (
                              <p className="text-sm text-[var(--foreground)]">{bootSummary}</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); removeBoot(boot.id); }}
                          className="text-xs text-red-500 hover:text-red-400"
                        >
                          Remove
                        </button>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="px-4 pb-4">
                          {/* Display Name */}
                          <div className="mb-3">
                            <input
                              type="text"
                              placeholder="Display name (optional)"
                              value={boot.displayName || ""}
                              onChange={(e) =>
                                updateBoot(boot.id, { displayName: e.target.value })
                              }
                              className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                            />
                          </div>

                          {/* Attributes Grid */}
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            {/* Color */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">Color</label>
                              <select
                                value={boot.attributes.color}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "color", e.target.value)
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                {BOOT_COLORS.map((c) => (
                                  <option key={c} value={c}>
                                    {formatLabel(c)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Leather Type */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">Leather</label>
                              <select
                                value={boot.attributes.leatherType}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "leatherType", e.target.value)
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                {LEATHER_TYPES.map((l) => (
                                  <option key={l} value={l}>
                                    {formatLabel(l)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Secondary Color (Two-tone) */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">2nd Color</label>
                              <select
                                value={boot.attributes.secondaryColor ?? ""}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "secondaryColor", e.target.value || undefined)
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                <option value="">None</option>
                                {BOOT_COLORS.map((c) => (
                                  <option key={c} value={c}>
                                    {formatLabel(c)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Secondary Leather (Two-tone) - only show if 2nd color selected */}
                            {boot.attributes.secondaryColor && (
                              <div>
                                <label className="mb-1 block text-xs text-[var(--muted)]">2nd Leather</label>
                                <select
                                  value={boot.attributes.secondaryLeatherType ?? ""}
                                  onChange={(e) =>
                                    updateBootAttribute(boot.id, "secondaryLeatherType", e.target.value || undefined)
                                  }
                                  className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                                >
                                  <option value="">None</option>
                                  {LEATHER_TYPES.map((l) => (
                                    <option key={l} value={l}>
                                      {formatLabel(l)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {/* Sole Type */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">Sole</label>
                              <select
                                value={boot.attributes.soleType}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "soleType", e.target.value)
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                {SOLE_TYPES.map((s) => (
                                  <option key={s} value={s}>
                                    {formatLabel(s)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Height */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">Height</label>
                              <select
                                value={boot.attributes.height}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "height", e.target.value)
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                <option value="low">Low (4-5&quot;)</option>
                                <option value="mid">Mid (6&quot;)</option>
                                <option value="tall">Tall (8-10&quot;)</option>
                              </select>
                            </div>

                            {/* Weight */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">Weight</label>
                              <select
                                value={boot.attributes.weight}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "weight", e.target.value)
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                {WEIGHTS.map((w) => (
                                  <option key={w} value={w}>
                                    {formatLabel(w)}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Formality */}
                            <div>
                              <label className="mb-1 block text-xs text-[var(--muted)]">
                                Formality
                              </label>
                              <select
                                value={boot.attributes.formality}
                                onChange={(e) =>
                                  updateBootAttribute(boot.id, "formality", parseInt(e.target.value))
                                }
                                className="w-full rounded bg-[var(--surface-alt)] px-2 py-1.5 text-xs text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--border)]"
                              >
                                <option value={1}>1 — Work / Rugged</option>
                                <option value={2}>2 — Heritage Rugged</option>
                                <option value={3}>3 — Neutral Everyday</option>
                                <option value={4}>4 — Refined Casual</option>
                                <option value={5}>5 — Dress-leaning</option>
                              </select>
                            </div>
                          </div>

                          {/* Rotation */}
                          <div className="mt-3">
                            <label className="mb-1 block text-xs text-[var(--muted)]">Rotation</label>
                            <div className="flex gap-4">
                              {ROTATIONS.map((r) => (
                                <label key={r} className="flex cursor-pointer items-center gap-1.5">
                                  <input
                                    type="radio"
                                    name={`rotation-${boot.id}`}
                                    value={r}
                                    checked={boot.rotation === r}
                                    onChange={() => updateBoot(boot.id, { rotation: r })}
                                    className="accent-[var(--accent)]"
                                  />
                                  <span className="text-xs text-[var(--foreground)]">{formatLabel(r)}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={profile.items.length === 0}
            className={`w-full rounded py-3 font-medium transition ${profile.items.length === 0
              ? "cursor-not-allowed bg-[var(--surface-alt)] text-[var(--muted)]"
              : "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)]"
              }`}
          >
            Analyze Profile
          </button>
        </div>

        {/* ============================== */}
        {/* RIGHT COLUMN: Output */}
        {/* ============================== */}
        <div>
          {analysisResult ? (
            <div className="sticky top-8 space-y-6">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Analysis</h2>

              {/* Identity */}
              <section>
                <h3 className="mb-1 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Identity
                </h3>
                <p className="text-lg text-[var(--foreground)]">{analysisResult.identity}</p>
              </section>

              {/* Structure */}
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Structure
                </h3>
                <ul className="space-y-1">
                  {analysisResult.structure.map((line, i) => (
                    <li key={i} className="text-[var(--foreground)]">
                      {line}
                    </li>
                  ))}
                </ul>
              </section>

              {/* Observations */}
              <section>
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Observations
                </h3>
                {analysisResult.observations.length > 0 ? (
                  <ul className="space-y-1">
                    {analysisResult.observations.map((obs, i) => (
                      <li key={i} className="text-[var(--muted)]">
                        • {obs}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--muted)]">No notable observations.</p>
                )}
              </section>

              {/* Suggestion */}
              <section className="rounded border border-[var(--border)] bg-[var(--surface-alt)] p-4">
                <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
                  Suggestion
                </h3>
                <p className="mb-1 text-xs">
                  <span className="text-[var(--muted)]">Type: </span>
                  <span
                    className={
                      analysisResult.suggestion.type === "none"
                        ? "text-emerald-500"
                        : analysisResult.suggestion.type === "consolidate"
                          ? "text-amber-500"
                          : "text-blue-500"
                    }
                  >
                    {analysisResult.suggestion.type}
                  </span>
                </p>
                <p className="text-[var(--foreground)]">{analysisResult.suggestion.message}</p>
              </section>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center rounded border border-dashed border-[var(--border)] text-[var(--muted)]">
              <p>Add boots and click &quot;Analyze Profile&quot; to see results.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
