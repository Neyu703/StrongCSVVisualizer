import { describe, expect, it } from "vitest";
import { estimate1RM, exerciseKind, groupBy, isWarmup, setVolume, workingSets } from "./sets";
import { makeSet } from "./testing";

describe("groupBy", () => {
    it("groups in first-seen order", () => {
        const groups = groupBy([1, 2, 3, 4, 5], (value) => (value % 2 === 0 ? "even" : "odd"));
        expect([...groups]).toEqual([
            ["odd", [1, 3, 5]],
            ["even", [2, 4]],
        ]);
    });
});

describe("warm-up handling", () => {
    it("detects and filters warm-ups", () => {
        const sets = [makeSet({ setOrder: "W" }), makeSet({ setOrder: "F" }), makeSet()];
        expect(isWarmup(sets[0])).toBe(true);
        expect(isWarmup(sets[1])).toBe(false);
        expect(workingSets(sets)).toHaveLength(2);
    });
});

describe("exerciseKind", () => {
    it("classifies cardio, rep-only, assisted and strength exercises", () => {
        expect(exerciseKind("Running", [makeSet({ weight: 0, reps: 0, distance: 3 })])).toBe("cardio");
        expect(exerciseKind("Pull Up", [makeSet({ weight: 0, reps: 8 })])).toBe("reps");
        expect(exerciseKind("Pull Up (Assisted)", [makeSet({ weight: 30, reps: 8 })])).toBe("reps");
        expect(exerciseKind("Squat", [makeSet()])).toBe("strength");
    });
});

describe("estimate1RM", () => {
    it("uses Epley, the weight itself for one rep and 0 without reps", () => {
        expect(estimate1RM(100, 5)).toBeCloseTo(116.667, 3);
        expect(estimate1RM(100, 1)).toBe(100);
        expect(estimate1RM(100, 0)).toBe(0);
    });
});

describe("setVolume", () => {
    it("multiplies weight and reps but ignores warm-ups and assisted counterweights", () => {
        expect(setVolume(makeSet())).toBe(500);
        expect(setVolume(makeSet({ setOrder: "W" }))).toBe(0);
        expect(setVolume(makeSet({ exercise: "Pull Up (Assisted)" }))).toBe(0);
    });
});
