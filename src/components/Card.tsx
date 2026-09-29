import type { ReactNode } from "react";
import styles from "./Card.module.scss";

interface CardProps {
    title: string;
    children: ReactNode;
}

/** Rounded content card with a headline. */
export function Card({ title, children }: CardProps) {
    return (
        <section className={styles.card}>
            <h2 className={styles.title}>{title}</h2>
            {children}
        </section>
    );
}
