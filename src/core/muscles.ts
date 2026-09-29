import { daysBefore, isoDay, lastWeekStarts, mondayOf, parseDate } from "./dates";
import { workingSets } from "./sets";
import type { WeekValue } from "./stats";
import type { WorkoutSet } from "./types";

export const MUSCLES = [
    "Brust",
    "Schultern",
    "Trizeps",
    "Bizeps",
    "Unterarme",
    "Latissimus",
    "Oberer Rücken",
    "Trapez",
    "Unterer Rücken",
    "Bauch",
    "Quadrizeps",
    "Beinbeuger",
    "Gesäß",
    "Adduktoren",
    "Abduktoren",
    "Waden",
] as const;

export type Muscle = (typeof MUSCLES)[number];

/** Muscles trained by an exercise: primary movers count fully, secondary ones half. */
export interface MuscleUsage {
    primary: Muscle[];
    secondary: Muscle[];
}

/** Total weighted set count for one muscle. */
export interface MuscleLoad {
    muscle: Muscle;
    load: number;
}

const SECONDARY_WEIGHT = 0.5;

/** Recommended weekly weighted sets per muscle (low, high). */
export const WEEKLY_SET_TARGET = [10, 20] as const;

/** Ordered keyword rules; the first matching rule wins, so specific names come before generic ones. */
const MUSCLE_RULES: [RegExp, MuscleUsage][] = [
    [/calf/, { primary: ["Waden"], secondary: [] }],
    [/reverse fly|face pull/, { primary: ["Schultern"], secondary: ["Oberer Rücken"] }],
    [/upright row/, { primary: ["Schultern", "Trapez"], secondary: [] }],
    [/raise/, { primary: ["Schultern"], secondary: [] }],
    [/shoulder press|overhead press|arnold press/, { primary: ["Schultern"], secondary: ["Trizeps"] }],
    [/triceps/, { primary: ["Trizeps"], secondary: [] }],
    [/chest dip/, { primary: ["Brust"], secondary: ["Trizeps"] }],
    [/pullover|lat pulldown|lat pushdown|pull up/, { primary: ["Latissimus"], secondary: ["Bizeps"] }],
    [/row/, { primary: ["Oberer Rücken"], secondary: ["Latissimus", "Bizeps"] }],
    [/leg curl/, { primary: ["Beinbeuger"], secondary: [] }],
    [/curl/, { primary: ["Bizeps"], secondary: ["Unterarme"] }],
    [/chest|bench|pec deck|decline press/, { primary: ["Brust"], secondary: ["Schultern", "Trizeps"] }],
    [/romanian deadlift/, { primary: ["Beinbeuger", "Gesäß"], secondary: ["Unterer Rücken"] }],
    [/deadlift/, { primary: ["Unterer Rücken", "Gesäß", "Beinbeuger"], secondary: ["Trapez"] }],
    [/leg extension/, { primary: ["Quadrizeps"], secondary: [] }],
    [/squat|leg press|lunge/, { primary: ["Quadrizeps"], secondary: ["Gesäß"] }],
    [/abdominal|crunch|torso rotation/, { primary: ["Bauch"], secondary: [] }],
    [/abductor/, { primary: ["Abduktoren"], secondary: [] }],
    [/adductor/, { primary: ["Adduktoren"], secondary: [] }],
];

/**
 * Looks up the muscles an exercise trains, by keywords in its name.
 * @param exercise exercise name
 * @returns primary and secondary muscles, both empty for unknown exercises and cardio
 */
export function muscleFor(exercise: string): MuscleUsage {
    const name = exercise.toLowerCase();
    return MUSCLE_RULES.find(([pattern]) => pattern.test(name))?.[1] ?? { primary: [], secondary: [] };
}

/**
 * Lists how much one set of an exercise counts for each muscle it trains.
 * @param exercise exercise name
 * @returns muscle and weight pairs: 1 for primary, half for secondary muscles
 */
function setContributions(exercise: string): [Muscle, number][] {
    const { primary, secondary } = muscleFor(exercise);
    return [
        ...primary.map((muscle): [Muscle, number] => [muscle, 1]),
        ...secondary.map((muscle): [Muscle, number] => [muscle, SECONDARY_WEIGHT]),
    ];
}

/**
 * Sums weighted working sets per muscle over the last days.
 * @param sets all sets
 * @param days size of the time window
 * @param now reference time
 * @returns one entry per muscle in MUSCLES order (0 when untrained)
 */
export function muscleLoad(sets: WorkoutSet[], days: number, now: Date): MuscleLoad[] {
    const cutoff = daysBefore(now, days);
    const loads = Object.fromEntries(MUSCLES.map((muscle) => [muscle, 0])) as Record<Muscle, number>;
    for (const set of workingSets(sets)) {
        if (parseDate(set.date).getTime() < cutoff) {
            continue;
        }
        for (const [muscle, weight] of setContributions(set.exercise)) {
            loads[muscle] += weight;
        }
    }
    return MUSCLES.map((muscle) => ({ muscle, load: loads[muscle] }));
}

/**
 * Sums the weighted working sets of one muscle per calendar week.
 * @param sets all sets
 * @param muscle the muscle to follow
 * @param now reference time; the last week is its week
 * @param weeks number of weeks to list
 * @returns weeks oldest first, 0 for weeks without training
 */
export function weeklyMuscleSets(sets: WorkoutSet[], muscle: Muscle, now: Date, weeks: number): WeekValue[] {
    const totals = new Map<string, number>();
    for (const set of workingSets(sets)) {
        const weekStart = isoDay(mondayOf(parseDate(set.date)));
        for (const [trained, weight] of setContributions(set.exercise)) {
            if (trained === muscle) {
                totals.set(weekStart, (totals.get(weekStart) ?? 0) + weight);
            }
        }
    }
    return lastWeekStarts(now, weeks).map((weekStart) => ({ weekStart, value: totals.get(weekStart) ?? 0 }));
}

/** A muscle's load relative to the most trained muscle. */
export interface MuscleIntensity extends MuscleLoad {
    /** 0 (untrained) to 1 (most trained muscle in the window). */
    intensity: number;
}

/**
 * Scales loads relative to the highest one, so the most trained muscle is always 1.
 * @param loads loads from muscleLoad
 * @returns the same entries with an intensity from 0 to 1
 */
export function withIntensity(loads: MuscleLoad[]): MuscleIntensity[] {
    const highest = Math.max(...loads.map(({ load }) => load));
    return loads.map((entry) => ({ ...entry, intensity: highest === 0 ? 0 : entry.load / highest }));
}
