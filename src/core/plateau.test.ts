import { describe, expect, it } from "vitest";
import { isoDay } from "./dates";
import { findPlateaus } from "./plateau";
import { makeSet } from "./testing";

const NOW = new Date(2024, 2, 1, 12);

/**
 * Builds one bench session per week, starting on 2024-01-08, each with a single set of 5 reps.
 * @param weights weight per week
 * @param exercise exercise name
 * @returns the sets
 */
function weekly(weights: number[], exercise = "Bench Press") {
    return weights.map((weight, week) =>
        makeSet({ date: `${isoDay(new Date(2024, 0, 8 + week * 7))} 10:00:00`, exercise, weight, reps: 5 }),
    );
}

describe("findPlateaus", () => {
    it("reports an exercise with a flat 1RM and the days since its best session", () => {
        const [plateau] = findPlateaus(weekly([100, 100, 100, 100, 100, 100]), NOW);
        expect(plateau.exercise).toBe("Bench Press");
        expect(plateau.slopePerDay).toBe(0);
        expect(plateau.daysSinceBest).toBe(53);
    });

    it("counts calendar days since the best session, not elapsed 24-hour periods", () => {
        const [plateau] = findPlateaus(weekly([100, 100, 100, 100, 100, 100]), new Date(2024, 2, 1, 9));
        expect(plateau.daysSinceBest).toBe(53);
    });

    it("reports a falling 1RM", () => {
        const [plateau] = findPlateaus(weekly([100, 100, 100, 97.5, 95, 92.5]), NOW);
        expect(plateau.slopePerDay).toBeLessThan(0);
    });

    it("ignores exercises that are still progressing", () => {
        expect(findPlateaus(weekly([100, 102.5, 105, 107.5, 110, 112.5]), NOW)).toEqual([]);
    });

    it("needs at least four sessions in the last eight weeks", () => {
        expect(findPlateaus(weekly([100, 100, 100]), NOW)).toEqual([]);
        const older = weekly([100, 100, 100, 100, 100, 100]).map((set) => ({ ...set, date: set.date.replace("2024-", "2023-") }));
        expect(findPlateaus([...older, ...weekly([100, 100, 100]).map((set) => ({ ...set, date: set.date.replace("01-", "02-") }))], NOW)).toEqual([]);
    });

    it("only looks at weighted lifts", () => {
        expect(findPlateaus(weekly([0, 0, 0, 0, 0, 0], "Pull Up"), NOW)).toEqual([]);
        const cardio = weekly([0, 0, 0, 0, 0, 0], "Running").map((set) => ({ ...set, reps: 0, distance: 5 }));
        expect(findPlateaus(cardio, NOW)).toEqual([]);
    });

    it("lists the steepest decline first", () => {
        const plateaus = findPlateaus([...weekly([100, 100, 100, 100, 100, 100]), ...weekly([100, 100, 100, 97.5, 95, 92.5], "Squat")], NOW);
        expect(plateaus.map((plateau) => plateau.exercise)).toEqual(["Squat", "Bench Press"]);
    });

    it("returns nothing without sets", () => {
        expect(findPlateaus([], NOW)).toEqual([]);
    });
});
