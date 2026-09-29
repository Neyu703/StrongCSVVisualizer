import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { formatDate, formatDuration, formatValue } from "../core/format";
import { groupWorkouts, workoutVolume } from "../core/stats";
import type { WeightUnit, WorkoutSet } from "../core/types";
import { IMPORT_FIRST_HINT } from "../labels";
import { WorkoutDetail } from "./WorkoutDetail";

interface HistoryProps {
    sets: WorkoutSet[];
    unit: WeightUnit;
}

/** History tab: all workouts, newest first, with a detail view. */
export function History({ sets, unit }: HistoryProps) {
    const workouts = useMemo(() => groupWorkouts(sets).reverse(), [sets]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const selected = workouts.find((workout) => workout.date === selectedDate);

    if (selected) {
        return <WorkoutDetail workout={selected} unit={unit} onBack={() => setSelectedDate(null)} />;
    }
    return (
        <>
            <ScreenHeader title="Verlauf" />
            {workouts.length === 0 ? (
                <EmptyState title="Noch keine Workouts" text={IMPORT_FIRST_HINT} />
            ) : (
                <ListGroup>
                    {workouts.map((workout) => (
                        <ListRow
                            key={workout.date}
                            title={workout.name}
                            subtitle={`${formatDate(workout.date, "long")} · ${formatDuration(workout.duration)}`}
                            value={formatValue("weight", workoutVolume(workout), unit)}
                            onClick={() => setSelectedDate(workout.date)}
                        />
                    ))}
                </ListGroup>
            )}
        </>
    );
}
