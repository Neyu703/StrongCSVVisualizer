import { describe, expect, it } from "vitest";
import { compareWorkouts, previousWorkout } from "./compare";
import { groupWorkouts } from "./stats";
import { makeSet } from "./testing";

const JAN_1 = "2024-01-01 10:00:00";
const JAN_3 = "2024-01-03 10:00:00";
const JAN_8 = "2024-01-08 10:00:00";
const JAN_15 = "2024-01-15 10:00:00";

const SETS = [
    makeSet({ date: JAN_1, workout: "Push", exercise: "Bench Press", weight: 95, reps: 5 }),
    makeSet({ date: JAN_1, workout: "Push", exercise: "Curl", setOrder: "W", weight: 10, reps: 10 }),
    makeSet({ date: JAN_1, workout: "Push", exercise: "Dip", weight: 0, reps: 8 }),
    makeSet({ date: JAN_3, workout: "Pull", exercise: "Row", weight: 60, reps: 10 }),
    makeSet({ date: JAN_8, workout: "Push", exercise: "Bench Press", setOrder: "W", weight: 60, reps: 10 }),
    makeSet({ date: JAN_8, workout: "Push", exercise: "Bench Press", weight: 100, reps: 5 }),
    makeSet({ date: JAN_8, workout: "Push", exercise: "Curl", weight: 12, reps: 10 }),
    makeSet({ date: JAN_8, workout: "Push", exercise: "Overhead Press", weight: 40, reps: 8 }),
    makeSet({ date: JAN_8, workout: "Push", exercise: "Lateral Raise", setOrder: "W", weight: 5, reps: 12 }),
    makeSet({ date: JAN_15, workout: "Push", exercise: "Bench Press", weight: 102.5, reps: 5 }),
];

const WORKOUTS = groupWorkouts(SETS);
const [JAN_1_WORKOUT, JAN_3_WORKOUT, JAN_8_WORKOUT, JAN_15_WORKOUT] = WORKOUTS;

describe("previousWorkout", () => {
    it("finds the latest earlier workout with the same name", () => {
        expect(previousWorkout(WORKOUTS, JAN_15_WORKOUT)).toBe(JAN_8_WORKOUT);
        expect(previousWorkout(WORKOUTS, JAN_8_WORKOUT)).toBe(JAN_1_WORKOUT);
    });

    it("does not depend on the order of the list", () => {
        expect(previousWorkout([...WORKOUTS].reverse(), JAN_15_WORKOUT)).toBe(JAN_8_WORKOUT);
    });

    it("returns undefined for the first workout of a name", () => {
        expect(previousWorkout(WORKOUTS, JAN_1_WORKOUT)).toBeUndefined();
        expect(previousWorkout(WORKOUTS, JAN_3_WORKOUT)).toBeUndefined();
    });
});

describe("compareWorkouts", () => {
    const comparisons = compareWorkouts(JAN_8_WORKOUT, JAN_1_WORKOUT);

    it("lists the exercises of the current workout that have working sets", () => {
        expect(comparisons.map((comparison) => comparison.name)).toEqual(["Bench Press", "Curl", "Overhead Press"]);
    });

    it("pairs each exercise's session with the previous one", () => {
        const [bench] = comparisons;
        expect(bench.kind).toBe("strength");
        expect(bench.current).toMatchObject({ date: JAN_8, maxWeight: 100, volume: 500 });
        expect(bench.previous).toMatchObject({ date: JAN_1, maxWeight: 95, volume: 475 });
    });

    it("has no previous session for new exercises or when the earlier one only had warm-ups", () => {
        expect(comparisons[1].previous).toBeNull();
        expect(comparisons[2].previous).toBeNull();
    });
});
