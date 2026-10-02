import styles from "./StatTile.module.scss";

interface StatTileProps {
    label: string;
    value: string;
    /** Optional line below the value, e.g. a class name. */
    detail?: string;
    /** CSS color of a dot before the detail. */
    detailColor?: string;
}

/** Key figure card: small caption above a large value, optionally with a detail line. */
export function StatTile({ label, value, detail, detailColor }: StatTileProps) {
    return (
        <div className={styles.tile}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
            {detail && (
                <span className={styles.detail}>
                    {detailColor && <span className={styles.dot} style={{ background: detailColor }} />}
                    {detail}
                </span>
            )}
        </div>
    );
}
