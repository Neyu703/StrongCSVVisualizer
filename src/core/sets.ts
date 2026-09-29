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
