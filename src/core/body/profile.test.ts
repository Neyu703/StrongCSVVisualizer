import { describe, expect, it } from "vitest";
import { unavailableStorage } from "../storage";
import type { StorageLike } from "../storage";
import { BODY_PROFILE_KEY, defaultProfile, loadProfile, saveProfile } from "./profile";

/** In-memory storage. */
function createStorage(): StorageLike {
    const data = new Map<string, string>();
    return {
        getItem: (key) => data.get(key) ?? null,
        setItem: (key, value) => {
            data.set(key, value);
        },
        removeItem: (key) => {
            data.delete(key);
        },
    };
}

const FALLBACK = defaultProfile("male", "metric");

describe("body profile", () => {
    it("starts from typical values for the given sex and units", () => {
        expect(FALLBACK).toMatchObject({ sex: "male", heightCm: 180, weightKg: 80, units: "metric", energyUnit: "kcal" });
        expect(defaultProfile("female", "imperial")).toMatchObject({ sex: "female", heightCm: 166, units: "imperial" });
        expect(loadProfile(createStorage(), FALLBACK)).toEqual(FALLBACK);
    });

    it("round-trips a changed profile, including empty fields", () => {
        const storage = createStorage();
        const changed = { ...FALLBACK, sex: "female" as const, weightKg: null, goalWeightKg: 70, activity: "extreme" as const, proteinPerKg: 2 };
        saveProfile(storage, changed);
        expect(loadProfile(storage, FALLBACK)).toEqual(changed);
    });

    it("ignores invalid fields individually", () => {
        const storage = createStorage();
        storage.setItem(
            BODY_PROFILE_KEY,
            JSON.stringify({ age: -3, heightCm: "tall", weightKg: 70, units: "furlongs", bmrFormula: "katch", fatShare: 0.9, kgPerWeek: 1 }),
        );
        expect(loadProfile(storage, FALLBACK)).toEqual({ ...FALLBACK, weightKg: 70, bmrFormula: "katch", kgPerWeek: 1 });
    });

    it.each(["not json", "null", "42"])("falls back to defaults for %s", (raw) => {
        const storage = createStorage();
        storage.setItem(BODY_PROFILE_KEY, raw);
        expect(loadProfile(storage, FALLBACK)).toEqual(FALLBACK);
    });

    it("ignores write failures and works without localStorage", () => {
        expect(() => saveProfile(unavailableStorage, FALLBACK)).not.toThrow();
        expect(loadProfile(unavailableStorage, FALLBACK)).toEqual(FALLBACK);
    });
});
