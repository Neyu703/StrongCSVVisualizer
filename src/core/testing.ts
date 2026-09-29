import type { WorkoutSet } from "./types";

/** Header line of the legacy (unit-less) Strong export. */
export const LEGACY_HEADER =
    "Date,Workout Name,Duration,Exercise Name,Set Order,Weight,Reps,Distance,Seconds,Notes,Workout Notes,RPE";

/**
 * Builds a set with sensible defaults for tests.
 * @param overrides fields to change
 * @returns a complete set
 */
export function makeSet(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
    return {
        date: "2024-01-01 10:00:00",
        workout: "Push",
        duration: 3600,
        exercise: "Bench Press (Barbell)",
        setOrder: "1",
        weight: 100,
        reps: 5,
        distance: 0,
        seconds: 0,
        rpe: null,
        notes: "",
        workoutNotes: "",
        ...overrides,
    };
}
