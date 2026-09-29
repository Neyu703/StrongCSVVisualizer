import { useMemo, useState } from "react";
import { Card } from "../components/Card";
import { EmptyState } from "../components/EmptyState";
import { MuscleModel } from "../components/MuscleModel";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import type { SegmentOption } from "../components/SegmentedControl";
import { WeeklyChart } from "../components/WeeklyChart";
import { formatNumber } from "../core/format";
import { heatColor, toCssColor } from "../core/heat";
import { WEEKLY_SET_TARGET, muscleLoad, weeklyMuscleSets, withIntensity } from "../core/muscles";
import type { Muscle } from "../core/muscles";
import type { BodyModel } from "../core/settings";
import type { WorkoutSet } from "../core/types";
import { IMPORT_FIRST_HINT } from "../labels";
import styles from "./Muscles.module.scss";

type TimeWindow = "7" | "30" | "90";

const WINDOWS: SegmentOption<TimeWindow>[] = [
    { value: "7", label: "7 Tage" },
    { value: "30", label: "30 Tage" },
    { value: "90", label: "90 Tage" },
];

type WeekRange = "12" | "26" | "52";

const WEEK_RANGES: SegmentOption<WeekRange>[] = [
    { value: "12", label: "12 Wo." },
    { value: "26", label: "26 Wo." },
    { value: "52", label: "52 Wo." },
];

interface MusclesProps {
    sets: WorkoutSet[];
    now: Date;
    model: BodyModel;
    showTrendlines: boolean;
}

/** Muscle tab: 3D figure, weighted working sets per muscle group in a time window and their weekly history. */
export function Muscles({ sets, now, model, showTrendlines }: MusclesProps) {
    const [timeWindow, setTimeWindow] = useState<TimeWindow>("30");
    const [selected, setSelected] = useState<Muscle | null>(null);
    const [range, setRange] = useState<WeekRange>("26");
    const entries = useMemo(
        () => withIntensity(muscleLoad(sets, Number(timeWindow), now)),
        [sets, timeWindow, now],
    );
    const weeks = useMemo(
        () => (selected ? weeklyMuscleSets(sets, selected, now, Number(range)) : []),
        [sets, selected, now, range],
    );

    return (
        <>
            <ScreenHeader title="Muskeln" />
            {sets.length === 0 ? (
                <EmptyState title="Noch keine Daten" text={IMPORT_FIRST_HINT} />
            ) : (
                <>
                    <div className={styles.window}>
                        <SegmentedControl label="Zeitraum" options={WINDOWS} value={timeWindow} onChange={setTimeWindow} />
                    </div>
                    <MuscleModel entries={entries} model={model} />
                    <div className={styles.grid}>
                        {entries.map(({ muscle, load, intensity }) => (
                            <button
                                key={muscle}
                                type="button"
                                className={muscle === selected ? `${styles.cell} ${styles.selected}` : styles.cell}
                                aria-pressed={muscle === selected}
                                onClick={() => setSelected(muscle === selected ? null : muscle)}
                            >
                                <span
                                    className={styles.dot}
                                    style={intensity > 0 ? { background: toCssColor(heatColor(intensity)) } : undefined}
                                />
                                <span className={styles.name}>{muscle}</span>
                                <span className={styles.value}>{formatNumber(load, 1)} Sätze</span>
                            </button>
                        ))}
                    </div>
                    {selected && (
                        <Card title={`${selected}: Sätze pro Woche`}>
                            <SegmentedControl label="Zeitraum" options={WEEK_RANGES} value={range} onChange={setRange} />
                            <WeeklyChart weeks={weeks} valueLabel="Sätze" showTrend={showTrendlines} band={WEEKLY_SET_TARGET} />
                            <p className={styles.footer}>
                                Grün hinterlegt: {WEEKLY_SET_TARGET[0]}–{WEEKLY_SET_TARGET[1]} Sätze pro Woche.
                            </p>
                        </Card>
                    )}
                    <p className={styles.footer}>
                        Arbeitssätze ohne Aufwärmen; Hauptmuskeln zählen voll, Hilfsmuskeln halb. Die Farbe zeigt die
                        Belastung relativ zum am stärksten trainierten Muskel. Einen Muskel antippen für den
                        Wochenverlauf.
                    </p>
                </>
            )}
        </>
    );
}
