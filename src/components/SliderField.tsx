import type { CSSProperties } from "react";
import { Field } from "./Field";
import styles from "./SliderField.module.scss";

interface SliderFieldProps {
    label: string;
    value: number;
    range: readonly [number, number];
    step: number;
    /** Current value as shown next to the slider. */
    valueText: string;
    onChange: (value: number) => void;
}

/** Labeled range slider with a filled track and its current value. */
export function SliderField({ label, value, range, step, valueText, onChange }: SliderFieldProps) {
    const filledPercent = ((value - range[0]) / (range[1] - range[0])) * 100;
    return (
        <Field label={label} suffix={valueText} bare>
            <input
                type="range"
                className={styles.slider}
                style={{ "--filled": `${filledPercent}%` } as CSSProperties}
                min={range[0]}
                max={range[1]}
                step={step}
                value={value}
                onChange={(event) => onChange(Number(event.target.value))}
            />
        </Field>
    );
}
