import { useMemo, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { SearchField } from "../components/SearchField";
import { formatDate } from "../core/format";
import { exerciseSummaries } from "../core/stats";
import type { WeightUnit, WorkoutSet } from "../core/types";
import { KIND_LABELS } from "../labels";
import { ExerciseDetail } from "./ExerciseDetail";

interface ExercisesProps {
    sets: WorkoutSet[];
    unit: WeightUnit;
    now: Date;
    showTrendlines: boolean;
    /** Currently open exercise; owned by the app so other tabs can deep-link. */
    selected: string | null;
    onSelect: (exercise: string | null) => void;
}

/** Exercises tab: searchable list with a per-exercise detail view. */
export function Exercises({ sets, unit, now, showTrendlines, selected, onSelect }: ExercisesProps) {
    const summaries = useMemo(() => exerciseSummaries(sets), [sets]);
    const [query, setQuery] = useState("");

    if (selected) {
        return (
            <ExerciseDetail
                key={selected}
                sets={sets}
                exercise={selected}
                unit={unit}
                now={now}
                showTrendlines={showTrendlines}
                onBack={() => onSelect(null)}
            />
        );
    }

    const needle = query.trim().toLowerCase();
    const matches = summaries.filter((summary) => summary.name.toLowerCase().includes(needle));
    return (
        <>
            <ScreenHeader title="Übungen" />
            <SearchField value={query} onChange={setQuery} label="Übungen durchsuchen" />
            {matches.length === 0 ? (
                <EmptyState title="Keine Übungen" text={sets.length === 0 ? "Importiere zuerst deine Strong-CSV." : "Nichts gefunden."} />
            ) : (
                <ListGroup>
                    {matches.map((summary) => (
                        <ListRow
                            key={summary.name}
                            title={summary.name}
                            subtitle={`${KIND_LABELS[summary.kind]} · zuletzt ${formatDate(summary.lastDate, "medium")}`}
                            value={`${summary.workouts}×`}
                            onClick={() => onSelect(summary.name)}
                        />
                    ))}
                </ListGroup>
            )}
        </>
    );
}
