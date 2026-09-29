import styles from "./ScreenHeader.module.scss";

interface ScreenHeaderProps {
    title: string;
    /** When set, shows a back button with this label. */
    back?: { label: string; onClick: () => void };
}

/** Large-title navigation header with optional back button. */
export function ScreenHeader({ title, back }: ScreenHeaderProps) {
    return (
        <header className={styles.header}>
            {back && (
                <button type="button" className={styles.back} onClick={back.onClick}>
                    <svg viewBox="0 0 12 20" aria-hidden="true">
                        <path d="M10 2L2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {back.label}
                </button>
            )}
            <h1 className={styles.title}>{title}</h1>
        </header>
    );
}
