import { estimate1RM } from "../sets";
import { allPositive } from "./math";

export type OneRepMaxFormula = "epley" | "brzycki" | "lombardi";

/** Reps up to which the 1RM formulas are offered (Brzycki breaks down at 37). */
export const MAX_REPS_FOR_1RM = 30;

/** Share of the 1RM and the reps typically possible with it. */
export const ONE_REP_MAX_TABLE: readonly [number, number][] = [
    [100, 1],
    [95, 2],
    [90, 4],
    [85, 6],
    [80, 8],
    [75, 10],
    [70, 12],
    [65, 16],
    [60, 20],
    [55, 24],
    [50, 30],
];

/** Training zones as share of the heart rate reserve: [from %, to %]. */
export const HEART_RATE_ZONES: readonly [number, number][] = [
    [50, 60],
    [60, 70],
    [70, 80],
    [80, 90],
    [90, 100],
];

/** Race distances for the Riegel prediction, in km. */
export const RACE_DISTANCES = [5, 10, 21.0975, 42.195] as const;

/** Exponent of Riegel's fatigue model. */
const RIEGEL_EXPONENT = 1.06;

/**
 * One-rep max after Epley (as in Strong), Brzycki and Lombardi.
 * @param weight lifted weight
 * @param reps repetitions (1–30)
 * @returns estimate per formula, null for missing weight or reps outside 1–30
 */
export function oneRepMax(weight: number, reps: number): Record<OneRepMaxFormula, number> | null {
    if (!allPositive(weight) || !Number.isInteger(reps) || reps < 1 || reps > MAX_REPS_FOR_1RM) {
        return null;
    }
    return {
        epley: estimate1RM(weight, reps),
        brzycki: (weight * 36) / (37 - reps),
        lombardi: weight * reps ** 0.1,
    };
}

/**
 * Maximum heart rate estimates.
 * @param age age in years
 * @returns bpm after Fox (220 − age) and Tanaka (208 − 0.7 × age), null for missing age
 */
export function maxHeartRate(age: number): { fox: number; tanaka: number } | null {
    return allPositive(age) ? { fox: 220 - age, tanaka: 208 - 0.7 * age } : null;
}

/**
 * Karvonen heart rate zones; without a resting heart rate they are plain shares of the maximum.
 * @param maxBpm maximum heart rate
 * @param restingBpm resting heart rate, NaN when unknown
 * @returns lower and upper bpm per zone
 */
export function heartRateZones(maxBpm: number, restingBpm: number): [number, number][] {
    const rest = allPositive(restingBpm) ? restingBpm : 0;
    const bpmAt = (percent: number) => rest + (percent / 100) * (maxBpm - rest);
    return HEART_RATE_ZONES.map(([from, to]) => [bpmAt(from), bpmAt(to)]);
}

/**
 * Pace and speed of a run.
 * @param distanceKm distance
 * @param seconds time
 * @returns seconds per km and km/h, null for missing input
 */
export function pace(distanceKm: number, seconds: number): { secondsPerKm: number; kmh: number } | null {
    return allPositive(distanceKm, seconds) ? { secondsPerKm: seconds / distanceKm, kmh: distanceKm / (seconds / 3600) } : null;
}

/**
 * Riegel race time prediction from one result.
 * @param distanceKm distance of the known result
 * @param seconds time of the known result
 * @param targetKm distance to predict
 * @returns predicted seconds
 */
export function riegel(distanceKm: number, seconds: number, targetKm: number): number {
    return seconds * (targetKm / distanceKm) ** RIEGEL_EXPONENT;
}
