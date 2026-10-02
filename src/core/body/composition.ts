import { allPositive } from "./math";
import type { Sex } from "./math";

export type LeanMassFormula = "boer" | "james" | "hume";

export const LEAN_MASS_FORMULAS: readonly LeanMassFormula[] = ["boer", "james", "hume"];

/** Waist-to-height ratio from which health risk counts as elevated. */
export const WAIST_TO_HEIGHT_LIMIT = 0.5;

/** WHO waist-to-hip ratio from which health risk counts as elevated. */
export const WAIST_TO_HIP_LIMIT: Record<Sex, number> = { male: 0.9, female: 0.85 };

/** Height of the reference man the normalized FFMI is scaled to, in m. */
const FFMI_REFERENCE_HEIGHT = 1.8;

/**
 * Lean body mass after one of the weight/height formulas.
 * @param formula Boer, James or Hume
 * @param sex male or female
 * @param weightKg body weight
 * @param heightCm height
 * @returns kg, null for missing input
 */
export function leanMass(formula: LeanMassFormula, sex: Sex, weightKg: number, heightCm: number): number | null {
    if (!allPositive(weightKg, heightCm)) {
        return null;
    }
    const male = sex === "male";
    switch (formula) {
        case "boer":
            return male ? 0.407 * weightKg + 0.267 * heightCm - 19.2 : 0.252 * weightKg + 0.473 * heightCm - 48.3;
        case "james":
            return male
                ? 1.1 * weightKg - 128 * (weightKg / heightCm) ** 2
                : 1.07 * weightKg - 148 * (weightKg / heightCm) ** 2;
        case "hume":
            return male
                ? 0.3281 * weightKg + 0.33929 * heightCm - 29.5336
                : 0.29569 * weightKg + 0.41813 * heightCm - 43.2933;
    }
}

/**
 * Fat-free mass index and its value scaled to a 1.80 m reference height.
 * @param leanKg lean mass
 * @param heightCm height
 * @returns FFMI and normalized FFMI in kg/m², null for missing input
 */
export function ffmi(leanKg: number, heightCm: number): { value: number; normalized: number } | null {
    if (!allPositive(leanKg, heightCm)) {
        return null;
    }
    const heightM = heightCm / 100;
    const value = leanKg / heightM ** 2;
    return { value, normalized: value + 6.1 * (FFMI_REFERENCE_HEIGHT - heightM) };
}

/**
 * Ratio of two lengths, e.g. waist to height.
 * @param numerator first length
 * @param denominator second length
 * @returns the ratio, null for missing input
 */
export function ratio(numerator: number, denominator: number): number | null {
    return allPositive(numerator, denominator) ? numerator / denominator : null;
}

/**
 * Body surface area after Mosteller and Du Bois.
 * @param weightKg body weight
 * @param heightCm height
 * @returns m² per formula, null for missing input
 */
export function bodySurfaceArea(weightKg: number, heightCm: number): { mosteller: number; duBois: number } | null {
    if (!allPositive(weightKg, heightCm)) {
        return null;
    }
    return {
        mosteller: Math.sqrt((weightKg * heightCm) / 3600),
        duBois: 0.007184 * weightKg ** 0.425 * heightCm ** 0.725,
    };
}
