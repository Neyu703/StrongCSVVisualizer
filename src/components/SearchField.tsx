import styles from "./SearchField.module.scss";

interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    /** Accessible name describing what is searched. */
    label: string;
}

/** iOS-style search input. */
export function SearchField({ value, onChange, label }: SearchFieldProps) {
    return (
        <input
            type="search"
            className={styles.search}
            placeholder="Suchen"
            aria-label={label}
            value={value}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}
