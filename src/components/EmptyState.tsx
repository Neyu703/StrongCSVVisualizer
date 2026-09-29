import styles from "./EmptyState.module.scss";

interface EmptyStateProps {
    title: string;
    text: string;
}

/** Centered placeholder for screens without data. */
export function EmptyState({ title, text }: EmptyStateProps) {
    return (
        <div className={styles.empty}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.text}>{text}</p>
        </div>
    );
}
