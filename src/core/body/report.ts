import { bmi, bmiCategory, bmiPrime, healthyWeightRange, ponderalIndex } from "./bmi";
import type { BmiCategory } from "./bmi";
import { bmiBodyFat, bodyFatCategory, bodyMassSplit, fatToIdeal, idealBodyFat, navyBodyFat } from "./bodyFat";
import type { BodyFatCategory } from "./bodyFat";
import { LEAN_MASS_FORMULAS, WAIST_TO_HEIGHT_LIMIT, WAIST_TO_HIP_LIMIT, bodySurfaceArea, ffmi, leanMass, ratio } from "./composition";
import type { LeanMassFormula } from "./composition";
import { BMR_FORMULAS, bmr, calorieGoals, tdee } from "./energy";
import type { BmrFormula, BmrInput, CalorieGoal } from "./energy";
import { idealWeights } from "./idealWeight";
import type { IdealWeightFormula } from "./idealWeight";
import { macros, waterNeed } from "./nutrition";
import type { Macros } from "./nutrition";
import { planWeight } from "./planner";
import type { WeightPlan } from "./planner";
import { allPositive, recordOf } from "./math";
import { MEASUREMENT_FIELDS } from "./profile";
import type { BodyProfile, MeasurementField } from "./profile";
import { heartRateZones, maxHeartRate } from "./training";

/** Where the body fat value used for further results comes from. */
export type BodyFatSource = "measured" | "navy" | "bmi";

export interface BmiResult {
    value: number;
    category: BmiCategory;
    prime: number;
    ponderal: number;
    /** Weights with a normal BMI at this height, in kg. */
    healthyRange: [number, number];
}

export interface BodyFatResult {
    navy: number | null;
    bmiMethod: number | null;
    /** The value used for category, masses and lean-mass-based formulas. */
    percent: number;
    source: BodyFatSource;
    category: BodyFatCategory;
    fatKg: number;
    leanKg: number;
    idealPercent: number;
    fatToIdealKg: number;
}

export interface RatioResult {
    value: number;
    elevated: boolean;
}

/** All results of the body calculators for one profile; null where inputs are missing. */
export interface BodyReport {
    bmi: BmiResult | null;
    bodyFat: BodyFatResult | null;
    idealWeights: Record<IdealWeightFormula, number> | null;
    leanMass: Record<LeanMassFormula, number | null>;
    ffmi: { value: number; normalized: number } | null;
    waistToHeight: RatioResult | null;
    waistToHip: RatioResult | null;
    bodySurfaceArea: { mosteller: number; duBois: number } | null;
    bmr: Record<BmrFormula, number | null>;
    /** Daily expenditure with the chosen formula and activity. */
    maintenance: number | null;
    calorieGoals: CalorieGoal[];
    /** Daily target the macros are based on: the plan's first week, otherwise maintenance. */
    targetKcal: number | null;
    macros: Macros | null;
    waterMl: number | null;
    maxHeartRate: { fox: number; tanaka: number } | null;
    /** Karvonen zones based on the Tanaka maximum. */
    heartRateZones: [number, number][] | null;
    plan: WeightPlan | null;
}

/**
 * BMI and its derived figures.
 * @param weightKg body weight
 * @param heightCm height
 * @returns the BMI result, null for missing input
 */
function bmiResult(weightKg: number, heightCm: number): BmiResult | null {
    const value = bmi(weightKg, heightCm);
    if (value === null) {
        return null;
    }
    return {
        value,
        category: bmiCategory(value),
        prime: bmiPrime(value),
        ponderal: ponderalIndex(weightKg, heightCm)!,
        healthyRange: healthyWeightRange(heightCm)!,
    };
}

/**
 * Body fat from a measurement or the best available estimate (Navy before BMI method), with derived masses.
 * @param profile body profile
 * @param body measurements as numbers
 * @param bmiValue BMI, null when unknown
 * @returns the body fat result, null when no value is available
 */
function bodyFatResult(profile: BodyProfile, body: Record<MeasurementField, number>, bmiValue: number | null): BodyFatResult | null {
    const navy = navyBodyFat({ sex: profile.sex, ...body });
    const bmiMethod = bmiValue === null ? null : bmiBodyFat(profile.sex, bmiValue, body.age);
    const candidates: [BodyFatSource, number | null][] = [
        ["measured", profile.bodyFatPercent],
        ["navy", navy],
        ["bmi", bmiMethod],
    ];
    const chosen = candidates.find(([, percent]) => percent !== null);
    if (!chosen || !allPositive(body.weightKg)) {
        return null;
    }
    const [source, percent] = chosen as [BodyFatSource, number];
    const idealPercent = idealBodyFat(profile.sex, body.age);
    const { fatKg, leanKg } = bodyMassSplit(body.weightKg, percent);
    return {
        navy,
        bmiMethod,
        percent,
        source,
        category: bodyFatCategory(profile.sex, percent),
        fatKg,
        leanKg,
        idealPercent,
        fatToIdealKg: fatToIdeal(body.weightKg, percent, idealPercent),
    };
}

/**
 * Ratio with its risk flag.
 * @param numerator first length
 * @param denominator second length
 * @param limit ratio from which risk counts as elevated
 * @returns the ratio result, null for missing input
 */
function ratioResult(numerator: number, denominator: number, limit: number): RatioResult | null {
    const value = ratio(numerator, denominator);
    return value === null ? null : { value, elevated: value >= limit };
}

/**
 * Computes every body calculator result for a profile.
 * @param profile body profile
 * @param now start date of the weight plan
 * @returns all results
 */
export function bodyReport(profile: BodyProfile, now: Date): BodyReport {
    // Empty fields become NaN, which every calculator treats as missing
    const body = recordOf(MEASUREMENT_FIELDS, (field) => profile[field] ?? NaN);
    const bmiValues = bmiResult(body.weightKg, body.heightCm);
    const bodyFat = bodyFatResult(profile, body, bmiValues?.value ?? null);
    const bmrInputAt = (weightKg: number): BmrInput => ({
        sex: profile.sex,
        age: body.age,
        weightKg,
        heightCm: body.heightCm,
        leanMassKg: bodyFat ? bodyMassSplit(weightKg, bodyFat.percent).leanKg : NaN,
    });
    const bmrValues = recordOf(BMR_FORMULAS, (formula) => bmr(formula, bmrInputAt(body.weightKg)));
    const chosenBmr = bmrValues[profile.bmrFormula];
    const maintenance = chosenBmr === null ? null : tdee(chosenBmr, profile.activity);
    const plan =
        maintenance === null
            ? null
            : planWeight({
                  sex: profile.sex,
                  heightCm: body.heightCm,
                  currentKg: body.weightKg,
                  goalKg: body.goalWeightKg,
                  kgPerWeek: profile.kgPerWeek,
                  maintenanceAt: (weightKg) => tdee(bmr(profile.bmrFormula, bmrInputAt(weightKg))!, profile.activity),
                  now,
              });
    const targetKcal = plan ? plan.points[0].kcal : maintenance;
    const maxHr = maxHeartRate(body.age);
    return {
        bmi: bmiValues,
        bodyFat,
        idealWeights: idealWeights(profile.sex, body.heightCm),
        leanMass: recordOf(LEAN_MASS_FORMULAS, (formula) => leanMass(formula, profile.sex, body.weightKg, body.heightCm)),
        ffmi: bodyFat ? ffmi(bodyFat.leanKg, body.heightCm) : null,
        waistToHeight: ratioResult(body.waistCm, body.heightCm, WAIST_TO_HEIGHT_LIMIT),
        waistToHip: ratioResult(body.waistCm, body.hipCm, WAIST_TO_HIP_LIMIT[profile.sex]),
        bodySurfaceArea: bodySurfaceArea(body.weightKg, body.heightCm),
        bmr: bmrValues,
        maintenance,
        calorieGoals: maintenance === null ? [] : calorieGoals(maintenance),
        targetKcal,
        macros: targetKcal === null ? null : macros(targetKcal, body.weightKg, profile.proteinPerKg, profile.fatShare),
        waterMl: allPositive(body.weightKg) ? waterNeed(body.weightKg) : null,
        maxHeartRate: maxHr,
        heartRateZones: maxHr ? heartRateZones(maxHr.tanaka, body.restingHeartRate) : null,
        plan,
    };
}
