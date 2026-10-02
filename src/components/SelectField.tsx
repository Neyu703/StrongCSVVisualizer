import { Field } from "./Field";
import type { SegmentOption } from "./SegmentedControl";
import styles from "./SelectField.module.scss";

interface SelectFieldProps<Value extends string> {
    label: string;
    options: SegmentOption<Value>[];
    value: Value;
    onChange: (value: Value) => void;
}

/** Labeled dropdown for choices with too many or too long options for a segmented control. */
export function SelectField<Value extends string>({ label, options, value, onChange }: SelectFieldProps<Value>) {
    return (
        <Field label={label}>
            <select value={value} onChange={(event) => onChange(event.target.value as Value)}>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <svg className={styles.chevron} viewBox="0 0 12 8" aria-hidden="true">
                <path d="M1 1.5l5 5 5-5" />
            </svg>
        </Field>
    );
}
