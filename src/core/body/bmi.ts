import { allPositive } from "./math";

/** WHO adult BMI classes. */
export type BmiCategory =
    | "severeThinness"
    | "moderateThinness"
    | "mildThinness"
    | "normal"
    | "overweight"
    | "obese1"
    | "obese2"
    | "obese3";

/** Upper BMI bound (exclusive) of each class; the last class is open-ended. */
export const BMI_CLASSES: readonly [BmiCategory, number][] = [
    ["severeThinness", 16],
    ["moderateThinness", 17],
    ["mildThinness", 18.5],
    ["normal", 25],
    ["overweight", 30],
    ["obese1", 35],
    ["obese2", 40],
    ["obese3", Infinity],
];

/** BMI range WHO calls normal weight. */
export const HEALTHY_BMI = [18.5, 25] as const;

/**
 * Converts a height to meters.
 * @param heightCm height in cm
 * @returns height in m
 */
function meters(heightCm: number): number {
    return heightCm / 100;
}

/**
 * Body mass index.
 * @param weightKg body weight
 * @param heightCm height
 * @returns kg/m², null for missing input
 */
export function bmi(weightKg: number, heightCm: number): number | null {
    return allPositive(weightKg, heightCm) ? weightKg / meters(heightCm) ** 2 : null;
}

/**
 * Classifies a BMI.
 * @param value BMI
 * @returns the WHO class
 */
export function bmiCategory(value: number): BmiCategory {
    return BMI_CLASSES.find(([, upperBound]) => value < upperBound)![0];
}

/**
 * Body weights that give a normal BMI at this height.
 * @param heightCm height
 * @returns lowest and highest healthy weight in kg, null for missing input
 */
export function healthyWeightRange(heightCm: number): [number, number] | null {
    if (!allPositive(heightCm)) {
        return null;
    }
    const squaredMeters = meters(heightCm) ** 2;
    return [HEALTHY_BMI[0] * squaredMeters, HEALTHY_BMI[1] * squaredMeters];
}

/**
 * BMI relative to the upper normal limit (1.0 = 25).
 * @param value BMI
 * @returns BMI Prime
 */
export function bmiPrime(value: number): number {
    return value / HEALTHY_BMI[1];
}

/**
 * Ponderal index, which scales with the cube of height and suits very tall or short people better.
 * @param weightKg body weight
 * @param heightCm height
 * @returns kg/m³, null for missing input
 */
export function ponderalIndex(weightKg: number, heightCm: number): number | null {
    return allPositive(weightKg, heightCm) ? weightKg / meters(heightCm) ** 3 : null;
}
