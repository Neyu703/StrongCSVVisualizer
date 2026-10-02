import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatNumber } from "../core/format";
import { CHART_MARGIN, GRID_PROPS, TOOLTIP_STYLE, X_AXIS_PROPS, Y_AXIS_PROPS } from "./chartStyle";

export interface ProjectionPoint {
    week: number;
    value: number;
}

interface ProjectionChartProps {
    points: ProjectionPoint[];
    /** Unit of the plotted value, e.g. "kg". */
    unit: string;
}

/** Line chart of a planned value per week. */
export function ProjectionChart({ points, unit }: ProjectionChartProps) {
    return (
        <ResponsiveContainer width="100%" height={220}>
            <LineChart data={points} margin={CHART_MARGIN}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="week" type="number" domain={["dataMin", "dataMax"]} allowDecimals={false} {...X_AXIS_PROPS} tickFormatter={(week: number) => `Wo. ${week}`} />
                <YAxis width={44} {...Y_AXIS_PROPS} domain={["auto", "auto"]} tickFormatter={(value: number) => formatNumber(value, 1)} />
                <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(week) => `Woche ${week}`}
                    formatter={(value) => `${formatNumber(Number(value), 1)} ${unit}`}
                />
                <Line name="Gewicht" dataKey="value" type="linear" stroke="var(--tint)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} isAnimationActive={false} />
            </LineChart>
        </ResponsiveContainer>
    );
}
