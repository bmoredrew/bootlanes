// lib/utils/decodeProfile.ts

import type { Profile } from "../schema/types";
import { decompressFromEncodedURIComponent } from "lz-string";
import { CURRENT_PROFILE_VERSION } from "../schema/constants";

/**
 * Error thrown when profile decoding fails
 */
export class ProfileDecodeError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ProfileDecodeError";
    }
}

/**
 * Validate that an object has the expected Profile structure
 */
function isValidProfile(obj: unknown): obj is Profile {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const profile = obj as Record<string, unknown>;

    // Check required top-level fields
    if (typeof profile.version !== "string") return false;
    if (typeof profile.context !== "object" || profile.context === null) return false;
    if (typeof profile.wardrobe !== "object" || profile.wardrobe === null) return false;
    if (!Array.isArray(profile.items)) return false;

    // Check context structure
    const context = profile.context as Record<string, unknown>;
    if (!Array.isArray(context.primaryEnvironments)) return false;

    // Check wardrobe structure
    const wardrobe = profile.wardrobe as Record<string, unknown>;
    if (!Array.isArray(wardrobe.tops)) return false;
    if (!Array.isArray(wardrobe.bottoms)) return false;

    // Check items array has valid structure
    const items = profile.items as Array<Record<string, unknown>>;
    for (const item of items) {
        if (typeof item.id !== "string") return false;
        if (item.category !== "boots") return false;
        if (typeof item.attributes !== "object" || item.attributes === null) return false;
        if (typeof item.rotation !== "string") return false;
    }

    return true;
}

/**
 * Decode a URL-encoded profile string back to Profile object
 * 
 * Flow:
 * 1. Decompress with LZ-string (handles URI decoding)
 * 2. JSON.parse
 * 3. Validate structure
 */
export function decodeProfile(encoded: string): Profile {
    if (!encoded || typeof encoded !== "string") {
        throw new ProfileDecodeError("Invalid encoded string");
    }

    // Decompress
    const json = decompressFromEncodedURIComponent(encoded);

    if (!json) {
        throw new ProfileDecodeError("Failed to decompress profile data");
    }

    // Parse JSON
    let parsed: unknown;
    try {
        parsed = JSON.parse(json);
    } catch {
        throw new ProfileDecodeError("Failed to parse profile JSON");
    }

    // Validate structure
    if (!isValidProfile(parsed)) {
        throw new ProfileDecodeError("Invalid profile structure");
    }

    return parsed;
}

/**
 * Extract and decode profile from URL search params
 */
export function decodeProfileFromUrl(searchParams: URLSearchParams): Profile | null {
    const encoded = searchParams.get("p");

    if (!encoded) {
        return null;
    }

    try {
        return decodeProfile(encoded);
    } catch {
        return null;
    }
}

/**
 * Create an empty default profile
 */
export function createEmptyProfile(): Profile {
    return {
        version: CURRENT_PROFILE_VERSION,
        context: {
            primaryEnvironments: [],
        },
        wardrobe: {
            tops: [],
            bottoms: [],
        },
        items: [],
    };
}
