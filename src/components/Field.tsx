import type { ReactNode } from "react";
import styles from "./Field.module.scss";

interface FieldProps {
    label: string;
    /** Unit or value text inside the control, e.g. "kg". */
    suffix?: string;
    error?: string;
    /** Without the filled box, e.g. for sliders. */
    bare?: boolean;
    /** The input, select or slider. */
    children: ReactNode;
}

/** Labeled form control with optional unit inside the box and an error message below it. */
export function Field({ label, suffix, error, bare = false, children }: FieldProps) {
    const controlClass = [bare ? styles.bare : styles.control, error ? styles.invalid : ""].join(" ");
    return (
        <label className={styles.field}>
            <span className={styles.label}>{label}</span>
            <span className={controlClass}>
                {children}
                {suffix && <span className={styles.suffix}>{suffix}</span>}
            </span>
            {error && (
                <span className={styles.error}>
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                        <circle cx="8" cy="8" r="7" />
                        <path d="M8 4.5v4.5M8 11.2v.3" />
                    </svg>
                    {error}
                </span>
            )}
        </label>
    );
}
