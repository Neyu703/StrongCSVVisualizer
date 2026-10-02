/** Biological sex, which selects the coefficients of most body formulas. */
export type Sex = "male" | "female";

/**
 * Checks that every input is a usable measurement (finite and above zero); missing inputs arrive as NaN.
 * @param values measurements
 * @returns true when all are positive numbers
 */
export function allPositive(...values: number[]): boolean {
    return values.every((value) => Number.isFinite(value) && value > 0);
}

/**
 * Picks a value per biological sex.
 * @param sex male or female
 * @param male value for men
 * @param female value for women
 * @returns the matching value
 */
export function bySex<Value>(sex: Sex, male: Value, female: Value): Value {
    return sex === "male" ? male : female;
}

/**
 * Builds a record with one computed entry per key, e.g. one result per formula.
 * @param keys record keys
 * @param compute value per key
 * @returns the record
 */
export function recordOf<Key extends string, Value>(keys: readonly Key[], compute: (key: Key) => Value): Record<Key, Value> {
    return Object.fromEntries(keys.map((key) => [key, compute(key)])) as Record<Key, Value>;
}

/**
 * Checks that a value is a number within an inclusive range.
 * @param value value to check
 * @param range lowest and highest allowed value
 * @returns true when inside the range
 */
export function isInRange(value: unknown, [min, max]: readonly [number, number]): value is number {
    return typeof value === "number" && value >= min && value <= max;
}

/** Stretch of a value scale that belongs to one class. */
export interface ScaleSegment<Key extends string> {
    key: Key;
    from: number;
    to: number;
}

/**
 * Turns classes given by their exclusive upper bounds into segments of a scale from min to max.
 * @param classes classes in ascending order with their upper bound
 * @param min start of the scale
 * @param max end of the scale (also caps an open-ended last class)
 * @returns the visible segments, classes outside the scale dropped
 */
export function scaleSegments<Key extends string>(classes: readonly [Key, number][], min: number, max: number): ScaleSegment<Key>[] {
    return classes
        .map(([key, upperBound], index) => ({ key, from: Math.max(min, index === 0 ? min : classes[index - 1][1]), to: Math.min(max, upperBound) }))
        .filter((segment) => segment.to > segment.from);
}
