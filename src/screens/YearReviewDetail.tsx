import { ListGroup, ListRow } from "../components/ListGroup";
import { ScreenHeader } from "../components/ScreenHeader";
import { StatGrid } from "../components/StatGrid";
import { StatTile } from "../components/StatTile";
import { formatCompact, formatMonth, formatNumber, formatWeekday } from "../core/format";
import type { YearReview } from "../core/yearReview";
import type { WeightUnit } from "../core/types";

interface YearReviewDetailProps {
    review: YearReview;
    unit: WeightUnit;
    onBack: () => void;
    onSelectExercise: (exercise: string) => void;
}

/** Highlights of one training year: totals, records, best month and favourite weekday, top exercises. */
export function YearReviewDetail({ review, unit, onBack, onSelectExercise }: YearReviewDetailProps) {
    const { strongestMonth, busiestWeekday } = review;
    return (
        <>
            <ScreenHeader title={String(review.year)} back={{ label: "Übersicht", onClick: onBack }} />
            <StatGrid>
                <StatTile label="Workouts" value={formatNumber(review.workouts)} />
                <StatTile label="Trainingszeit" value={`${formatNumber(review.totalSeconds / 3600)} Std.`} />
                <StatTile label="Gesamtvolumen" value={`${formatCompact(review.totalVolume)} ${unit}`} />
                <StatTile label="Arbeitssätze" value={formatNumber(review.workingSets)} />
                <StatTile label="Neue 1RM-Rekorde" value={formatNumber(review.newRecords)} />
                <StatTile label="Längste Serie" value={`${review.longestStreak} Wo.`} />
                {strongestMonth && <StatTile label="Stärkster Monat" value={formatMonth(strongestMonth.month)} />}
                {busiestWeekday !== null && <StatTile label="Häufigster Trainingstag" value={formatWeekday(busiestWeekday)} />}
            </StatGrid>
            <ListGroup header="Top-Übungen">
                {review.topExercises.map((exercise) => (
                    <ListRow
                        key={exercise.name}
                        title={exercise.name}
                        value={`${exercise.workouts}×`}
                        onClick={() => onSelectExercise(exercise.name)}
                    />
                ))}
            </ListGroup>
        </>
    );
}
