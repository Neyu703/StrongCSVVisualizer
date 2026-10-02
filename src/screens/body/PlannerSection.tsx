import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ProjectionChart } from "../../components/ProjectionChart";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { SegmentOption } from "../../components/SegmentedControl";
import { StatGrid } from "../../components/StatGrid";
import { StatTile } from "../../components/StatTile";
import type { WeightPlan } from "../../core/body/planner";
import type { BodyReport } from "../../core/body/report";
import { formatEnergy, formatQuantity, toDisplay, unitLabel } from "../../core/body/units";
import { formatDate, formatNumber } from "../../core/format";
import { MeasurementInput } from "./MeasurementInput";
import { LabeledGroup } from "./ProfileCard";
import type { ProfileProps } from "./MeasurementInput";
import styles from "./Body.module.scss";

const WEEKLY_RATES = [0.25, 0.5, 1] as const;

interface PlannerSectionProps extends ProfileProps {
    report: BodyReport;
}

interface MissingPlanProps {
    hasGoal: boolean;
    /** A plan here can only be one without weeks left. */
    plan: WeightPlan | null;
}

/** Explains why no weekly plan is shown. */
function MissingPlan({ hasGoal, plan }: MissingPlanProps) {
    if (!hasGoal) {
        return <EmptyState title="Kein Zielgewicht" text="Gib ein Zielgewicht ein, um Dauer, Zieldatum und Kalorien zu planen." />;
    }
    return plan === null ? (
        <EmptyState title="Angaben fehlen" text="Für den Plan braucht es den Tagesbedarf (Alter, Größe, Gewicht)." />
    ) : (
        <EmptyState title="Ziel erreicht" text="Dein Gewicht entspricht dem Zielgewicht." />
    );
}

/** Body tab section: weeks, date and calories to reach a goal weight at a steady weekly rate. */
export function PlannerSection({ profile, report, onChange }: PlannerSectionProps) {
    const energy = (kcal: number) => formatEnergy(kcal, profile.energyUnit);
    const rateOptions: SegmentOption<string>[] = WEEKLY_RATES.map((rate) => ({
        value: String(rate),
        label: formatQuantity("mass", rate, profile.units, 2),
    }));
    const { plan } = report;

    return (
        <>
            <Card title="Ziel">
                <div className={styles.columns}>
                    <MeasurementInput profile={profile} onChange={onChange} field="goalWeightKg" label="Zielgewicht" quantity="mass" />
                    <LabeledGroup label="Tempo pro Woche">
                        <SegmentedControl
                            label="Tempo pro Woche"
                            options={rateOptions}
                            value={String(profile.kgPerWeek)}
                            onChange={(rate) => onChange({ kgPerWeek: Number(rate) })}
                        />
                    </LabeledGroup>
                </div>
                <p className={styles.note}>0,5–1 % des Körpergewichts pro Woche gilt als nachhaltiges Tempo.</p>
            </Card>
            {plan === null || plan.weeks === 0 ? (
                <MissingPlan hasGoal={profile.goalWeightKg !== null} plan={plan} />
            ) : (
                <>
                    <StatGrid>
                        <StatTile label="Dauer" value={`${formatNumber(plan.weeks)} Wochen`} />
                        <StatTile label="Ziel erreicht am" value={formatDate(plan.endDate.getTime(), "medium")} />
                        <StatTile label="Tagesziel erste Woche" value={energy(plan.points[0].kcal)} />
                        <StatTile label="Tagesziel letzte Woche" value={energy(plan.points[plan.weeks - 1].kcal)} />
                    </StatGrid>
                    {plan.belowMinimum && <p className={styles.warning}>Das Tagesziel liegt zeitweise unter der empfohlenen Mindestzufuhr. Wähle ein langsameres Tempo.</p>}
                    {plan.goalUnderweight && <p className={styles.warning}>Das Zielgewicht ergibt einen BMI unter 18,5 (Untergewicht).</p>}
                    <Card title="Gewichtsverlauf">
                        <ProjectionChart
                            points={plan.points.map((point) => ({ week: point.week, value: toDisplay("mass", point.weightKg, profile.units) }))}
                            unit={unitLabel("mass", profile.units)}
                        />
                        <p className={styles.note}>
                            Das Tagesziel sinkt mit dem Gewicht, weil auch der Tagesbedarf sinkt. Danach hältst du das Gewicht mit{" "}
                            {energy(plan.points[plan.weeks].kcal)} pro Tag.
                        </p>
                    </Card>
                </>
            )}
        </>
    );
}
