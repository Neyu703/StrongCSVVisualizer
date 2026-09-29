import type { ReactNode } from "react";
import styles from "./StatGrid.module.scss";

interface StatGridProps {
    /** StatTile elements. */
    children: ReactNode;
}

/** Two-column grid of key figure tiles. */
export function StatGrid({ children }: StatGridProps) {
    return <div className={styles.grid}>{children}</div>;
}
