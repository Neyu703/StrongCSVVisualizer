import { describe, expect, it } from "vitest";
import { MUSCLES, WEEKLY_SET_TARGET, muscleFor, muscleLoad, weeklyMuscleSets, withIntensity } from "./muscles";
import { makeSet } from "./testing";

describe("muscleFor", () => {
    it.each([
        ["Bench Press (Barbell)", "Brust"],
        ["Chest Dip (Assisted)", "Brust"],
        ["Lat Pulldown (Cable)", "Latissimus"],
        ["Seated Row (Cable)", "Oberer Rücken"],
        ["Highrow ", "Oberer Rücken"],
        ["Upright Row (Cable)", "Schultern"],
        ["Lateral Raise (Dumbbell)", "Schultern"],
        ["Reverse Fly (Machine)", "Schultern"],
        ["Overhead Press (Barbell)", "Schultern"],
        ["Triceps Pushdown (Cable - Straight Bar)", "Trizeps"],
        ["Bicep Curl (Dumbbell)", "Bizeps"],
        ["Seated Leg Curl (Machine)", "Beinbeuger"],
        ["Romanian Deadlift (Barbell)", "Beinbeuger"],
        ["Deadlift (Barbell)", "Unterer Rücken"],
        ["Leg Extension (Machine)", "Quadrizeps"],
        ["Squat (Barbell)", "Quadrizeps"],
        ["Seated Calf Raise (Machine)", "Waden"],
        ["Abdominal ", "Bauch"],
        ["Hip Abductor (Machine)", "Abduktoren"],
        ["Hip Adductor (Machine)", "Adduktoren"],
    ])("%s trains %s primarily", (exercise, muscle) => {
        expect(muscleFor(exercise).primary).toContain(muscle);
    });

    it("returns nothing for cardio and unknown exercises", () => {
        expect(muscleFor("Running (Treadmill)")).toEqual({ primary: [], secondary: [] });
    });
});

describe("muscleLoad", () => {
    const now = new Date(2024, 0, 31, 12);

    it("counts primary sets fully, secondary half, skips warm-ups and old workouts", () => {
        const sets = [
            makeSet({ date: "2024-01-30 10:00:00" }),
            makeSet({ date: "2024-01-30 10:00:00", setOrder: "W" }),
            makeSet({ date: "2023-12-01 10:00:00" }),
            makeSet({ date: "2024-01-30 10:00:00", exercise: "Running" }),
        ];
        const load = Object.fromEntries(muscleLoad(sets, 30, now).map(({ muscle, load: value }) => [muscle, value]));
        expect(load).toMatchObject({ Brust: 1, Schultern: 0.5, Trizeps: 0.5, Bizeps: 0 });
    });

    it("lists every muscle in fixed order even without data", () => {
        expect(muscleLoad([], 7, now).map(({ muscle }) => muscle)).toEqual([...MUSCLES]);
    });
});

describe("withIntensity", () => {
    it("scales loads relative to the most trained muscle", () => {
        const loads = [
            { muscle: "Brust", load: 6 },
            { muscle: "Bizeps", load: 3 },
            { muscle: "Waden", load: 0 },
        ] as const;
        expect(withIntensity([...loads]).map((entry) => entry.intensity)).toEqual([1, 0.5, 0]);
    });

    it("gives 0 to everything when nothing was trained", () => {
        expect(withIntensity(muscleLoad([], 7, new Date())).every((entry) => entry.intensity === 0)).toBe(true);
    });
});

describe("weeklyMuscleSets", () => {
    const now = new Date(2024, 0, 31, 12);
    const sets = [
        makeSet({ date: "2024-01-16 10:00:00" }),
        makeSet({ date: "2024-01-23 10:00:00" }),
        makeSet({ date: "2024-01-23 10:00:00", exercise: "Overhead Press (Barbell)" }),
        makeSet({ date: "2024-01-30 10:00:00", setOrder: "W" }),
        makeSet({ date: "2024-01-08 10:00:00" }),
        makeSet({ date: "2024-01-16 10:00:00", exercise: "Running" }),
    ];

    it("lists the requested number of weeks ending with the current one", () => {
        expect(weeklyMuscleSets(sets, "Brust", now, 3).map((week) => week.weekStart)).toEqual([
            "2024-01-15",
            "2024-01-22",
            "2024-01-29",
        ]);
    });

    it("counts primary sets fully and secondary sets half, per week", () => {
        expect(weeklyMuscleSets(sets, "Brust", now, 3).map((week) => week.value)).toEqual([1, 1, 0]);
        expect(weeklyMuscleSets(sets, "Schultern", now, 3).map((week) => week.value)).toEqual([0.5, 1.5, 0]);
        expect(weeklyMuscleSets(sets, "Trizeps", now, 3).map((week) => week.value)).toEqual([0.5, 1, 0]);
    });

    it("skips warm-ups, older weeks and exercises without a muscle mapping", () => {
        expect(weeklyMuscleSets(sets, "Bizeps", now, 3).map((week) => week.value)).toEqual([0, 0, 0]);
    });
});

describe("WEEKLY_SET_TARGET", () => {
    it("is a low-to-high range of weekly sets per muscle", () => {
        expect(WEEKLY_SET_TARGET[0]).toBeLessThan(WEEKLY_SET_TARGET[1]);
    });
});
