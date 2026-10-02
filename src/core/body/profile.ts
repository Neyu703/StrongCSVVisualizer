import { loadJson } from "../storage";
import type { StorageLike } from "../storage";
import { ACTIVITY_LEVELS, BMR_FORMULAS } from "./energy";
import type { ActivityLevel, BmrFormula } from "./energy";
import { bySex, isInRange } from "./math";
import type { Sex } from "./math";
import type { EnergyUnit, UnitSystem } from "./units";

/** Measurements of the body profile, metric; null while the field is empty. */
export interface BodyMeasurements {
    age: number | null;
    heightCm: number | null;
    weightKg: number | null;
    neckCm: number | null;
    waistCm: number | null;
    hipCm: number | null;
    restingHeartRate: number | null;
    /** Measured body fat in %; replaces the estimates when set. */
    bodyFatPercent: number | null;
    goalWeightKg: number | null;
}

/** Everything the body calculators need, stored separately from the training data. */
export interface BodyProfile extends BodyMeasurements {
    sex: Sex;
    activity: ActivityLevel;
    bmrFormula: BmrFormula;
    units: UnitSystem;
    energyUnit: EnergyUnit;
    /** Protein in g per kg body weight. */
    proteinPerKg: number;
    /** Fat share of the daily calories (0–1). */
    fatShare: number;
    /** Planned weight change per week in kg (always positive). */
    kgPerWeek: number;
}

export type MeasurementField = keyof BodyMeasurements;

export const BODY_PROFILE_KEY = "strong-pro-body-v1";

/** Plausible metric range (inclusive) of each measurement; age in years, heart rate in bpm, body fat in %. */
export const MEASUREMENT_RANGES: Record<MeasurementField, readonly [number, number]> = {
    age: [15, 100],
    heightCm: [100, 275],
    weightKg: [30, 300],
    neckCm: [20, 70],
    waistCm: [40, 200],
    hipCm: [50, 200],
    restingHeartRate: [30, 120],
    bodyFatPercent: [2, 70],
    goalWeightKg: [30, 300],
};

export const MEASUREMENT_FIELDS = Object.keys(MEASUREMENT_RANGES) as MeasurementField[];

/** Allowed values of the choice fields. */
const CHOICES: Record<string, readonly string[]> = {
    sex: ["male", "female"],
    activity: ACTIVITY_LEVELS,
    bmrFormula: BMR_FORMULAS,
    units: ["metric", "imperial"],
    energyUnit: ["kcal", "kJ"],
};

/** Inclusive ranges of the numeric settings. */
export const SETTING_RANGES = {
    proteinPerKg: [0.8, 2.2],
    fatShare: [0.2, 0.4],
    kgPerWeek: [0.25, 1],
} satisfies Partial<Record<keyof BodyProfile, readonly [number, number]>>;

/**
 * Starting profile before the user enters anything: typical adult values so every result shows right away.
 * @param sex sex to start with (taken from the 3D model setting)
 * @param units unit system to start with (taken from the imported weight unit)
 * @returns a complete profile
 */
export function defaultProfile(sex: Sex, units: UnitSystem): BodyProfile {
    return {
        sex,
        age: 30,
        heightCm: bySex(sex, 180, 166),
        weightKg: bySex(sex, 80, 64),
        neckCm: bySex(sex, 38, 32),
        waistCm: bySex(sex, 86, 72),
        hipCm: bySex(sex, 98, 98),
        restingHeartRate: null,
        bodyFatPercent: null,
        goalWeightKg: null,
        activity: "moderate",
        bmrFormula: "mifflin",
        units,
        energyUnit: "kcal",
        proteinPerKg: 1.8,
        fatShare: 0.25,
        kgPerWeek: 0.5,
    };
}

/**
 * Checks that parsed JSON is an object that may hold a profile.
 * @param value parsed JSON
 * @returns true for non-null objects
 */
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

/**
 * Keeps only the stored fields that have a valid value, so older or damaged data cannot break the profile.
 * @param stored stored object
 * @returns the valid subset
 */
function validProfile(stored: Record<string, unknown>): Partial<BodyProfile> {
    const measurements = MEASUREMENT_FIELDS.filter((field) => stored[field] === null || isInRange(stored[field], MEASUREMENT_RANGES[field]));
    const choices = Object.entries(CHOICES).filter(([field, allowed]) => allowed.includes(stored[field] as string));
    const settings = Object.entries(SETTING_RANGES).filter(([field, range]) => isInRange(stored[field], range));
    const validFields = [...measurements, ...choices.map(([field]) => field), ...settings.map(([field]) => field)];
    return Object.fromEntries(validFields.map((field) => [field, stored[field]]));
}

/**
 * Reads the stored profile; missing, corrupt or invalid fields fall back to the given defaults.
 * @param storage browser storage
 * @param fallback profile to use where nothing valid is stored
 * @returns the profile
 */
export function loadProfile(storage: StorageLike, fallback: BodyProfile): BodyProfile {
    const stored = loadJson(storage, BODY_PROFILE_KEY, isObject);
    return { ...fallback, ...(stored && validProfile(stored)) };
}

/**
 * Stores the profile. A failure is ignored on purpose: the calculators still work for this session.
 * @param storage browser storage
 * @param profile profile to store
 */
export function saveProfile(storage: StorageLike, profile: BodyProfile): void {
    try {
        storage.setItem(BODY_PROFILE_KEY, JSON.stringify(profile));
    } catch {
        // Not worth interrupting the user; the profile simply resets on the next visit
    }
}
