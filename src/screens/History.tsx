import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { SearchField } from "../components/SearchField";
import { formatDate, formatDuration, formatValue, truncate } from "../core/format";
import { searchWorkouts } from "../core/search";
import { groupWorkouts, workoutVolume } from "../core/stats";
import type { WeightUnit, WorkoutSet } from "../core/types";
import { IMPORT_FIRST_HINT } from "../labels";
import { WorkoutDetail } from "./WorkoutDetail";

const MAX_NOTE_LENGTH = 60;

interface HistoryProps {
    sets: WorkoutSet[];
    unit: WeightUnit;
}

/** History tab: all workouts, newest first, with a detail view. */
export function History({ sets, unit }: HistoryProps) {
    const workouts = useMemo(() => groupWorkouts(sets).reverse(), [sets]);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [query, setQuery] = useState("");
    const matches = useMemo(() => searchWorkouts(workouts, query), [workouts, query]);
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
                <>
                    <SearchField value={query} onChange={setQuery} label="Workouts und Notizen durchsuchen" />
                    {matches.length === 0 ? (
                        <EmptyState title="Keine Workouts" text="Nichts gefunden." />
                    ) : (
                        <ListGroup>
                            {matches.map(({ workout, notes }) => (
                                <ListRow
                                    key={workout.date}
                                    title={workout.name}
                                    subtitle={
                                        notes.length > 0
                                            ? `„${truncate(notes[0], MAX_NOTE_LENGTH)}“`
                                            : `${formatDate(workout.date, "long")} · ${formatDuration(workout.duration)}`
                                    }
                                    value={formatValue("weight", workoutVolume(workout), unit)}
                                    onClick={() => setSelectedDate(workout.date)}
                                />
                            ))}
                        </ListGroup>
                    )}
                </>
            )}
        </>
    );
}
