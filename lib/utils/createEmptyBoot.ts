// lib/utils/createEmptyBoot.ts

import type { WardrobeItem } from "../schema/types";
import { generateId } from "./generateId";

/**
 * Create a new empty boot with sensible defaults
 */
export function createEmptyBoot(): WardrobeItem {
    return {
        id: generateId(),
        displayName: "",
        category: "boots",
        attributes: {
            color: "black",
            leatherType: "smooth",
            soleType: "mid_lug",
            height: "mid",
            weight: "medium",
            formality: 3,
        },
        rotation: "core",
    };
}
