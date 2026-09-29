import { describe, expect, it } from "vitest";
import { applyImport, mergeWorkouts } from "./library";
import { LEGACY_HEADER, makeSet } from "./testing";

describe("mergeWorkouts", () => {
    it("adds only workouts with unknown start time, keeps identical sets inside a workout", () => {
        const existing = [makeSet({ date: "2024-01-01 10:00:00" })];
        const incoming = [makeSet({ date: "2024-01-01 10:00:00" }), makeSet({ date: "2024-01-03 10:00:00" }), makeSet({ date: "2024-01-03 10:00:00" })];
        const result = mergeWorkouts(existing, incoming);
        expect(result.addedWorkouts).toBe(1);
        expect(result.addedSets).toBe(2);
        expect(result.sets).toHaveLength(3);
    });

    it("sorts merged sets by date and never modifies stored workouts", () => {
        const existing = [makeSet({ date: "2024-01-05 10:00:00", reps: 9 })];
        const incoming = [makeSet({ date: "2024-01-05 10:00:00", reps: 1 }), makeSet({ date: "2024-01-02 10:00:00" })];
        const result = mergeWorkouts(existing, incoming);
        expect(result.sets.map((set) => set.date)).toEqual(["2024-01-02 10:00:00", "2024-01-05 10:00:00"]);
        expect(result.sets[1].reps).toBe(9);
    });

    it("adds nothing for an identical import", () => {
        const sets = [makeSet({ date: "2024-01-01 10:00:00" })];
        expect(mergeWorkouts(sets, sets)).toMatchObject({ addedWorkouts: 0, addedSets: 0 });
    });
});

describe("applyImport", () => {
    const first = `${LEGACY_HEADER}\n2024-01-01 10:00:00,A,1h,Bench,1,50,5,0,0,,,`;
    const second = `${first}\n2024-01-08 10:00:00,B,1h,Bench,1,55,5,0,0,,,`;

    it("creates a library from the first import", () => {
        const result = applyImport(null, first);
        expect(result.library.unit).toBe("kg");
        expect(result.library.sets).toHaveLength(1);
        expect(result.addedWorkouts).toBe(1);
    });

    it("adds only the difference on a newer CSV", () => {
        const stored = applyImport(null, first).library;
        const result = applyImport(stored, second);
        expect(result).toMatchObject({ addedWorkouts: 1, addedSets: 1 });
        expect(result.library.sets).toHaveLength(2);
        expect(applyImport(result.library, second)).toMatchObject({ addedWorkouts: 0, addedSets: 0 });
    });

    it("rejects an empty file, a CSV without sets and a unit mismatch", () => {
        expect(() => applyImport(null, "")).toThrow("keine Strong-CSV");
        expect(() => applyImport(null, `${LEGACY_HEADER}\n2024-01-01 10:00:00,A,1m,B,Rest Timer,0,0,0,180,,,`)).toThrow(
            "keine Trainingsdaten",
        );
        const stored = applyImport(null, first).library;
        const poundCsv = "Date,Exercise Name,Weight (lb)\n2024-02-01 10:00:00,Bench,100";
        expect(() => applyImport(stored, poundCsv)).toThrow("lb");
    });
});
