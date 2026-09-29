import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatNumber } from "../core/format";
import type { WeekCount } from "../core/stats";
import { addTrend } from "../core/trend";
import { CHART_MARGIN, GRID_PROPS, TOOLTIP_STYLE, TREND_LINE, X_AXIS_PROPS, Y_AXIS_PROPS } from "./chartStyle";

interface WeeklyChartProps {
    weeks: WeekCount[];
    showTrend: boolean;
}

/**
 * Formats a week's Monday for axis and tooltip.
 * @param weekStart "YYYY-MM-DD"
 * @returns German short date
 */
function formatWeek(weekStart: string): string {
    return formatDate(`${weekStart} 00:00:00`, "short");
}

/**
 * Formats a tooltip entry for the bars or the trend line.
 * @param value series value
 * @param name series name
 * @returns value and label for the tooltip
 */
function formatEntry(value: unknown, name: unknown): [string, string] {
    return name === "Trend" ? [formatNumber(Number(value), 1), "Trend"] : [String(value), "Workouts"];
}

/** Bar chart of workouts per week, optionally with a least-squares trend line. */
export function WeeklyChart({ weeks, showTrend }: WeeklyChartProps) {
    const trended = showTrend ? addTrend(weeks, { x: (_, index) => index, y: (week) => week.count }, "least-squares") : null;
    // A workout count cannot be negative, so a falling line stops at 0
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
                <YAxis width={28} {...Y_AXIS_PROPS} allowDecimals={false} domain={[0, "auto"]} />
                <Tooltip
                    cursor={{ fill: "var(--fill)" }}
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(weekStart) => `Woche ab ${formatWeek(String(weekStart))}`}
                    formatter={formatEntry}
                />
                <Bar name="Workouts" dataKey="count" fill="var(--tint)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                {trended && <Line name="Trend" dataKey="trend" type="linear" {...TREND_LINE} />}
            </ComposedChart>
        </ResponsiveContainer>
    );
}
