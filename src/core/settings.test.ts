import { describe, expect, it } from "vitest";
import { DEFAULT_SETTINGS, SETTINGS_KEY, loadSettings, saveSettings } from "./settings";
import { unavailableStorage } from "./storage";
import type { StorageLike } from "./storage";

/** In-memory storage. */
function createStorage(): StorageLike & { data: Map<string, string> } {
    const data = new Map<string, string>();
    return {
        data,
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
            data.set(key, value);
        },
        removeItem: (key) => {
            data.delete(key);
        },
    };
}

describe("settings", () => {
    it("defaults to trend lines on and the male model", () => {
        expect(DEFAULT_SETTINGS).toEqual({ showTrendlines: true, bodyModel: "male" });
        expect(loadSettings(createStorage())).toEqual(DEFAULT_SETTINGS);
    });

    it("round-trips changed settings", () => {
        const storage = createStorage();
        saveSettings(storage, { showTrendlines: false, bodyModel: "female" });
        expect(loadSettings(storage)).toEqual({ showTrendlines: false, bodyModel: "female" });
    });

    it("keeps valid entries of older data and defaults the new ones", () => {
        const storage = createStorage();
        storage.setItem(SETTINGS_KEY, '{"showTrendlines":false}');
        expect(loadSettings(storage)).toEqual({ showTrendlines: false, bodyModel: "male" });
    });

    it("ignores invalid entries individually", () => {
        const storage = createStorage();
        storage.setItem(SETTINGS_KEY, '{"showTrendlines":"yes","bodyModel":"female"}');
        expect(loadSettings(storage)).toEqual({ showTrendlines: true, bodyModel: "female" });
        storage.setItem(SETTINGS_KEY, '{"showTrendlines":false,"bodyModel":"robot"}');
        expect(loadSettings(storage)).toEqual({ showTrendlines: false, bodyModel: "male" });
    });

    it.each(["not json", "null", "[]", "42"])("falls back to defaults for %s", (raw) => {
        const storage = createStorage();
        storage.setItem(SETTINGS_KEY, raw);
        expect(loadSettings(storage)).toEqual(DEFAULT_SETTINGS);
    });

    it("ignores write failures and works without localStorage", () => {
        expect(() => saveSettings(unavailableStorage, DEFAULT_SETTINGS)).not.toThrow();
        expect(loadSettings(unavailableStorage)).toEqual(DEFAULT_SETTINGS);
    });
});
