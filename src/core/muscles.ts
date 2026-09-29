import { daysBefore, parseDate } from "./dates";
import { workingSets } from "./sets";
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
        const { primary, secondary } = muscleFor(set.exercise);
        primary.forEach((muscle) => {
            loads[muscle] += 1;
        });
        secondary.forEach((muscle) => {
            loads[muscle] += SECONDARY_WEIGHT;
        });
    }
    return MUSCLES.map((muscle) => ({ muscle, load: loads[muscle] }));
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
