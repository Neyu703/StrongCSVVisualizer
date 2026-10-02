import { allPositive, bySex } from "./math";
import type { Sex } from "./math";

/** American Council on Exercise body fat classes. */
export type BodyFatCategory = "essential" | "athletes" | "fitness" | "average" | "obese";

/** Upper bound (exclusive, %) of each ACE class per sex; the last class is open-ended. */
export const BODY_FAT_CLASSES: Record<Sex, readonly [BodyFatCategory, number][]> = {
    male: [
        ["essential", 6],
        ["athletes", 14],
        ["fitness", 18],
        ["average", 25],
        ["obese", Infinity],
    ],
    female: [
        ["essential", 14],
        ["athletes", 21],
        ["fitness", 25],
        ["average", 32],
        ["obese", Infinity],
    ],
};

/** Ideal body fat % by age after Jackson & Pollock: [age, men, women]. */
const IDEAL_BODY_FAT: [number, number, number][] = [
    [20, 8.5, 17.7],
    [25, 10.5, 18.4],
    [30, 12.7, 19.3],
    [35, 13.7, 21.5],
    [40, 15.3, 22.2],
    [45, 16.4, 22.9],
    [50, 18.9, 25.2],
    [55, 20.9, 26.3],
];

/** Circumferences for the US Navy method, all in cm; hip is only used for women. */
export interface NavyInput {
    sex: Sex;
    heightCm: number;
    neckCm: number;
    waistCm: number;
    hipCm: number;
}

/**
 * US Navy circumference method.
 * @param input sex, height and circumferences
 * @returns body fat in %, null for missing or impossible measurements
 */
export function navyBodyFat({ sex, heightCm, neckCm, waistCm, hipCm }: NavyInput): number | null {
    const girth = sex === "male" ? waistCm - neckCm : waistCm + hipCm - neckCm;
    if (!allPositive(heightCm, neckCm, girth)) {
        return null;
    }
    const density =
        sex === "male"
            ? 1.0324 - 0.19077 * Math.log10(girth) + 0.15456 * Math.log10(heightCm)
            : 1.29579 - 0.35004 * Math.log10(girth) + 0.221 * Math.log10(heightCm);
    return 495 / density - 450;
}

/**
 * Adult body fat estimate from the BMI (Deurenberg).
 * @param sex male or female
 * @param bmiValue BMI
 * @param age age in years
 * @returns body fat in %, null for missing input
 */
export function bmiBodyFat(sex: Sex, bmiValue: number, age: number): number | null {
    return allPositive(bmiValue, age) ? 1.2 * bmiValue + 0.23 * age - bySex(sex, 16.2, 5.4) : null;
}

/**
 * Classifies a body fat percentage.
 * @param sex male or female
 * @param percent body fat in %
 * @returns the ACE class
 */
export function bodyFatCategory(sex: Sex, percent: number): BodyFatCategory {
    return BODY_FAT_CLASSES[sex].find(([, upperBound]) => percent < upperBound)![0];
}

/**
 * Ideal body fat for an age, linearly interpolated in the Jackson & Pollock table and clamped to its 20–55 range.
 * @param sex male or female
 * @param age age in years
 * @returns ideal body fat in %
 */
export function idealBodyFat(sex: Sex, age: number): number {
    const column = bySex(sex, 1, 2);
    const clampedAge = Math.min(Math.max(age, IDEAL_BODY_FAT[0][0]), IDEAL_BODY_FAT[IDEAL_BODY_FAT.length - 1][0]);
    const upperIndex = Math.max(1, IDEAL_BODY_FAT.findIndex(([rowAge]) => rowAge >= clampedAge));
    const lower = IDEAL_BODY_FAT[upperIndex - 1];
    const upper = IDEAL_BODY_FAT[upperIndex];
    const share = (clampedAge - lower[0]) / (upper[0] - lower[0]);
    return lower[column] + share * (upper[column] - lower[column]);
}

/**
 * Splits a body weight into fat and lean mass.
 * @param weightKg body weight
 * @param percent body fat in %
 * @returns fat and lean mass in kg
 */
export function bodyMassSplit(weightKg: number, percent: number): { fatKg: number; leanKg: number } {
    const fatKg = (weightKg * percent) / 100;
    return { fatKg, leanKg: weightKg - fatKg };
}

/**
 * Fat to lose to reach the ideal percentage (calculator.net convention: difference in % of the current weight).
 * @param weightKg body weight
 * @param percent current body fat in %
 * @param idealPercent ideal body fat in %
 * @returns kg of fat, 0 when already at or below the ideal
 */
export function fatToIdeal(weightKg: number, percent: number, idealPercent: number): number {
    return Math.max(0, (weightKg * (percent - idealPercent)) / 100);
}
