/** Daily macronutrients in grams and the energy each provides. */
export interface Macros {
    proteinG: number;
    fatG: number;
    carbsG: number;
}

/** Energy per gram of each macronutrient. */
export const KCAL_PER_GRAM: Record<keyof Macros, number> = { proteinG: 4, fatG: 9, carbsG: 4 };

/** Daily water need per kg body weight, in ml. */
const WATER_ML_PER_KG = 35;

/**
 * Splits a calorie budget: protein per kg body weight, fat as a share of the calories, carbs fill the rest.
 * @param kcal daily calories
 * @param weightKg body weight
 * @param proteinPerKg protein in g per kg body weight
 * @param fatShare fat share of the calories (0–1)
 * @returns grams per macronutrient; carbs never drop below 0
 */
export function macros(kcal: number, weightKg: number, proteinPerKg: number, fatShare: number): Macros {
    const proteinG = weightKg * proteinPerKg;
    const fatKcal = kcal * fatShare;
    const carbsKcal = Math.max(0, kcal - proteinG * KCAL_PER_GRAM.proteinG - fatKcal);
    return { proteinG, fatG: fatKcal / KCAL_PER_GRAM.fatG, carbsG: carbsKcal / KCAL_PER_GRAM.carbsG };
}

/**
 * Daily water need.
 * @param weightKg body weight
 * @returns ml per day
 */
export function waterNeed(weightKg: number): number {
    return weightKg * WATER_ML_PER_KG;
}
