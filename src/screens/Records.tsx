import { useMemo } from "react";
import { EmptyState } from "../components/EmptyState";
import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { formatValue } from "../core/format";
import { exerciseRecords, exerciseSummaries } from "../core/stats";
import type { WeightUnit, WorkoutSet } from "../core/types";
import { IMPORT_FIRST_HINT, METRIC_FORMATS, RECORD_LABELS } from "../labels";

interface RecordsProps {
    sets: WorkoutSet[];
    unit: WeightUnit;
    onSelectExercise: (exercise: string) => void;
}

/** Records tab: the two headline records of every exercise. */
export function Records({ sets, unit, onSelectExercise }: RecordsProps) {
    const rows = useMemo(
        () =>
            exerciseSummaries(sets).map((summary) => ({
                name: summary.name,
                records: exerciseRecords(sets, summary.name).records.slice(0, 2),
            })),
        [sets],
    );

    return (
        <>
            <ScreenHeader title="Rekorde" />
            {rows.length === 0 ? (
                <EmptyState title="Noch keine Rekorde" text={IMPORT_FIRST_HINT} />
            ) : (
                <ListGroup>
                    {rows.map((row) => (
                        <ListRow
                            key={row.name}
                            title={row.name}
                            subtitle={row.records
                                .map((record) => `${RECORD_LABELS[record.key]}: ${formatValue(METRIC_FORMATS[record.metric], record.value, unit)}`)
                                .join(" · ")}
                            onClick={() => onSelectExercise(row.name)}
                        />
                    ))}
                </ListGroup>
            )}
        </>
    );
}
