import type { SegmentOption } from "../../components/SegmentedControl";
import type { BmiCategory } from "../../core/body/bmi";
import type { BodyFatCategory } from "../../core/body/bodyFat";
import type { LeanMassFormula } from "../../core/body/composition";
import type { ActivityLevel, BmrFormula } from "../../core/body/energy";
import type { IdealWeightFormula } from "../../core/body/idealWeight";
import type { Macros } from "../../core/body/nutrition";
import type { Sex } from "../../core/body/math";
import type { BodyFatSource } from "../../core/body/report";
import type { OneRepMaxFormula } from "../../core/body/training";
import type { EnergyUnit, UnitSystem } from "../../core/body/units";

/** Shown instead of a result whose inputs are missing. */
export const MISSING = "–";

/**
 * Formats an optional result.
 * @param value result, null when inputs are missing
 * @param render formatter for an available result
 * @returns the formatted result or a dash
 */
export function orMissing<Value>(value: Value | null, render: (value: Value) => string): string {
    return value === null ? MISSING : render(value);
}

export const SEX_OPTIONS: SegmentOption<Sex>[] = [
    { value: "male", label: "Männlich" },
    { value: "female", label: "Weiblich" },
];

export const UNIT_OPTIONS: SegmentOption<UnitSystem>[] = [
    { value: "metric", label: "Metrisch" },
    { value: "imperial", label: "Imperial" },
];

export const ENERGY_OPTIONS: SegmentOption<EnergyUnit>[] = [
    { value: "kcal", label: "kcal" },
    { value: "kJ", label: "kJ" },
];

export const ACTIVITY_OPTIONS: SegmentOption<ActivityLevel>[] = [
    { value: "sedentary", label: "Kaum aktiv – wenig oder kein Sport" },
    { value: "light", label: "Leicht aktiv – Sport 1–3× pro Woche" },
    { value: "moderate", label: "Mäßig aktiv – Sport 4–5× pro Woche" },
    { value: "active", label: "Aktiv – täglich Sport oder 3–4× intensiv" },
    { value: "veryActive", label: "Sehr aktiv – 6–7× pro Woche intensiv" },
    { value: "extreme", label: "Extrem aktiv – täglich sehr intensiv oder körperliche Arbeit" },
];

export const BMR_LABELS: Record<BmrFormula, string> = {
    mifflin: "Mifflin-St Jeor",
    harris: "Harris-Benedict (rev.)",
    katch: "Katch-McArdle",
};

export const MACRO_LABELS: Record<keyof Macros, string> = {
    proteinG: "Protein",
    fatG: "Fett",
    carbsG: "Kohlenhydrate",
};

export const BMI_LABELS: Record<BmiCategory, string> = {
    severeThinness: "Starkes Untergewicht",
    moderateThinness: "Mäßiges Untergewicht",
    mildThinness: "Leichtes Untergewicht",
    normal: "Normalgewicht",
    overweight: "Übergewicht",
    obese1: "Adipositas Grad I",
    obese2: "Adipositas Grad II",
    obese3: "Adipositas Grad III",
};

export const BMI_COLORS: Record<BmiCategory, string> = {
    severeThinness: "var(--red)",
    moderateThinness: "var(--orange)",
    mildThinness: "var(--orange)",
    normal: "var(--green)",
    overweight: "var(--orange)",
    obese1: "var(--red)",
    obese2: "var(--red)",
    obese3: "var(--red)",
};

export const BODY_FAT_LABELS: Record<BodyFatCategory, string> = {
    essential: "Essenziell",
    athletes: "Athleten",
    fitness: "Fitness",
    average: "Durchschnitt",
    obese: "Adipös",
};

export const BODY_FAT_COLORS: Record<BodyFatCategory, string> = {
    essential: "var(--orange)",
    athletes: "var(--tint)",
    fitness: "var(--green)",
    average: "var(--orange)",
    obese: "var(--red)",
};

export const BODY_FAT_SOURCE_LABELS: Record<BodyFatSource, string> = {
    measured: "gemessen",
    navy: "US-Navy-Methode",
    bmi: "BMI-Methode",
};

export const IDEAL_WEIGHT_LABELS: Record<IdealWeightFormula, string> = {
    robinson: "Robinson (1983)",
    miller: "Miller (1983)",
    devine: "Devine (1974)",
    hamwi: "Hamwi (1964)",
};

export const LEAN_MASS_LABELS: Record<LeanMassFormula, string> = {
    boer: "Boer",
    james: "James",
    hume: "Hume",
};

export const ONE_REP_MAX_LABELS: Record<OneRepMaxFormula, string> = {
    epley: "Epley (wie Strong)",
    brzycki: "Brzycki",
    lombardi: "Lombardi",
};

export const RACE_LABELS = ["5 km", "10 km", "Halbmarathon", "Marathon"] as const;
