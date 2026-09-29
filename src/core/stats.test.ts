import { describe, expect, it } from "vitest";
import {
    exerciseHistory,
    exerciseRecords,
    exerciseSummaries,
    groupWorkouts,
    overviewStats,
    recordSessions,
    workoutVolume,
} from "./stats";
import { makeSet } from "./testing";

const WORKOUT_A = "2024-01-01 10:00:00";
const WORKOUT_B = "2024-01-08 10:00:00";
const WORKOUT_C = "2024-01-25 10:00:00";

/** Three workouts covering strength, cardio, assisted and warm-up-only exercises. */
const SETS = [
    makeSet({ date: WORKOUT_C, weight: 100, reps: 6 }),
    makeSet({ date: WORKOUT_A, setOrder: "W", weight: 40, reps: 10, workoutNotes: "felt good" }),
    makeSet({ date: WORKOUT_A, weight: 100, reps: 5 }),
    makeSet({ date: WORKOUT_A, setOrder: "F", weight: 100, reps: 6 }),
    makeSet({ date: WORKOUT_A, exercise: "Squat (Barbell)", weight: 120, reps: 5 }),
    makeSet({ date: WORKOUT_B, weight: 105, reps: 3 }),
    makeSet({ date: WORKOUT_B, exercise: "Running", weight: 0, reps: 0, distance: 5, seconds: 1500 }),
    makeSet({ date: WORKOUT_B, exercise: "Pull Up (Assisted)", weight: 30, reps: 8 }),
    makeSet({ date: WORKOUT_B, exercise: "Curl", setOrder: "W", weight: 20, reps: 10 }),
];

describe("groupWorkouts", () => {
    it("orders workouts by date and groups exercises by first appearance", () => {
        const workouts = groupWorkouts(SETS);
        expect(workouts.map((workout) => workout.date)).toEqual([WORKOUT_A, WORKOUT_B, WORKOUT_C]);
        expect(workouts[0].exercises.map((exercise) => exercise.name)).toEqual(["Bench Press (Barbell)", "Squat (Barbell)"]);
        expect(workouts[0].exercises[0].sets).toHaveLength(3);
        expect(workouts[0]).toMatchObject({ name: "Push", duration: 3600, notes: "felt good" });
        expect(workouts[1].notes).toBe("");
    });
});

describe("workoutVolume", () => {
    it("sums working-set volume of a workout", () => {
        const [workoutA, workoutB] = groupWorkouts(SETS);
        expect(workoutVolume(workoutA)).toBe(1100 + 600);
        expect(workoutVolume(workoutB)).toBe(315);
    });
});

describe("exerciseHistory", () => {
    it("condenses working sets per workout and ignores warm-ups", () => {
        const history = exerciseHistory(SETS, "Bench Press (Barbell)");
        expect(history.map((session) => session.date)).toEqual([WORKOUT_A, WORKOUT_B, WORKOUT_C]);
        expect(history[0]).toMatchObject({ maxWeight: 100, volume: 1100, bestSetVolume: 600, maxReps: 6 });
        expect(history[0].e1rm).toBeCloseTo(120);
        expect(history[0].sets.map((set) => set.setOrder)).toEqual(["1", "F"]);
        expect(history[1].e1rm).toBeCloseTo(115.5);
    });

    it("derives the RPE-based 1RM and the average RPE from sets that have an RPE", () => {
        const [session] = exerciseHistory(
            [
                makeSet({ weight: 100, reps: 5, rpe: 8 }),
                makeSet({ weight: 100, reps: 5, rpe: 9 }),
                makeSet({ weight: 100, reps: 5, rpe: null }),
                makeSet({ setOrder: "W", weight: 40, reps: 10, rpe: 3 }),
            ],
            "Bench Press (Barbell)",
        );
        expect(session.avgRpe).toBeCloseTo(8.5);
        expect(session.e1rmRpe).toBeCloseTo(100 * (1 + 7 / 30));
    });

    it("reports 0 for both RPE metrics when no set has an RPE", () => {
        expect(exerciseHistory(SETS, "Bench Press (Barbell)")[0]).toMatchObject({ avgRpe: 0, e1rmRpe: 0 });
    });

    it("sums distance and time for cardio and skips warm-up-only workouts", () => {
        expect(exerciseHistory(SETS, "Running")[0]).toMatchObject({ distance: 5, seconds: 1500 });
        expect(exerciseHistory(SETS, "Curl")).toEqual([]);
    });
});

describe("recordSessions", () => {
    it("returns the sessions that beat every earlier one, without the first session", () => {
        const sessions = [100, 100, 105, 95, 110].map((weight, index) =>
            exerciseHistory([makeSet({ date: `2024-01-0${index + 1} 10:00:00`, weight, reps: 1 })], "Bench Press (Barbell)")[0],
        );
        expect(recordSessions(sessions, "maxWeight").map((session) => session.maxWeight)).toEqual([105, 110]);
    });

    it("returns nothing for fewer than two sessions", () => {
        expect(recordSessions([], "e1rm")).toEqual([]);
        expect(recordSessions(exerciseHistory(SETS, "Squat (Barbell)"), "e1rm")).toEqual([]);
    });
});

describe("exerciseRecords", () => {
    it("finds strength records with the earliest date on ties", () => {
        const { kind, records } = exerciseRecords(SETS, "Bench Press (Barbell)");
        expect(kind).toBe("strength");
        expect(records).toEqual([
            { key: "maxWeight", metric: "maxWeight", value: 105, date: WORKOUT_B },
            { key: "best1RM", metric: "e1rm", value: expect.closeTo(120), date: WORKOUT_A },
            { key: "bestSetVolume", metric: "bestSetVolume", value: 600, date: WORKOUT_A },
            { key: "maxWorkoutVolume", metric: "volume", value: 1100, date: WORKOUT_A },
            { key: "maxReps", metric: "maxReps", value: 6, date: WORKOUT_A },
        ]);
    });

    it("builds the rep-max table up to the highest reached rep count", () => {
        const { repMax } = exerciseRecords(SETS, "Bench Press (Barbell)");
        expect(repMax).toEqual([
            { reps: 1, weight: 105, date: WORKOUT_B },
            { reps: 2, weight: 105, date: WORKOUT_B },
            { reps: 3, weight: 105, date: WORKOUT_B },
            { reps: 4, weight: 100, date: WORKOUT_A },
            { reps: 5, weight: 100, date: WORKOUT_A },
            { reps: 6, weight: 100, date: WORKOUT_A },
        ]);
    });

    it("reports distance and time for cardio, reps for assisted exercises", () => {
        expect(exerciseRecords(SETS, "Running")).toMatchObject({
            kind: "cardio",
            records: [
                { key: "maxDistance", value: 5 },
                { key: "longestTime", value: 1500 },
            ],
            repMax: [],
        });
        expect(exerciseRecords(SETS, "Pull Up (Assisted)")).toMatchObject({
            kind: "reps",
            records: [{ key: "maxReps", value: 8 }],
            repMax: [],
        });
    });

    it("returns no records for a warm-up-only exercise", () => {
        expect(exerciseRecords(SETS, "Curl")).toEqual({ kind: "strength", sessions: [], records: [], repMax: [] });
    });
});

describe("exerciseSummaries", () => {
    it("sorts by workout count, then name, and reports the last date", () => {
        const summaries = exerciseSummaries(SETS);
        expect(summaries.map((summary) => summary.name)).toEqual([
            "Bench Press (Barbell)",
            "Curl",
            "Pull Up (Assisted)",
            "Running",
            "Squat (Barbell)",
        ]);
        expect(summaries[0]).toEqual({ name: "Bench Press (Barbell)", kind: "strength", workouts: 3, lastDate: WORKOUT_C });
    });

    it("finds the last date regardless of set order", () => {
        const ascending = [makeSet({ date: WORKOUT_A }), makeSet({ date: WORKOUT_C })];
        expect(exerciseSummaries(ascending)[0].lastDate).toBe(WORKOUT_C);
    });
});

describe("overviewStats", () => {
    it("totals volume, sets, time and fills empty weeks", () => {
        const stats = overviewStats(SETS, new Date(2024, 0, 31, 12));
        expect(stats).toMatchObject({ workouts: 3, workingSets: 7, totalVolume: 2615, totalSeconds: 10800 });
        expect(stats.weeks).toEqual([
            { weekStart: "2024-01-01", value: 1 },
            { weekStart: "2024-01-08", value: 1 },
            { weekStart: "2024-01-15", value: 0 },
            { weekStart: "2024-01-22", value: 1 },
            { weekStart: "2024-01-29", value: 0 },
        ]);
    });

    it("keeps the streak alive while the current week is still empty", () => {
        const stats = overviewStats(SETS, new Date(2024, 0, 31, 12));
        expect(stats).toMatchObject({ currentStreak: 1, longestStreak: 2 });
        expect(overviewStats(SETS, new Date(2024, 0, 17, 12))).toMatchObject({ currentStreak: 2, longestStreak: 2 });
    });

    it("counts the current week when it has a workout", () => {
        expect(overviewStats(SETS, new Date(2024, 0, 26, 12))).toMatchObject({ currentStreak: 1 });
    });

    it("handles an empty library", () => {
        expect(overviewStats([], new Date(2024, 0, 31))).toEqual({
            workouts: 0,
            workingSets: 0,
            totalVolume: 0,
            totalSeconds: 0,
            weeks: [],
            currentStreak: 0,
            longestStreak: 0,
        });
    });
});
