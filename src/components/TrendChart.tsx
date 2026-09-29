import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatDate, formatNumber, formatValue } from "../core/format";
import type { ValueFormat } from "../core/format";
import type { WeightUnit } from "../core/types";
import { CHART_MARGIN, GRID_PROPS, TOOLTIP_STYLE, TREND_LINE, X_AXIS_PROPS, Y_AXIS_PROPS } from "./chartStyle";

export interface TrendPoint {
    /** Epoch milliseconds, so uneven gaps between workouts show up on the time axis. */
    time: number;
    value: number;
    /** Fitted trend value at this point; the trend line is drawn when points carry it. */
    trend?: number;
}

interface TrendChartProps {
    points: TrendPoint[];
    label: string;
    format: ValueFormat;
    unit: WeightUnit;
}

/** Line chart of one metric over time, optionally with a fitted trend line. */
export function TrendChart({ points, label, format, unit }: TrendChartProps) {
    const hasTrend = points.some((point) => point.trend !== undefined);
    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={points} margin={CHART_MARGIN}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    domain={["dataMin", "dataMax"]}
                    {...X_AXIS_PROPS}
                    tickFormatter={(time: number) => formatDate(time, "short")}
                />
                <YAxis
                    width={44}
                    {...Y_AXIS_PROPS}
                    domain={["auto", "auto"]}
                    tickFormatter={(value: number) => formatNumber(value, 1)}
                />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(time) => formatDate(Number(time), "long")}
                    formatter={(value) => formatValue(format, Number(value), unit)}
                />
                <Line
                    name={label}
                    dataKey="value"
                    type="monotone"
                    stroke="var(--tint)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "var(--tint)", strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                />
                {hasTrend && <Line name="Trend" dataKey="trend" type="linear" {...TREND_LINE} />}
            </LineChart>
        </ResponsiveContainer>
    );
}
