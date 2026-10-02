import type { ScaleSegment } from "../core/body/math";
import { formatNumber } from "../core/format";
import styles from "./Gauge.module.scss";

export interface ColoredSegment extends ScaleSegment<string> {
    /** CSS color, e.g. "var(--green)". */
    color: string;
}

interface GaugeProps {
    segments: ColoredSegment[];
    min: number;
    max: number;
    value: number;
    /** Large text in the center, e.g. "22,1". */
    valueText: string;
    /** Smaller text below the value, e.g. the class name. */
    caption: string;
    /** Scale values labeled outside the arc. */
    ticks?: readonly number[];
}

const CENTER_X = 120;
const CENTER_Y = 120;
const RADIUS = 96;
const NEEDLE_LENGTH = 78;
const TICK_RADIUS = 118;

/**
 * Point on the half circle for a scale value (min = left end, max = right end).
 * @param value scale value, clamped to the scale
 * @param min start of the scale
 * @param max end of the scale
 * @param radius distance from the center
 * @returns SVG coordinates
 */
function pointAt(value: number, min: number, max: number, radius: number): [number, number] {
    const share = (Math.min(Math.max(value, min), max) - min) / (max - min);
    const angle = Math.PI * (1 - share);
    return [CENTER_X + radius * Math.cos(angle), CENTER_Y - radius * Math.sin(angle)];
}

/** Half-circle gauge with colored class segments and a needle. */
export function Gauge({ segments, min, max, value, valueText, caption, ticks = [] }: GaugeProps) {
    const [needleX, needleY] = pointAt(value, min, max, NEEDLE_LENGTH);
    return (
        <figure className={styles.gauge}>
            <svg viewBox="-6 -8 252 140" role="img" aria-label={`${valueText}, ${caption}`}>
                {segments.map((segment) => {
                    const [startX, startY] = pointAt(segment.from, min, max, RADIUS);
                    const [endX, endY] = pointAt(segment.to, min, max, RADIUS);
                    return (
                        <path
                            key={segment.key}
                            d={`M ${startX} ${startY} A ${RADIUS} ${RADIUS} 0 0 1 ${endX} ${endY}`}
                            className={styles.segment}
                            stroke={segment.color}
                        />
                    );
                })}
                {segments.slice(1).map((segment) => {
                    const [innerX, innerY] = pointAt(segment.from, min, max, RADIUS - 11);
                    const [outerX, outerY] = pointAt(segment.from, min, max, RADIUS + 11);
                    return <line key={segment.key} x1={innerX} y1={innerY} x2={outerX} y2={outerY} className={styles.separator} />;
                })}
                {ticks.map((tick) => {
                    const [tickX, tickY] = pointAt(tick, min, max, TICK_RADIUS);
                    return (
                        <text key={tick} x={tickX} y={tickY} className={styles.tick}>
                            {formatNumber(tick, 1)}
                        </text>
                    );
                })}
                <line x1={CENTER_X} y1={CENTER_Y} x2={needleX} y2={needleY} className={styles.needle} />
                <circle cx={CENTER_X} cy={CENTER_Y} r={6} className={styles.hub} />
            </svg>
            <figcaption className={styles.caption}>
                <span className={styles.value}>{valueText}</span>
                <span>{caption}</span>
            </figcaption>
        </figure>
    );
}
