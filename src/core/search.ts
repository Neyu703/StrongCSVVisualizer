import type { Workout } from "./types";

/** A workout that matches a search and the notes that contain the search text. */
export interface WorkoutMatch {
    workout: Workout;
    /** Workout and set notes containing the query; empty when only the name matched or the query is empty. */
    notes: string[];
}

/**
 * Tests case-insensitively whether a text contains a lower-cased needle.
 * @param text text to search in
 * @param needle non-empty lower-case search text
 * @returns true when the text contains the needle
 */
function contains(text: string, needle: string): boolean {
    return text.toLowerCase().includes(needle);
}

/**
 * Finds workouts by name, exercise name, workout notes and set notes.
 * @param workouts grouped workouts in the order they should be listed
 * @param query search text; blank matches every workout
 * @returns the matching workouts in the input order, each with its matching notes
 */
export function searchWorkouts(workouts: Workout[], query: string): WorkoutMatch[] {
    const needle = query.trim().toLowerCase();
    if (needle === "") {
        return workouts.map((workout) => ({ workout, notes: [] }));
    }
    return workouts.flatMap((workout) => {
        const notes = [workout.notes, ...workout.exercises.flatMap((exercise) => exercise.sets.map((set) => set.notes))].filter(
            (note) => contains(note, needle),
        );
        const matches =
            notes.length > 0 ||
            contains(workout.name, needle) ||
            workout.exercises.some((exercise) => contains(exercise.name, needle));
        return matches ? [{ workout, notes }] : [];
    });
}
