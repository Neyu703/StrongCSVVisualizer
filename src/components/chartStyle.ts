import type { CSSProperties } from "react";

/** Shared Recharts styling that follows the system theme via CSS variables. */
export const AXIS_TICK = { fill: "var(--label-secondary)", fontSize: 12 };

/** Dashed line for fitted trends, distinct from the data series. */
export const TREND_LINE = {
    stroke: "var(--orange)",
    strokeWidth: 2,
    strokeDasharray: "6 4",
    dot: false,
    activeDot: false,
    isAnimationActive: false,
} as const;

/** Props shared by every chart's grid and axes. */
export const GRID_PROPS = { stroke: "var(--separator)", vertical: false } as const;
export const X_AXIS_PROPS = { tick: AXIS_TICK, stroke: "var(--separator)" } as const;
export const Y_AXIS_PROPS = { tick: AXIS_TICK, axisLine: false, tickLine: false } as const;

export const CHART_MARGIN = { top: 8, right: 12, bottom: 0, left: 0 };

export const TOOLTIP_STYLE: CSSProperties = {
    background: "var(--bg-card)",
    border: "0.5px solid var(--separator)",
    borderRadius: 10,
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
    fontSize: 13,
};
