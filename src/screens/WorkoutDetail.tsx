import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { compareWorkouts } from "../core/compare";
import type { ExerciseComparison } from "../core/compare";
import { describeSet, formatDate, formatDelta, formatDuration, formatValue } from "../core/format";
import { workoutVolume } from "../core/stats";
import type { Workout, WeightUnit } from "../core/types";
import { METRIC_FORMATS, METRIC_LABELS, METRICS_BY_KIND } from "../labels";
import styles from "./WorkoutDetail.module.scss";

interface WorkoutDetailProps {
    workout: Workout;
    /** Latest earlier workout with the same name, if any. */
    previous: Workout | undefined;
    unit: WeightUnit;
    onBack: () => void;
}

/**
 * Describes how an exercise changed since the previous workout, e.g. "1RM +2,5 kg · Gewicht ±0 kg · +1 Wdh.".
 * @param comparison current and previous session of the exercise
 * @param unit weight unit
 * @returns display text, "Neu" for exercises without a previous session
 */
function describeChange({ kind, current, previous }: ExerciseComparison, unit: WeightUnit): string {
    if (previous === null) {
        return "Neu";
    }
    return METRICS_BY_KIND[kind]
        .map((metric) => {
            const format = METRIC_FORMATS[metric];
            const change = formatDelta(format, current[metric] - previous[metric], unit);
            // The unit of a rep change already names the metric
            return format === "reps" ? change : `${METRIC_LABELS[metric]} ${change}`;
        })
        .join(" · ");
}

/** All exercises and sets of one workout, compared with the previous workout of the same name. */
export function WorkoutDetail({ workout, previous, unit, onBack }: WorkoutDetailProps) {
    const comparisons = previous ? compareWorkouts(workout, previous) : [];
    return (
        <>
            <ScreenHeader title={workout.name} back={{ label: "Verlauf", onClick: onBack }} />
            <p className={styles.summary}>
                {formatDate(workout.date, "long")} · {formatDuration(workout.duration)} ·{" "}
                {formatValue("weight", workoutVolume(workout), unit)}
            </p>
            {workout.notes && <ListGroup header="Notizen"><ListRow title={workout.notes} /></ListGroup>}
            {previous && comparisons.length > 0 && (
                <ListGroup header={`Vergleich mit ${formatDate(previous.date, "medium")}`}>
                    {comparisons.map((comparison) => (
                        <ListRow key={comparison.name} title={comparison.name} subtitle={describeChange(comparison, unit)} />
                    ))}
                </ListGroup>
            )}
            {workout.exercises.map((exercise) => (
                <ListGroup key={exercise.name} header={exercise.name}>
                    {exercise.sets.map((set, index) => (
                        <ListRow
                            key={index}
                            title={describeSet(set, unit)}
                            value={set.rpe === null ? undefined : `RPE ${set.rpe}`}
                            subtitle={set.notes || undefined}
                            leading={<span className={styles.marker}>{set.setOrder}</span>}
                        />
                    ))}
                </ListGroup>
            ))}
        </>
    );
}
