import { unavailableStorage } from "./core/storage";
import type { StorageLike } from "./core/storage";

/**
 * Gets localStorage, which some browser modes make throw on access.
 * @returns the browser storage or a stand-in that stores nothing
 */
export function browserStorage(): StorageLike {
    try {
        return window.localStorage;
    } catch {
        return unavailableStorage;
    }
}
