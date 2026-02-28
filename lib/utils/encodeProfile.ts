// lib/utils/encodeProfile.ts

import type { Profile } from "../schema/types";
import { compressToEncodedURIComponent } from "lz-string";

/**
 * Encode a profile to a URL-safe string
 * 
 * Flow:
 * 1. JSON.stringify(profile)
 * 2. Compress with LZ-string
 * 3. Returns URI-encoded string (already encoded by lz-string)
 */
export function encodeProfile(profile: Profile): string {
    const json = JSON.stringify(profile);
    const compressed = compressToEncodedURIComponent(json);
    return compressed;
}

/**
 * Build full shareable URL with encoded profile
 */
export function buildShareableUrl(profile: Profile, baseUrl?: string): string {
    const encoded = encodeProfile(profile);
    const base = baseUrl || (typeof window !== "undefined" ? window.location.origin : "");
    return `${base}/?p=${encoded}`;
}
