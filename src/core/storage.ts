import type { Library } from "./types";

/** The subset of the Web Storage API that persistence needs. */
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}

export const STORAGE_KEY = "strong-pro-library-v1";

const SAVE_ERROR =
    "Speichern fehlgeschlagen – der Browser-Speicher ist voll oder blockiert. Deine bisherigen Daten sind unverändert.";

/** Stand-in when the browser denies access to localStorage: nothing is stored, saving fails loudly. */
export const unavailableStorage: StorageLike = {
    getItem: () => null,
    setItem: () => {
        throw new Error("localStorage unavailable");
    },
    removeItem: () => {},
};

/**
 * Checks that parsed JSON has the shape of a stored library.
 * @param value parsed JSON
 * @returns true when it has a unit and a sets array
 */
function isLibrary(value: unknown): value is Library {
    const candidate = value as Partial<Library> | null;
    return (candidate?.unit === "kg" || candidate?.unit === "lb") && Array.isArray(candidate.sets);
}

/**
 * Reads and validates a JSON value; missing, unreadable or invalid data counts as absent.
 * @param storage browser storage
 * @param key storage key
 * @param isValid type guard for the expected shape
 * @returns the stored value, or null when nothing usable is stored
 */
export function loadJson<Value>(
    storage: StorageLike,
    key: string,
    isValid: (value: unknown) => value is Value,
): Value | null {
    try {
        const raw = storage.getItem(key);
        const parsed: unknown = raw === null ? null : JSON.parse(raw);
        return isValid(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Reads the stored library; corrupt or missing data counts as empty.
 * @param storage browser storage
 * @returns the library, or null when nothing usable is stored
 */
export function loadLibrary(storage: StorageLike): Library | null {
    return loadJson(storage, STORAGE_KEY, isLibrary);
}

/**
 * Stores the library. On failure the previously stored data stays untouched.
 * @param storage browser storage
 * @param library data to store
 * @throws Error with a German message when the browser refuses (quota, blocked storage)
 */
export function saveLibrary(storage: StorageLike, library: Library): void {
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(library));
    } catch {
        throw new Error(SAVE_ERROR);
    }
}

/**
 * Deletes the stored library.
 * @param storage browser storage
 */
export function clearLibrary(storage: StorageLike): void {
    storage.removeItem(STORAGE_KEY);
}
