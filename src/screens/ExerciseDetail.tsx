import { useMemo, useState } from "react";
import { Card } from "../components/Card";
import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import type { SegmentOption } from "../components/SegmentedControl";
import { TrendChart } from "../components/TrendChart";
import { describeSet, formatDate, formatTrend, formatValue } from "../core/format";
import { MS_PER_DAY, daysBefore, parseDate } from "../core/dates";
import { exerciseRecords } from "../core/stats";
import type { SessionMetric } from "../core/stats";
import { addTrend } from "../core/trend";
import type { WeightUnit, WorkoutSet } from "../core/types";
import { METRIC_FORMATS, METRIC_LABELS, METRICS_BY_KIND, OPTIONAL_METRICS, RECORD_LABELS } from "../labels";
import styles from "./ExerciseDetail.module.scss";

type ChartRange = "90" | "180" | "365" | "all";

const CHART_RANGES: SegmentOption<ChartRange>[] = [
    { value: "90", label: "3 Mon." },
    { value: "180", label: "6 Mon." },
    { value: "365", label: "1 Jahr" },
    { value: "all", label: "Alle" },
];

interface ExerciseDetailProps {
    sets: WorkoutSet[];
    exercise: string;
    unit: WeightUnit;
    now: Date;
    showTrendlines: boolean;
    onBack: () => void;
}

/** Progress chart, records, rep-max table and session history of one exercise. */
export function ExerciseDetail({ sets, exercise, unit, now, showTrendlines, onBack }: ExerciseDetailProps) {
    const { kind, sessions, records, repMax } = useMemo(() => exerciseRecords(sets, exercise), [sets, exercise]);

    const metrics = [
        ...METRICS_BY_KIND[kind],
        ...OPTIONAL_METRICS.filter((optional) => sessions.some((session) => session[optional] > 0)),
    ];
    const [metric, setMetric] = useState<SessionMetric>(metrics[0]);
    const [range, setRange] = useState<ChartRange>("all");

    const cutoff = range === "all" ? 0 : daysBefore(now, Number(range));
    // Sessions without an RPE have no value for the RPE metrics, so they are left out instead of plotted as 0
    const skipsZero = OPTIONAL_METRICS.includes(metric);
    const points = sessions
        .map((session) => ({ time: parseDate(session.date).getTime(), value: session[metric] }))
        .filter((point) => point.time >= cutoff && (!skipsZero || point.value > 0));
    const trend = showTrendlines
        ? addTrend(points, { x: (point) => point.time / MS_PER_DAY, y: (point) => point.value }, "theil-sen")
        : null;

    return (
        <>
            <ScreenHeader title={exercise} back={{ label: "Übungen", onClick: onBack }} />
            <Card title={METRIC_LABELS[metric]}>
                {metrics.length > 1 && (
                    <SegmentedControl
                        label="Kennzahl"
                        options={metrics.map((value) => ({ value, label: METRIC_LABELS[value] }))}
                        value={metric}
                        onChange={setMetric}
                    />
                )}
                <SegmentedControl label="Zeitraum" options={CHART_RANGES} value={range} onChange={setRange} />
                {points.length === 0 ? (
                    <p className={styles.noData}>Keine Daten im gewählten Zeitraum.</p>
                ) : (
                    <TrendChart
                        points={trend?.points ?? points}
                        label={METRIC_LABELS[metric]}
                        format={METRIC_FORMATS[metric]}
                        unit={unit}
                    />
                )}
                {trend && <p className={styles.trendCaption}>{formatTrend(trend.slope, METRIC_FORMATS[metric], unit)}</p>}
            </Card>
            {records.length > 0 && (
                <ListGroup header="Rekorde">
                    {records.map((record) => (
                        <ListRow
                            key={record.key}
                            title={RECORD_LABELS[record.key]}
                            subtitle={formatDate(record.date, "medium")}
                            value={formatValue(METRIC_FORMATS[record.metric], record.value, unit)}
                        />
                    ))}
                </ListGroup>
            )}
            {repMax.length > 0 && (
                <ListGroup header="Bestes Gewicht pro Wiederholungszahl" footer="Schwerstes Gewicht mit mindestens so vielen Wiederholungen.">
                    {repMax.map((entry) => (
                        <ListRow
                            key={entry.reps}
                            title={formatValue("reps", entry.reps, unit)}
                            subtitle={formatDate(entry.date, "medium")}
                            value={formatValue("weight", entry.weight, unit)}
                        />
                    ))}
                </ListGroup>
            )}
            <ListGroup header="Verlauf">
                {[...sessions].reverse().map((session) => (
                    <ListRow
                        key={session.date}
                        title={formatDate(session.date, "long")}
                        subtitle={session.sets.map((set) => describeSet(set, unit)).join(" · ")}
                    />
                ))}
            </ListGroup>
        </>
    );
}
