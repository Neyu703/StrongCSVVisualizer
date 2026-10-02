import type { ColoredSegment } from "./Gauge";
import styles from "./RangeScale.module.scss";

export interface LabeledSegment extends ColoredSegment {
    label: string;
    /** Value range of the class, e.g. "6–14 %". */
    rangeText: string;
}

interface RangeScaleProps {
    segments: LabeledSegment[];
    min: number;
    max: number;
    value: number;
    /** Accessible description of the marked value. */
    valueText: string;
}

/** Horizontal bar of colored class segments with a marker at the current value. */
export function RangeScale({ segments, min, max, value, valueText }: RangeScaleProps) {
    const percentOf = (scaleValue: number) => ((Math.min(Math.max(scaleValue, min), max) - min) / (max - min)) * 100;
    return (
        <figure className={styles.scale} role="img" aria-label={valueText}>
            <div className={styles.bar}>
                {segments.map((segment) => (
                    <span key={segment.key} className={styles.segment} style={{ flexGrow: segment.to - segment.from, background: segment.color }} />
                ))}
                <span className={styles.marker} style={{ left: `${percentOf(value)}%` }} />
            </div>
            <div className={styles.labels} aria-hidden="true">
                {segments.map((segment) => (
                    <span key={segment.key} style={{ flexGrow: segment.to - segment.from }}>
                        <span className={styles.name}>{segment.label}</span>
                        {segment.rangeText}
                    </span>
                ))}
            </div>
        </figure>
    );
}
