import { parseDate } from "./dates";
import { isAssisted } from "./sets";
import type { WeightUnit, WorkoutSet } from "./types";

/** How a numeric value is shown. */
export type ValueFormat = "weight" | "reps" | "distance" | "time";

/** Named date layouts. */
export type DateStyle = "short" | "medium" | "long";

const LOCALE = "de-DE";

const DAYS_PER_MONTH = 30.44;

const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const DATE_FORMATS: Record<DateStyle, Intl.DateTimeFormat> = {
    short: new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "2-digit" }),
    medium: new Intl.DateTimeFormat(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric" }),
    long: new Intl.DateTimeFormat(LOCALE, { weekday: "short", day: "numeric", month: "short", year: "numeric" }),
};

const COMPACT_FORMAT = new Intl.NumberFormat(LOCALE, { notation: "compact", maximumFractionDigits: 1 });

const numberFormats = new Map<number, Intl.NumberFormat>();

/**
 * Formats a number in German notation.
 * @param value the number
 * @param maxDigits maximum fraction digits
 * @returns e.g. "1.234,5"
 */
export function formatNumber(value: number, maxDigits = 0): string {
    let format = numberFormats.get(maxDigits);
    if (!format) {
        format = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: maxDigits });
        numberFormats.set(maxDigits, format);
    }
    return format.format(value);
}

/**
 * Formats a large number compactly.
 * @param value the number
 * @returns e.g. "1,5 Mio."
 */
export function formatCompact(value: number): string {
    return COMPACT_FORMAT.format(value);
}

/**
 * Formats a weight with its unit.
 * @param value weight
 * @param unit kg or lb
 * @returns e.g. "102,5 kg"
 */
export function formatWeight(value: number, unit: WeightUnit): string {
    return `${formatNumber(value, 1)} ${unit}`;
}

/**
 * Formats seconds as hours/minutes/seconds, showing only the two largest relevant units.
 * @param totalSeconds duration in seconds
 * @returns e.g. "1 Std. 8 Min.", "42 Min.", "45 Sek."
 */
export function formatDuration(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    if (hours > 0) {
        return `${hours} Std. ${minutes} Min.`;
    }
    return minutes > 0 ? `${minutes} Min.` : `${Math.round(totalSeconds)} Sek.`;
}

/**
 * Formats a Strong timestamp or epoch milliseconds as a German date.
 * @param value "YYYY-MM-DD HH:mm:ss" or milliseconds
 * @param style layout
 * @returns e.g. "29.09.2026"
 */
export function formatDate(value: string | number, style: DateStyle): string {
    const date = typeof value === "string" ? parseDate(value) : new Date(value);
    return DATE_FORMATS[style].format(date);
}

/**
 * Formats a value according to its format.
 * @param format weight, reps, distance (km) or time
 * @param value the number
 * @param unit weight unit
 * @returns display text
 */
export function formatValue(format: ValueFormat, value: number, unit: WeightUnit): string {
    switch (format) {
        case "weight":
            return formatWeight(value, unit);
        case "reps":
            return `${formatNumber(value, 1)} Wdh.`;
        case "distance":
            return `${formatNumber(value, 2)} km`;
        case "time":
            return formatDuration(value);
    }
}

/**
 * Describes a trend slope as change per month, e.g. "Trend: +1,4 kg pro Monat".
 * @param slopePerDay fitted change of the metric per day
 * @param format how the metric is shown
 * @param unit weight unit
 * @returns display text with an explicit sign
 */
export function formatTrend(slopePerDay: number, format: ValueFormat, unit: WeightUnit): string {
    const perMonth = slopePerDay * DAYS_PER_MONTH;
    let sign = "±";
    if (perMonth > 0) {
        sign = "+";
    } else if (perMonth < 0) {
        sign = "−";
    }
    return `Trend: ${sign}${formatValue(format, Math.abs(perMonth), unit)} pro Monat`;
}

/**
 * Describes one set the way Strong shows it: "100 kg × 5", "8 Wdh.", "−30 kg × 8" (assisted) or "5 km · 25 Min.".
 * @param set the set
 * @param unit weight unit
 * @returns display text
 */
export function describeSet(set: WorkoutSet, unit: WeightUnit): string {
    if (set.weight === 0 && set.reps === 0) {
        return [
            set.distance > 0 ? formatValue("distance", set.distance, unit) : "",
            set.seconds > 0 ? formatDuration(set.seconds) : "",
        ]
            .filter((part) => part !== "")
            .join(" · ");
    }
    if (set.weight === 0) {
        return formatValue("reps", set.reps, unit);
    }
    const sign = isAssisted(set.exercise) ? "−" : "";
    return `${sign}${formatWeight(set.weight, unit)} × ${formatNumber(set.reps, 1)}`;
}

/**
 * Summarizes an import for the user.
 * @param addedWorkouts number of new workouts
 * @param addedSets number of new sets
 * @returns a German sentence
 */
export function describeImport(addedWorkouts: number, addedSets: number): string {
    if (addedWorkouts === 0) {
        return "Keine neuen Workouts – deine Daten sind bereits aktuell.";
    }
    const workouts = addedWorkouts === 1 ? "1 neues Workout" : `${formatNumber(addedWorkouts)} neue Workouts`;
    return `${workouts} (${formatNumber(addedSets)} Sätze) hinzugefügt.`;
}

/**
 * Describes when the user usually trains, e.g. "Meist Di · meist 18–19 Uhr".
 * @param weekday 0 (Monday) to 6 (Sunday), null without workouts
 * @param hour start hour 0 to 23, null without workouts
 * @returns display text, empty without workouts
 */
export function describeTrainingHabit(weekday: number | null, hour: number | null): string {
    if (weekday === null || hour === null) {
        return "";
    }
    return `Meist ${WEEKDAYS_SHORT[weekday]} · meist ${hour}–${hour + 1} Uhr`;
}
