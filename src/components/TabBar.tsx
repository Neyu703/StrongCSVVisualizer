import type { ReactNode } from "react";
import styles from "./TabBar.module.scss";

export interface TabItem<Id extends string> {
    id: Id;
    label: string;
    icon: ReactNode;
}

interface TabBarProps<Id extends string> {
    tabs: TabItem<Id>[];
    active: Id;
    onSelect: (id: Id) => void;
}

/** Bottom tab bar with translucent material background. */
export function TabBar<Id extends string>({ tabs, active, onSelect }: TabBarProps<Id>) {
    return (
        <nav className={styles.bar} aria-label="Hauptnavigation">
            <div className={styles.inner}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        className={styles.tab}
                        aria-current={tab.id === active ? "page" : undefined}
                        onClick={() => onSelect(tab.id)}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            {tab.icon}
                        </svg>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
}
