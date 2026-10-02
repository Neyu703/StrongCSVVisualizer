import type { WorkoutSet } from "./types";

/** How an exercise is evaluated: weighted lifts, rep-only movements or cardio. */
export type ExerciseKind = "strength" | "reps" | "cardio";

/**
 * Groups items by a string key, preserving first-seen key order.
 * @param items items to group
 * @param keyOf key extractor
 * @returns map from key to its items in original order
 */
export function groupBy<Item>(items: Item[], keyOf: (item: Item) => string): Map<string, Item[]> {
    const groups = new Map<string, Item[]>();
    for (const item of items) {
        const key = keyOf(item);
        const group = groups.get(key);
        if (group) {
            group.push(item);
        } else {
            groups.set(key, [item]);
        }
    }
    return groups;
}

/**
 * Tells whether a set is a warm-up set.
 * @param set the set
 * @returns true for Strong's "W" marker
 */
export function isWarmup(set: WorkoutSet): boolean {
    return set.setOrder === "W";
}

/**
 * Keeps only working sets (everything except warm-ups).
 * @param sets sets of any type
 * @returns non-warm-up sets
 */
export function workingSets(sets: WorkoutSet[]): WorkoutSet[] {
    return sets.filter((set) => !isWarmup(set));
}

/**
 * Tells whether an exercise is an assisted machine, where the logged weight is the counterweight.
 * @param exercise exercise name
 * @returns true for names containing "(Assisted)"
 */
export function isAssisted(exercise: string): boolean {
    return /\(assisted\)/i.test(exercise);
}

/**
 * Classifies an exercise from its name and logged sets.
 * Assisted machines log the counterweight, so they are rep-only; cardio has no weight and no reps.
 * @param exercise exercise name
 * @param sets all sets of that exercise
 * @returns exercise kind
 */
export function exerciseKind(exercise: string, sets: WorkoutSet[]): ExerciseKind {
    if (sets.every((set) => set.weight === 0 && set.reps === 0)) {
        return "cardio";
    }
    return isAssisted(exercise) || sets.every((set) => set.weight === 0) ? "reps" : "strength";
}

/**
 * Epley one-rep-max estimate as used by Strong (a single rep counts as the weight itself).
 * @param weight lifted weight
 * @param reps repetitions
 * @returns estimated 1RM, 0 without reps
 */
export function estimate1RM(weight: number, reps: number): number {
    if (reps <= 0) {
        return 0;
    }
    return reps === 1 ? weight : weight * (1 + reps / 30);
}

/**
 * Finds the working set with the highest 1RM estimate, e.g. to prefill a 1RM calculator.
 * @param sets sets of one exercise
 * @returns the best set, null without working sets that have reps
 */
export function bestEstimatedSet(sets: WorkoutSet[]): WorkoutSet | null {
    return workingSets(sets)
        .filter((set) => set.reps > 0)
        .reduce<WorkoutSet | null>(
            (best, set) => (best === null || estimate1RM(set.weight, set.reps) > estimate1RM(best.weight, best.reps) ? set : best),
            null,
        );
}

const MIN_RPE = 6;
const MAX_RPE = 10;

/**
 * Epley one-rep-max estimate that counts the reps left in reserve (10 − RPE) as if they had been performed.
 * @param weight lifted weight
 * @param reps repetitions
 * @param rpe rate of perceived exertion of the set, null when not logged
 * @returns estimated 1RM, 0 without reps or without an RPE between 6 and 10
 */
export function estimate1RMFromRPE(weight: number, reps: number, rpe: number | null): number {
    if (rpe === null || rpe < MIN_RPE || rpe > MAX_RPE || reps <= 0) {
        return 0;
    }
    return estimate1RM(weight, reps + MAX_RPE - rpe);
}

/**
 * Volume of one set (weight × reps); warm-ups and assisted counterweights do not count.
 * @param set the set
 * @returns volume, 0 for warm-ups and assisted exercises
 */
export function setVolume(set: WorkoutSet): number {
    if (isWarmup(set) || isAssisted(set.exercise)) {
        return 0;
    }
    return set.weight * set.reps;
}
