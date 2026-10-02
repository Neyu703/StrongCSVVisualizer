import { formatNumber } from "../format";
import type { WeightUnit } from "../types";

/** Unit system of the body calculators' inputs and results; calculations always run metric. */
export type UnitSystem = "metric" | "imperial";

export type EnergyUnit = "kcal" | "kJ";

/** Physical quantities shown in the unit system: body weight, body lengths, running distances. */
export type Quantity = "mass" | "length" | "distance";

export const CM_PER_INCH = 2.54;
const KJ_PER_KCAL = 4.184;
const INCHES_PER_FOOT = 12;

/** Metric amount per imperial unit and both unit labels. */
const QUANTITIES: Record<Quantity, { metricPerImperial: number; metric: string; imperial: string }> = {
    mass: { metricPerImperial: 0.45359237, metric: "kg", imperial: "lb" },
    length: { metricPerImperial: CM_PER_INCH, metric: "cm", imperial: "in" },
    distance: { metricPerImperial: 1.609344, metric: "km", imperial: "mi" },
};

/**
 * Maps the weight unit of the imported Strong data to a unit system.
 * @param unit kg or lb
 * @returns metric or imperial
 */
export function unitSystemOf(unit: WeightUnit): UnitSystem {
    return unit === "kg" ? "metric" : "imperial";
}

/**
 * Converts a metric value into the display unit.
 * @param quantity kind of value
 * @param metricValue value in kg, cm or km
 * @param system unit system
 * @returns value in the display unit
 */
export function toDisplay(quantity: Quantity, metricValue: number, system: UnitSystem): number {
    return system === "metric" ? metricValue : metricValue / QUANTITIES[quantity].metricPerImperial;
}

/**
 * Converts a displayed value back to metric.
 * @param quantity kind of value
 * @param displayValue value in the display unit
 * @param system unit system
 * @returns value in kg, cm or km
 */
export function fromDisplay(quantity: Quantity, displayValue: number, system: UnitSystem): number {
    return system === "metric" ? displayValue : displayValue * QUANTITIES[quantity].metricPerImperial;
}

/**
 * Unit label of a quantity.
 * @param quantity kind of value
 * @param system unit system
 * @returns e.g. "kg" or "lb"
 */
export function unitLabel(quantity: Quantity, system: UnitSystem): string {
    return QUANTITIES[quantity][system];
}

/**
 * Formats a metric value in the display unit.
 * @param quantity kind of value
 * @param metricValue value in kg, cm or km
 * @param system unit system
 * @param digits maximum fraction digits
 * @returns e.g. "72,6 kg" or "160,1 lb"
 */
export function formatQuantity(quantity: Quantity, metricValue: number, system: UnitSystem, digits = 1): string {
    return `${formatNumber(toDisplay(quantity, metricValue, system), digits)} ${unitLabel(quantity, system)}`;
}

/**
 * Splits a height into feet and inches (inches rounded to one decimal, so 182.88 cm is 6′ 0″, not 5′ 12″).
 * @param cm height in cm
 * @returns whole feet and the remaining inches
 */
export function cmToFeetInches(cm: number): { feet: number; inches: number } {
    const totalInches = Math.round((cm / CM_PER_INCH) * 10) / 10;
    const feet = Math.floor(totalInches / INCHES_PER_FOOT);
    return { feet, inches: Math.round((totalInches - feet * INCHES_PER_FOOT) * 10) / 10 };
}

/**
 * Joins feet and inches into cm.
 * @param feet whole feet
 * @param inches remaining inches
 * @returns height in cm
 */
export function feetInchesToCm(feet: number, inches: number): number {
    return (feet * INCHES_PER_FOOT + inches) * CM_PER_INCH;
}

/**
 * Formats an energy amount with its unit.
 * @param kcal energy in kcal
 * @param unit kcal or kJ
 * @returns e.g. "1.655 kcal" or "6.925 kJ"
 */
export function formatEnergy(kcal: number, unit: EnergyUnit): string {
    return `${formatNumber(unit === "kcal" ? kcal : kcal * KJ_PER_KCAL)} ${unit}`;
}
