import { describe, expect, it } from "vitest";
import { clearLibrary, loadLibrary, saveLibrary, STORAGE_KEY, unavailableStorage } from "./storage";
import type { StorageLike } from "./storage";
import { makeSet } from "./testing";
import type { Library } from "./types";

/** In-memory storage that can be told to reject writes. */
function createStorage(failOnWrite = false): StorageLike & { data: Map<string, string> } {
    const data = new Map<string, string>();
    return {
        data,
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
            if (failOnWrite) {
                throw new DOMException("full", "QuotaExceededError");
            }
            data.set(key, value);
        },
        removeItem: (key) => {
            data.delete(key);
        },
    };
}

const LIBRARY: Library = { unit: "kg", sets: [makeSet()] };

describe("storage", () => {
    it("round-trips a library and clears it", () => {
        const storage = createStorage();
        saveLibrary(storage, LIBRARY);
        expect(loadLibrary(storage)).toEqual(LIBRARY);
        clearLibrary(storage);
        expect(loadLibrary(storage)).toBeNull();
    });

    it("accepts pound libraries", () => {
        const storage = createStorage();
        saveLibrary(storage, { unit: "lb", sets: [] });
        expect(loadLibrary(storage)).toEqual({ unit: "lb", sets: [] });
    });

    it.each(["not json", "null", '{"unit":"stone","sets":[]}', '{"unit":"kg","sets":"x"}', "[]"])(
        "treats corrupt data %s as empty",
        (raw) => {
            const storage = createStorage();
            storage.setItem(STORAGE_KEY, raw);
            expect(loadLibrary(storage)).toBeNull();
        },
    );

    it("keeps old data and reports a German error when the write fails", () => {
        const storage = createStorage();
        saveLibrary(storage, LIBRARY);
        const before = storage.data.get(STORAGE_KEY);
        const failing = { ...storage, setItem: createStorage(true).setItem };
        expect(() => saveLibrary(failing, { unit: "kg", sets: [] })).toThrow("Speichern fehlgeschlagen");
        expect(storage.data.get(STORAGE_KEY)).toBe(before);
    });

    it("behaves as empty and read-only when localStorage is unavailable", () => {
        expect(loadLibrary(unavailableStorage)).toBeNull();
        expect(() => saveLibrary(unavailableStorage, LIBRARY)).toThrow("Speichern fehlgeschlagen");
        expect(() => clearLibrary(unavailableStorage)).not.toThrow();
    });

    it("treats a throwing getItem as empty", () => {
        const throwing: StorageLike = {
            ...unavailableStorage,
            getItem: () => {
                throw new Error("denied");
            },
        };
        expect(loadLibrary(throwing)).toBeNull();
    });
});
