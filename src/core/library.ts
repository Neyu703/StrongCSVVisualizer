import { parseCsv } from "./csv";
import { normalizeRows } from "./normalize";
import type { Library, WorkoutSet } from "./types";

/** Outcome of merging an import into the stored library. */
export interface MergeResult {
    sets: WorkoutSet[];
    addedWorkouts: number;
    addedSets: number;
}

/** Outcome of importing a CSV file. */
export interface ImportResult {
    library: Library;
    addedWorkouts: number;
    addedSets: number;
}

/**
 * Adds only workouts whose start time is not stored yet; stored workouts stay untouched.
 * Diffing per workout (not per set) keeps legitimately identical sets within a workout.
 * @param existing stored sets
 * @param incoming sets of the new CSV
 * @returns merged sets sorted by date plus counts of what was added
 */
export function mergeWorkouts(existing: WorkoutSet[], incoming: WorkoutSet[]): MergeResult {
    const knownDates = new Set(existing.map((set) => set.date));
    const newSets = incoming.filter((set) => !knownDates.has(set.date));
    const addedWorkouts = new Set(newSets.map((set) => set.date)).size;
    const sets = [...existing, ...newSets].sort((first, second) => first.date.localeCompare(second.date));
    return { sets, addedWorkouts, addedSets: newSets.length };
}

/**
 * Imports a Strong CSV into the library (or starts a new one).
 * @param existing stored library, or null when nothing is stored yet
 * @param csvText content of the CSV file
 * @returns the updated library and what was added
 * @throws Error for non-Strong files, files without workouts, or a weight unit that differs from the library
 */
export function applyImport(existing: Library | null, csvText: string): ImportResult {
    const { unit, sets } = normalizeRows(parseCsv(csvText));
    if (sets.length === 0) {
        throw new Error("Die CSV enthält keine Trainingsdaten.");
    }
    if (existing !== null && existing.unit !== unit) {
        throw new Error(`Die CSV verwendet ${unit}, deine Daten sind in ${existing.unit} gespeichert.`);
    }
    const { sets: mergedSets, addedWorkouts, addedSets } = mergeWorkouts(existing?.sets ?? [], sets);
    return { library: { unit, sets: mergedSets }, addedWorkouts, addedSets };
}
