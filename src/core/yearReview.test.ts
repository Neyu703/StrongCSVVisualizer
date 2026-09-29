import { describe, expect, it } from "vitest";
import { reviewYears, yearReview } from "./yearReview";
import { makeSet } from "./testing";

const SETS = [
    makeSet({ date: "2023-12-28 10:00:00", weight: 100, reps: 5 }),
    makeSet({ date: "2024-01-02 10:00:00", weight: 100, reps: 5 }),
    makeSet({ date: "2024-01-09 10:00:00", weight: 105, reps: 5 }),
    makeSet({ date: "2024-01-16 10:00:00", weight: 110, reps: 5 }),
    makeSet({ date: "2024-02-06 10:00:00", exercise: "Squat", weight: 120, reps: 5 }),
    makeSet({ date: "2024-02-13 10:00:00", weight: 90, reps: 5 }),
    makeSet({ date: "2024-03-05 10:00:00", exercise: "Running", weight: 0, reps: 0, distance: 5, seconds: 1500 }),
];

describe("reviewYears", () => {
    it("lists every year with workouts, newest first", () => {
        expect(reviewYears(SETS)).toEqual([2024, 2023]);
        expect(reviewYears([])).toEqual([]);
    });
});

describe("yearReview", () => {
    const review = yearReview(SETS, 2024);

    it("totals the year's workouts, time, volume and working sets", () => {
        expect(review).toMatchObject({ year: 2024, workouts: 6, workingSets: 6, totalSeconds: 6 * 3600, totalVolume: 2625 });
    });

    it("finds the longest run of consecutive training weeks within the year", () => {
        expect(review.longestStreak).toBe(3);
    });

    it("ranks the most frequent exercises, ties by name, at most five", () => {
        expect(review.topExercises.map((exercise) => [exercise.name, exercise.workouts])).toEqual([
            ["Bench Press (Barbell)", 4],
            ["Running", 1],
            ["Squat", 1],
        ]);
        const many = Array.from({ length: 7 }, (_, index) => makeSet({ exercise: `Exercise ${index}` }));
        expect(yearReview(many, 2024).topExercises).toHaveLength(5);
    });

    it("counts only 1RM records that beat an earlier session, not first sessions or cardio", () => {
        expect(review.newRecords).toBe(2);
        expect(yearReview(SETS, 2023).newRecords).toBe(0);
    });

    it("finds the month with the highest volume and the busiest weekday", () => {
        expect(review.strongestMonth).toEqual({ month: 0, volume: 1575 });
        expect(review.busiestWeekday).toBe(1);
    });

    it("has no strongest month when nothing was lifted", () => {
        const cardioOnly = [makeSet({ exercise: "Running", weight: 0, reps: 0, distance: 5 })];
        expect(yearReview(cardioOnly, 2024).strongestMonth).toBeNull();
    });

    it("ignores other years", () => {
        expect(yearReview(SETS, 2023)).toMatchObject({ workouts: 1, totalVolume: 500 });
    });
});
