import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { describeSet, formatDate, formatDuration, formatValue } from "../core/format";
import { workoutVolume } from "../core/stats";
import type { Workout, WeightUnit } from "../core/types";
import styles from "./WorkoutDetail.module.scss";

interface WorkoutDetailProps {
    workout: Workout;
    unit: WeightUnit;
    onBack: () => void;
}

/** All exercises and sets of one workout. */
export function WorkoutDetail({ workout, unit, onBack }: WorkoutDetailProps) {
    return (
        <>
            <ScreenHeader title={workout.name} back={{ label: "Verlauf", onClick: onBack }} />
            <p className={styles.summary}>
                {formatDate(workout.date, "long")} · {formatDuration(workout.duration)} ·{" "}
                {formatValue("weight", workoutVolume(workout), unit)}
            </p>
            {workout.notes && <ListGroup header="Notizen"><ListRow title={workout.notes} /></ListGroup>}
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
