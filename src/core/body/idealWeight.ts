import { allPositive, recordOf } from "./math";
import type { Sex } from "./math";
import { CM_PER_INCH } from "./units";

export type IdealWeightFormula = "robinson" | "miller" | "devine" | "hamwi";

/** Base weight at 5 ft and kg per further inch: [men, women]. */
const FORMULAS: Record<IdealWeightFormula, Record<Sex, [number, number]>> = {
    robinson: { male: [52, 1.9], female: [49, 1.7] },
    miller: { male: [56.2, 1.41], female: [53.1, 1.36] },
    devine: { male: [50, 2.3], female: [45.5, 2.3] },
    hamwi: { male: [48, 2.7], female: [45.5, 2.2] },
};

export const IDEAL_WEIGHT_FORMULAS = Object.keys(FORMULAS) as IdealWeightFormula[];

const FIVE_FEET_IN_INCHES = 60;

/**
 * Ideal body weight after the four classic height formulas.
 * @param sex male or female
 * @param heightCm height
 * @returns kg per formula, null for missing height
 */
export function idealWeights(sex: Sex, heightCm: number): Record<IdealWeightFormula, number> | null {
    if (!allPositive(heightCm)) {
        return null;
    }
    const inchesOverFiveFeet = heightCm / CM_PER_INCH - FIVE_FEET_IN_INCHES;
    const weightOf = (formula: IdealWeightFormula) => {
        const [baseKg, kgPerInch] = FORMULAS[formula][sex];
        return baseKg + kgPerInch * inchesOverFiveFeet;
    };
    return recordOf(IDEAL_WEIGHT_FORMULAS, weightOf);
}
