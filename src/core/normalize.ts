import type { CsvRow } from "./csv";
import type { WeightUnit, WorkoutSet } from "./types";

const REST_TIMER_MARKER = "Rest Timer";

/** Result of normalizing a parsed CSV. */
export interface NormalizedImport {
    unit: WeightUnit;
    sets: WorkoutSet[];
}

/**
 * Removes a trailing unit suffix from a header name, e.g. "Weight (kg)" → "Weight".
 * @param header raw header name
 * @returns header without "(...)" suffix
 */
function baseName(header: string): string {
    return header.replace(/\s*\(.*\)\s*$/, "");
}

/**
 * Parses a Strong duration: plain seconds ("2520") or "1h 8m" / "42m" / "1h 5m 3s".
 * @param text duration cell
 * @returns duration in seconds, 0 when unparsable
 */
export function parseDuration(text: string): number {
    if (/^\d+$/.test(text)) {
        return Number(text);
    }
    const [, hours, minutes, seconds] = /^(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?$/.exec(text.trim()) ?? [];
    return Number(hours ?? 0) * 3600 + Number(minutes ?? 0) * 60 + Number(seconds ?? 0);
}

/**
 * Parses a numeric cell, accepting a decimal comma.
 * @param text cell content
 * @returns the number, 0 when empty or invalid
 */
function parseNumber(text: string): number {
    const value = Number(text.replace(",", "."));
    return Number.isFinite(value) ? value : 0;
}

/** Raw header name of each base column, e.g. "Weight" → "Weight (kg)". */
type ColumnHeaders = Map<string, string>;

/**
 * Reads the weight unit from the "Weight (kg|lb)" header; the legacy export has none (kg).
 * @param weightHeader raw header of the weight column
 * @returns detected unit
 */
function detectUnit(weightHeader: string | undefined): WeightUnit {
    return weightHeader?.toLowerCase().includes("lb") ? "lb" : "kg";
}

/**
 * Converts one CSV row into a set.
 * @param row row keyed by raw header names
 * @param columns raw header per base column
 * @param distanceDivisor 1000 when the export gives meters, 1 for kilometers
 * @returns normalized set
 */
function toWorkoutSet(row: CsvRow, columns: ColumnHeaders, distanceDivisor: number): WorkoutSet {
    const text = (column: string): string => row[columns.get(column) ?? ""] ?? "";
    return {
        date: text("Date"),
        workout: text("Workout Name"),
        duration: parseDuration(text("Duration")),
        exercise: text("Exercise Name").trim(),
        setOrder: text("Set Order"),
        weight: parseNumber(text("Weight")),
        reps: parseNumber(text("Reps")),
        distance: parseNumber(text("Distance")) / distanceDivisor,
        seconds: parseNumber(text("Seconds")),
        rpe: text("RPE") === "" ? null : parseNumber(text("RPE")),
        notes: text("Notes"),
        workoutNotes: text("Workout Notes"),
    };
}

/**
 * Normalizes parsed Strong CSV rows (old and new export format) into sets; Rest Timer rows are dropped.
 * @param rows rows from parseCsv
 * @returns unit and sets
 * @throws Error when the rows do not look like a Strong export
 */
export function normalizeRows(rows: CsvRow[]): NormalizedImport {
    const columns: ColumnHeaders = new Map(Object.keys(rows[0] ?? {}).map((header) => [baseName(header), header]));
    if (!columns.has("Date") || !columns.has("Exercise Name")) {
        throw new Error("Das ist keine Strong-CSV (Spalten „Date“ und „Exercise Name“ fehlen).");
    }

    const distanceDivisor = /meter/i.test(columns.get("Distance") ?? "") ? 1000 : 1;
    const setOrderHeader = columns.get("Set Order") ?? "";
    const sets = rows
        .filter((row) => row[setOrderHeader] !== REST_TIMER_MARKER)
        .map((row) => toWorkoutSet(row, columns, distanceDivisor));
    return { unit: detectUnit(columns.get("Weight")), sets };
}
