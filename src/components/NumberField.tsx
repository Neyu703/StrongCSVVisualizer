import { useState } from "react";
import { formatNumber } from "../core/format";
import { formatDecimal, parseDecimal } from "../core/body/input";
import { isInRange } from "../core/body/math";
import { Field } from "./Field";

interface NumberFieldProps {
    label: string;
    /** Current value in the shown unit, null when empty. */
    value: number | null;
    /** Receives the typed value, or null while the field is empty or invalid. */
    onChange: (value: number | null) => void;
    unit?: string;
    /** Fraction digits shown when the value changes from outside, e.g. after a unit switch. */
    digits?: number;
    /** Inclusive allowed range in the shown unit. */
    range?: readonly [number, number];
}

/**
 * Tells whether two field values are equal up to float noise from unit conversions.
 * @param first value
 * @param second value
 * @returns true when both are empty or practically the same number
 */
function sameValue(first: number | null, second: number | null): boolean {
    if (first === null || second === null) {
        return first === second;
    }
    return Math.abs(first - second) <= 1e-6 * Math.max(1, Math.abs(first));
}

/** Decimal input that keeps the typed text and reports parsed values; accepts comma or point. */
export function NumberField({ label, value, onChange, unit, digits = 1, range }: NumberFieldProps) {
    const [text, setText] = useState(() => formatDecimal(value, digits));
    const [emitted, setEmitted] = useState(value);

    // Adopt values changed from outside (unit switch, prefill), but not the echo of our own input
    if (!sameValue(value, emitted)) {
        setEmitted(value);
        setText(formatDecimal(value, digits));
    }

    const parsed = parseDecimal(text);
    const invalid = parsed !== null && Number.isNaN(parsed);
    const outOfRange = parsed !== null && !invalid && range !== undefined && !isInRange(parsed, range);
    const error = invalid
        ? "Keine gültige Zahl"
        : outOfRange
          ? `Erlaubt: ${formatNumber(range[0], digits)}–${formatNumber(range[1], digits)}`
          : undefined;

    const change = (nextText: string) => {
        const next = parseDecimal(nextText);
        const usable = next !== null && !Number.isNaN(next) && (range === undefined || isInRange(next, range)) ? next : null;
        setText(nextText);
        setEmitted(usable);
        onChange(usable);
    };

    return (
        <Field label={label} suffix={unit} error={error}>
            <input type="text" inputMode="decimal" value={text} aria-invalid={error !== undefined} onChange={(event) => change(event.target.value)} />
        </Field>
    );
}
