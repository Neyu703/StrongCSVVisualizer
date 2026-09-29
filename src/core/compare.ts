import { exerciseKind, workingSets } from "./sets";
import type { ExerciseKind } from "./sets";
import { sessionOf } from "./stats";
import type { ExerciseSession } from "./stats";
import type { Workout } from "./types";

/** One exercise of a workout next to the same exercise in the previous workout of that name. */
export interface ExerciseComparison {
    name: string;
    kind: ExerciseKind;
    current: ExerciseSession;
    /** Null when the exercise had no working sets in the previous workout. */
    previous: ExerciseSession | null;
}

/**
 * Finds the latest earlier workout with the same name.
 * @param workouts grouped workouts in any order
 * @param workout the workout to look back from
 * @returns the previous workout of that name, undefined for the first one
 */
export function previousWorkout(workouts: Workout[], workout: Workout): Workout | undefined {
    return workouts
        .filter((candidate) => candidate.name === workout.name && candidate.date < workout.date)
        .reduce<Workout | undefined>((latest, candidate) => (latest && latest.date > candidate.date ? latest : candidate), undefined);
}

/**
 * Compares the working sets of every exercise of a workout with the previous workout.
 * @param current the workout to evaluate
 * @param previous the earlier workout of the same name
 * @returns one comparison per exercise of the current workout that has working sets
 */
export function compareWorkouts(current: Workout, previous: Workout): ExerciseComparison[] {
    return current.exercises.flatMap((exercise) => {
        const currentSets = workingSets(exercise.sets);
        if (currentSets.length === 0) {
            return [];
        }
        const previousSets = workingSets(previous.exercises.find((candidate) => candidate.name === exercise.name)?.sets ?? []);
        return [
            {
                name: exercise.name,
                kind: exerciseKind(exercise.name, exercise.sets),
                current: sessionOf(current.date, currentSets),
                previous: previousSets.length === 0 ? null : sessionOf(previous.date, previousSets),
            },
        ];
    });
}
