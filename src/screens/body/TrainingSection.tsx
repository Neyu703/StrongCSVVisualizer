import { useMemo, useState } from "react";
import { Card } from "../../components/Card";
import { Field } from "../../components/Field";
import { ListGroup, ListRow } from "../../components/ListGroup";
import { NumberField } from "../../components/NumberField";
import { SelectField } from "../../components/SelectField";
import type { SegmentOption } from "../../components/SegmentedControl";
import { formatClock, parseClock } from "../../core/body/input";
import type { BodyReport } from "../../core/body/report";
import { HEART_RATE_ZONES, MAX_REPS_FOR_1RM, ONE_REP_MAX_TABLE, RACE_DISTANCES, oneRepMax, pace, riegel } from "../../core/body/training";
import type { OneRepMaxFormula } from "../../core/body/training";
import { fromDisplay, toDisplay, unitLabel, unitSystemOf } from "../../core/body/units";
import { formatNumber } from "../../core/format";
import { bestEstimatedSet } from "../../core/sets";
import { exerciseSummaries } from "../../core/stats";
import type { WeightUnit, WorkoutSet } from "../../core/types";
import { ONE_REP_MAX_LABELS, RACE_LABELS, orMissing } from "./labels";
import type { BodyProfile } from "../../core/body/profile";
import styles from "./Body.module.scss";

const ZONE_LABELS = ["Sehr leicht", "Leicht", "Moderat", "Hart", "Maximal"];

const NO_EXERCISE = "";

interface TrainingSectionProps {
    profile: BodyProfile;
    report: BodyReport;
    sets: WorkoutSet[];
    /** Weight unit of the imported Strong data. */
    libraryUnit: WeightUnit;
}

/** Body tab section: 1RM calculator (prefillable from the Strong data), heart rate zones and running pace. */
export function TrainingSection({ profile, report, sets, libraryUnit }: TrainingSectionProps) {
    const exerciseOptions: SegmentOption<string>[] = useMemo(
        () => [
            { value: NO_EXERCISE, label: "Eigene Werte" },
            ...exerciseSummaries(sets)
                .filter((summary) => summary.kind === "strength")
                .map((summary) => ({ value: summary.name, label: summary.name })),
        ],
        [sets],
    );
    const [exercise, setExercise] = useState(NO_EXERCISE);
    const [weight, setWeight] = useState<number | null>(null);
    const [reps, setReps] = useState<number | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const [timeText, setTimeText] = useState("");

    const massUnit = unitLabel("mass", profile.units);
    const distanceUnit = unitLabel("distance", profile.units);
    const estimates = oneRepMax(weight ?? NaN, reps ?? NaN);
    const seconds = parseClock(timeText);
    const distanceKm = distance === null ? NaN : fromDisplay("distance", distance, profile.units);
    const run = seconds !== null && !Number.isNaN(seconds) ? pace(distanceKm, seconds) : null;

    const selectExercise = (name: string) => {
        setExercise(name);
        const best = bestEstimatedSet(sets.filter((set) => set.exercise === name));
        if (best) {
            setWeight(toDisplay("mass", fromDisplay("mass", best.weight, unitSystemOf(libraryUnit)), profile.units));
            setReps(best.reps);
        }
    };
    const weightText = (value: number) => `${formatNumber(value, 1)} ${massUnit}`;

    return (
        <>
            <Card title="1RM-Rechner">
                {exerciseOptions.length > 1 && (
                    <SelectField label="Bester Satz aus deinen Daten" options={exerciseOptions} value={exercise} onChange={selectExercise} />
                )}
                <div className={styles.columns}>
                    <NumberField label="Gewicht" value={weight} unit={massUnit} onChange={setWeight} range={[0.1, 2000]} />
                    <NumberField label="Wiederholungen" value={reps} digits={0} onChange={setReps} range={[1, MAX_REPS_FOR_1RM]} />
                </div>
            </Card>
            {estimates && (
                <>
                    <ListGroup header="Geschätztes 1RM">
                        {(Object.keys(estimates) as OneRepMaxFormula[]).map((formula) => (
                            <ListRow key={formula} title={ONE_REP_MAX_LABELS[formula]} value={weightText(estimates[formula])} />
                        ))}
                    </ListGroup>
                    <ListGroup header="Prozent des 1RM (Epley)" footer="Typische Wiederholungszahl je Intensität; individuell verschieden.">
                        {ONE_REP_MAX_TABLE.map(([percent, typicalReps]) => (
                            <ListRow key={percent} title={`${percent} %`} subtitle={`ca. ${typicalReps} Wdh.`} value={weightText((estimates.epley * percent) / 100)} />
                        ))}
                    </ListGroup>
                </>
            )}

            <ListGroup
                header="Herzfrequenz"
                footer={
                    profile.restingHeartRate === null
                        ? "Zonen als Anteil der maximalen Herzfrequenz (Tanaka). Mit Ruhepuls im Profil rechnet die App nach Karvonen."
                        : "Zonen nach Karvonen: Ruhepuls + Anteil der Herzfrequenzreserve (Maximum nach Tanaka)."
                }
            >
                <ListRow title="Maximum (220 − Alter)" value={orMissing(report.maxHeartRate, ({ fox }) => `${formatNumber(fox)} bpm`)} />
                <ListRow title="Maximum (Tanaka)" value={orMissing(report.maxHeartRate, ({ tanaka }) => `${formatNumber(tanaka)} bpm`)} />
                {report.heartRateZones?.map(([low, high], index) => (
                    <ListRow
                        key={ZONE_LABELS[index]}
                        title={`Zone ${index + 1}: ${ZONE_LABELS[index]}`}
                        subtitle={`${HEART_RATE_ZONES[index][0]}–${HEART_RATE_ZONES[index][1]} %`}
                        value={`${formatNumber(low)}–${formatNumber(high)} bpm`}
                    />
                ))}
            </ListGroup>

            <Card title="Pace und Wettkampfprognose">
                <div className={styles.columns}>
                    <NumberField label="Distanz" value={distance} unit={distanceUnit} digits={2} onChange={setDistance} range={[0.1, 500]} />
                    <Field label="Zeit (mm:ss oder h:mm:ss)" error={Number.isNaN(seconds) ? "Format z. B. 25:30" : undefined}>
                        <input type="text" inputMode="numeric" value={timeText} aria-invalid={Number.isNaN(seconds)} onChange={(event) => setTimeText(event.target.value)} />
                    </Field>
                </div>
            </Card>
            {run && (
                <ListGroup header="Ergebnis" footer="Prognose nach Riegel (Zeit × Distanzverhältnis^1,06); gilt bei vergleichbarem Training.">
                    <ListRow title="Pace" value={`${formatClock(run.secondsPerKm * fromDisplay("distance", 1, profile.units))} min/${distanceUnit}`} />
                    <ListRow title="Geschwindigkeit" value={`${formatNumber(toDisplay("distance", run.kmh, profile.units), 1)} ${distanceUnit}/h`} />
                    {RACE_DISTANCES.map((raceKm, index) => (
                        <ListRow key={raceKm} title={RACE_LABELS[index]} value={formatClock(riegel(distanceKm, seconds!, raceKm))} />
                    ))}
                </ListGroup>
            )}
        </>
    );
}
