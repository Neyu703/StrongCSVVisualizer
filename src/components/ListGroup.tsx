import type { ReactNode } from "react";
import styles from "./ListGroup.module.scss";

interface ListGroupProps {
    header?: string;
    footer?: string;
    children: ReactNode;
}

/** Inset grouped list with optional section header and footer. */
export function ListGroup({ header, footer, children }: ListGroupProps) {
    return (
        <section className={styles.group}>
            {header && <h2 className={styles.header}>{header}</h2>}
            <ul className={styles.list}>{children}</ul>
            {footer && <p className={styles.footer}>{footer}</p>}
        </section>
    );
}

interface SwitchRowProps {
    title: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

/** List row with an iOS-style on/off switch. */
export function SwitchRow({ title, checked, onChange }: SwitchRowProps) {
    return (
        <li>
            <label className={styles.row}>
                <span className={styles.text}>
                    <span className={styles.title}>{title}</span>
                </span>
                <input
                    type="checkbox"
                    role="switch"
                    className={styles.switch}
                    checked={checked}
                    onChange={(event) => onChange(event.target.checked)}
                />
            </label>
        </li>
    );
}

interface ListRowProps {
    title: string;
    subtitle?: string;
    value?: string;
    leading?: ReactNode;
    /** Makes the row tappable (shows a chevron unless destructive). */
    onClick?: () => void;
    destructive?: boolean;
}

/** One row of a ListGroup. */
export function ListRow({ title, subtitle, value, leading, onClick, destructive = false }: ListRowProps) {
    const content = (
        <>
            {leading && <span className={styles.leading}>{leading}</span>}
            <span className={styles.text}>
                <span className={styles.title}>{title}</span>
                {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </span>
            {value && <span className={styles.value}>{value}</span>}
            {onClick && !destructive && (
                <svg className={styles.chevron} viewBox="0 0 8 14" aria-hidden="true">
                    <path d="M1 1l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            )}
        </>
    );

    return (
        <li>
            {onClick ? (
                <button
                    type="button"
                    className={destructive ? styles.destructiveRow : styles.actionRow}
                    onClick={onClick}
                >
                    {content}
                </button>
            ) : (
                <div className={styles.row}>{content}</div>
            )}
        </li>
    );
}
