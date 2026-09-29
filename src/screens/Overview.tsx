import { useMemo, useState } from "react";
import { Card } from "../components/Card";
import { ImportCard } from "../components/ImportCard";
import type { ImportMessage } from "../components/ImportCard";
import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import type { SegmentOption } from "../components/SegmentedControl";
import { StatTile } from "../components/StatTile";
import { WeeklyChart } from "../components/WeeklyChart";
import { formatCompact, formatNumber } from "../core/format";
import { overviewStats } from "../core/stats";
import type { WeightUnit, WorkoutSet } from "../core/types";
import styles from "./Overview.module.scss";

type WeekRange = "12" | "26" | "52" | "all";

const WEEK_RANGES: SegmentOption<WeekRange>[] = [
    { value: "12", label: "12 Wo." },
    { value: "26", label: "26 Wo." },
    { value: "52", label: "52 Wo." },
    { value: "all", label: "Alle" },
];

interface OverviewProps {
    sets: WorkoutSet[];
    unit: WeightUnit;
    now: Date;
    showTrendlines: boolean;
    message: ImportMessage | null;
    onFile: (file: File) => void;
    onReset: () => void;
}

/** Overview tab: key figures, weekly frequency, CSV import and data reset. */
export function Overview({ sets, unit, now, showTrendlines, message, onFile, onReset }: OverviewProps) {
    const stats = useMemo(() => overviewStats(sets, now), [sets, now]);
    const [range, setRange] = useState<WeekRange>("26");
    const weeks = range === "all" ? stats.weeks : stats.weeks.slice(-Number(range));
    const hasData = sets.length > 0;

    const confirmReset = () => {
        if (window.confirm("Alle gespeicherten Trainingsdaten aus diesem Browser löschen?")) {
            onReset();
        }
    };

    return (
        <>
            <ScreenHeader title="Übersicht" />
            {hasData && (
                <>
                    <div className={styles.tiles}>
                        <StatTile label="Workouts" value={formatNumber(stats.workouts)} />
                        <StatTile label="Trainingszeit" value={`${formatNumber(stats.totalSeconds / 3600)} Std.`} />
                        <StatTile label="Gesamtvolumen" value={`${formatCompact(stats.totalVolume)} ${unit}`} />
                        <StatTile label="Arbeitssätze" value={formatNumber(stats.workingSets)} />
                        <StatTile label="Aktuelle Serie" value={`${stats.currentStreak} Wo.`} />
                        <StatTile label="Längste Serie" value={`${stats.longestStreak} Wo.`} />
                    </div>
                    <Card title="Workouts pro Woche">
                        <SegmentedControl label="Zeitraum" options={WEEK_RANGES} value={range} onChange={setRange} />
                        <WeeklyChart weeks={weeks} showTrend={showTrendlines} />
                    </Card>
                </>
            )}
            <ImportCard hasData={hasData} message={message} onFile={onFile} />
            {hasData && (
                <ListGroup footer="Die Daten liegen nur in diesem Browser (localStorage).">
                    <ListRow title="Alle Daten löschen" destructive onClick={confirmReset} />
                </ListGroup>
            )}
        </>
    );
}
