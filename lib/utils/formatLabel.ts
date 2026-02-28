// lib/utils/formatLabel.ts

/**
 * Format enum values for display (e.g., "dark_brown" -> "Dark Brown")
 */
export function formatLabel(value: string): string {
    return value
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
