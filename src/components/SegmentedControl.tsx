import styles from "./SegmentedControl.module.scss";

export interface SegmentOption<Value extends string> {
    value: Value;
    label: string;
}

interface SegmentedControlProps<Value extends string> {
    options: SegmentOption<Value>[];
    value: Value;
    onChange: (value: Value) => void;
    /** Accessible name of the group. */
    label: string;
}

/** iOS-style segmented control for choosing one of a few options. */
export function SegmentedControl<Value extends string>({
    options,
    value,
    onChange,
    label,
}: SegmentedControlProps<Value>) {
    return (
        <div className={styles.control} role="radiogroup" aria-label={label}>
            {options.map((option) => (
                <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={option.value === value}
                    className={styles.segment}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
