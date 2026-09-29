import styles from "./StatTile.module.scss";

interface StatTileProps {
    label: string;
    value: string;
}

/** Key figure card: small caption above a large value. */
export function StatTile({ label, value }: StatTileProps) {
    return (
        <div className={styles.tile}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
        </div>
    );
}
