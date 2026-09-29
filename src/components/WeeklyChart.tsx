import { Bar, CartesianGrid, ComposedChart, Line, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatNumber } from "../core/format";
import type { WeekValue } from "../core/stats";
import { addTrend } from "../core/trend";
import { CHART_MARGIN, GRID_PROPS, TOOLTIP_STYLE, TREND_LINE, X_AXIS_PROPS, Y_AXIS_PROPS } from "./chartStyle";

interface WeeklyChartProps {
    weeks: WeekValue[];
    /** Name of the plotted quantity in the tooltip, e.g. "Workouts". */
    valueLabel: string;
    showTrend: boolean;
    /** Optional highlighted target range (low, high). */
    band?: readonly [number, number];
}

/**
 * Formats a week's Monday for axis and tooltip.
 * @param weekStart "YYYY-MM-DD"
 * @returns German short date
 */
function formatWeek(weekStart: string): string {
    return formatDate(`${weekStart} 00:00:00`, "short");
}

/** Bar chart of a weekly quantity, optionally with a least-squares trend line and a target range. */
export function WeeklyChart({ weeks, valueLabel, showTrend, band }: WeeklyChartProps) {
    const trended = showTrend ? addTrend(weeks, { x: (_, index) => index, y: (week) => week.value }, "least-squares") : null;
    // Weekly counts cannot be negative, so a falling line stops at 0
    const data = trended?.points.map((week) => ({ ...week, trend: Math.max(0, week.trend) })) ?? weeks;
    return (
        <ResponsiveContainer width="100%" height={180}>
            <ComposedChart data={data} margin={CHART_MARGIN}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis
                    dataKey="weekStart"
                    {...X_AXIS_PROPS}
                    tickFormatter={formatWeek}
                    minTickGap={32}
                />
                <YAxis width={28} {...Y_AXIS_PROPS} allowDecimals={weeks.some((week) => !Number.isInteger(week.value))} domain={[0, "auto"]} />
                <Tooltip
                    cursor={{ fill: "var(--fill)" }}
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(weekStart) => `Woche ab ${formatWeek(String(weekStart))}`}
                    formatter={(value, name) => [formatNumber(Number(value), 1), String(name)]}
                />
                {band && <ReferenceArea y1={band[0]} y2={band[1]} fill="var(--green)" fillOpacity={0.12} ifOverflow="extendDomain" />}
                <Bar name={valueLabel} dataKey="value" fill="var(--tint)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                {trended && <Line name="Trend" dataKey="trend" type="linear" {...TREND_LINE} />}
            </ComposedChart>
        </ResponsiveContainer>
    );
}
