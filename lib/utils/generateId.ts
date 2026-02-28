// lib/utils/generateId.ts

/**
 * Generate a stable unique ID for wardrobe items
 */
export function generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return `boot-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
