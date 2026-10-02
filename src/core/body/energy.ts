import { allPositive, bySex } from "./math";
import type { Sex } from "./math";

export type BmrFormula = "mifflin" | "harris" | "katch";

export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "veryActive" | "extreme";

/** Inputs of the resting energy formulas. */
export interface BmrInput {
    sex: Sex;
    age: number;
    weightKg: number;
    heightCm: number;
    /** Only Katch-McArdle needs it; NaN when unknown. */
    leanMassKg: number;
}

/** Multipliers of the resting rate per activity level (as used by calculator.net). */
export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.465,
    active: 1.55,
    veryActive: 1.725,
    extreme: 1.9,
};

/** Energy content of one kg of body weight change. */
export const KCAL_PER_KG = 7700;

/** Weekly weight changes offered as calorie goals, in kg (negative = loss). */
export const WEEKLY_CHANGES = [-1, -0.5, -0.25, 0, 0.25, 0.5, 1] as const;

/** Daily calories for one weekly weight change. */
export interface CalorieGoal {
    kgPerWeek: number;
    kcal: number;
}

/**
 * Mifflin-St Jeor resting rate.
 * @param input sex, age, weight, height
 * @returns kcal per day, null for missing input
 */
function mifflin({ sex, age, weightKg, heightCm }: BmrInput): number | null {
    if (!allPositive(age, weightKg, heightCm)) {
        return null;
    }
    return 10 * weightKg + 6.25 * heightCm - 5 * age + bySex(sex, 5, -161);
}

/**
 * Revised Harris-Benedict resting rate (Roza & Shizgal 1984).
 * @param input sex, age, weight, height
 * @returns kcal per day, null for missing input
 */
function harris({ sex, age, weightKg, heightCm }: BmrInput): number | null {
    if (!allPositive(age, weightKg, heightCm)) {
        return null;
    }
    return sex === "male"
        ? 13.397 * weightKg + 4.799 * heightCm - 5.677 * age + 88.362
        : 9.247 * weightKg + 3.098 * heightCm - 4.33 * age + 447.593;
}

/**
 * Katch-McArdle resting rate from lean mass.
 * @param input lean mass
 * @returns kcal per day, null without lean mass
 */
function katch({ leanMassKg }: BmrInput): number | null {
    return allPositive(leanMassKg) ? 370 + 21.6 * leanMassKg : null;
}

const BMR_CALCULATORS: Record<BmrFormula, (input: BmrInput) => number | null> = { mifflin, harris, katch };

export const BMR_FORMULAS = Object.keys(BMR_CALCULATORS) as BmrFormula[];

export const ACTIVITY_LEVELS = Object.keys(ACTIVITY_FACTORS) as ActivityLevel[];

/**
 * Basal metabolic rate with the chosen formula.
 * @param formula formula
 * @param input body data
 * @returns kcal per day, null for missing input
 */
export function bmr(formula: BmrFormula, input: BmrInput): number | null {
    return BMR_CALCULATORS[formula](input);
}

/**
 * Total daily energy expenditure.
 * @param restingKcal basal metabolic rate
 * @param activity activity level
 * @returns kcal per day
 */
export function tdee(restingKcal: number, activity: ActivityLevel): number {
    return restingKcal * ACTIVITY_FACTORS[activity];
}

/**
 * Daily intake that changes body weight by the given amount per week.
 * @param maintenanceKcal total daily energy expenditure
 * @param kgPerWeek weekly change (negative = loss)
 * @returns kcal per day
 */
export function caloriesForChange(maintenanceKcal: number, kgPerWeek: number): number {
    return maintenanceKcal + (kgPerWeek * KCAL_PER_KG) / 7;
}

/**
 * Calorie goals for all offered weekly changes.
 * @param maintenanceKcal total daily energy expenditure
 * @returns one goal per weekly change, biggest loss first
 */
export function calorieGoals(maintenanceKcal: number): CalorieGoal[] {
    return WEEKLY_CHANGES.map((kgPerWeek) => ({ kgPerWeek, kcal: caloriesForChange(maintenanceKcal, kgPerWeek) }));
}
