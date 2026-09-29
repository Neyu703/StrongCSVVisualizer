import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { MuscleModel } from "../components/MuscleModel";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import type { SegmentOption } from "../components/SegmentedControl";
import { formatNumber } from "../core/format";
import { heatColor, toCssColor } from "../core/heat";
import { muscleLoad, withIntensity } from "../core/muscles";
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

interface MusclesProps {
    sets: WorkoutSet[];
    now: Date;
    model: BodyModel;
}

/** Muscle tab: 3D figure and list of weighted working sets per muscle group in a time window. */
export function Muscles({ sets, now, model }: MusclesProps) {
    const [timeWindow, setTimeWindow] = useState<TimeWindow>("30");
    const entries = useMemo(
        () => withIntensity(muscleLoad(sets, Number(timeWindow), now)),
        [sets, timeWindow, now],
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
                            <div key={muscle} className={styles.cell}>
                                <span
                                    className={styles.dot}
                                    style={intensity > 0 ? { background: toCssColor(heatColor(intensity)) } : undefined}
                                />
                                <span className={styles.name}>{muscle}</span>
                                <span className={styles.value}>{formatNumber(load, 1)} Sätze</span>
                            </div>
                        ))}
                    </div>
                    <p className={styles.footer}>
                        Arbeitssätze ohne Aufwärmen; Hauptmuskeln zählen voll, Hilfsmuskeln halb. Die Farbe zeigt die
                        Belastung relativ zum am stärksten trainierten Muskel.
                    </p>
                </>
            )}
        </>
    );
}
