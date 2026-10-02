import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { ListGroup, ListRow } from "../../components/ListGroup";
import { SegmentedControl } from "../../components/SegmentedControl";
import type { SegmentOption } from "../../components/SegmentedControl";
import { SliderField } from "../../components/SliderField";
import { BMR_FORMULAS } from "../../core/body/energy";
import type { BmrFormula } from "../../core/body/energy";
import { KCAL_PER_GRAM } from "../../core/body/nutrition";
import type { Macros } from "../../core/body/nutrition";
import { MIN_DAILY_KCAL } from "../../core/body/planner";
import { SETTING_RANGES } from "../../core/body/profile";
import type { BodyReport } from "../../core/body/report";
import { formatEnergy, formatQuantity } from "../../core/body/units";
import { formatNumber } from "../../core/format";
import { BMR_LABELS, MACRO_LABELS, orMissing } from "./labels";
import type { ProfileProps } from "./MeasurementInput";
import styles from "./Body.module.scss";

const MACRO_NUTRIENTS = Object.keys(KCAL_PER_GRAM) as (keyof Macros)[];

const BMR_OPTIONS: SegmentOption<BmrFormula>[] = BMR_FORMULAS.map((formula) => ({ value: formula, label: BMR_LABELS[formula] }));

interface EnergySectionProps extends ProfileProps {
    report: BodyReport;
}

/** Body tab section: resting and daily energy, calorie goals, macronutrients and water. */
export function EnergySection({ profile, report, onChange }: EnergySectionProps) {
    const energy = (kcal: number) => formatEnergy(kcal, profile.energyUnit);
    const { maintenance, macros } = report;

    /**
     * Names a weekly weight change.
     * @param kgPerWeek change in kg per week, negative for a loss
     * @returns e.g. "Abnehmen: 0,5 kg pro Woche"
     */
    const goalTitle = (kgPerWeek: number) => {
        if (kgPerWeek === 0) {
            return "Gewicht halten";
        }
        return `${kgPerWeek < 0 ? "Abnehmen" : "Zunehmen"}: ${formatQuantity("mass", Math.abs(kgPerWeek), profile.units, 2)} pro Woche`;
    };

    /**
     * Formats one macronutrient.
     * @param grams daily amount
     * @param kcalPerGram energy density
     * @returns e.g. "144 g · 576 kcal"
     */
    const macroText = (grams: number, kcalPerGram: number) => `${formatNumber(grams)} g · ${energy(grams * kcalPerGram)}`;

    return (
        <>
            <Card title="Formel für den Grundumsatz">
                <SegmentedControl label="Formel" options={BMR_OPTIONS} value={profile.bmrFormula} onChange={(bmrFormula) => onChange({ bmrFormula })} />
                <p className={styles.note}>
                    Mifflin-St Jeor gilt als genaueste Formel für die meisten Menschen. Katch-McArdle nutzt die Magermasse und passt
                    besser bei bekanntem, niedrigem Körperfett.
                </p>
            </Card>
            {maintenance === null ? (
                <EmptyState
                    title="Angaben fehlen"
                    text={profile.bmrFormula === "katch" ? "Katch-McArdle braucht einen Körperfettwert und das Gewicht." : "Gib im Profil Alter, Größe und Gewicht ein."}
                />
            ) : (
                <>
                    <ListGroup header="Energiebedarf" footer="Tagesbedarf = Grundumsatz × Aktivitätsfaktor (1,2 bis 1,9).">
                        {BMR_FORMULAS.map((formula) => (
                            <ListRow
                                key={formula}
                                title={`Grundumsatz ${BMR_LABELS[formula]}`}
                                subtitle={formula === profile.bmrFormula ? "gewählt" : undefined}
                                value={orMissing(report.bmr[formula], energy)}
                            />
                        ))}
                        <ListRow title="Tagesbedarf" value={energy(maintenance)} />
                    </ListGroup>
                    <ListGroup
                        header="Kalorienziele"
                        footer={`1 kg Körpergewicht entspricht etwa 7.700 kcal. Unter ${energy(MIN_DAILY_KCAL[profile.sex])} pro Tag nur mit ärztlicher Begleitung.`}
                    >
                        {report.calorieGoals.map((goal) => (
                            <ListRow
                                key={goal.kgPerWeek}
                                title={goalTitle(goal.kgPerWeek)}
                                subtitle={goal.kcal < MIN_DAILY_KCAL[profile.sex] ? "unter der Mindestzufuhr" : undefined}
                                value={energy(goal.kcal)}
                            />
                        ))}
                    </ListGroup>
                </>
            )}
            <Card title="Makronährstoffe">
                <div className={styles.columns}>
                    <SliderField
                        label="Protein pro kg Körpergewicht"
                        value={profile.proteinPerKg}
                        range={SETTING_RANGES.proteinPerKg}
                        step={0.1}
                        valueText={`${formatNumber(profile.proteinPerKg, 1)} g`}
                        onChange={(proteinPerKg) => onChange({ proteinPerKg })}
                    />
                    <SliderField
                        label="Fettanteil der Kalorien"
                        value={profile.fatShare}
                        range={SETTING_RANGES.fatShare}
                        step={0.01}
                        valueText={`${formatNumber(profile.fatShare * 100)} %`}
                        onChange={(fatShare) => onChange({ fatShare })}
                    />
                </div>
                <p className={styles.note}>
                    {report.targetKcal === null
                        ? "Für die Aufteilung fehlt der Tagesbedarf."
                        : `Basis: ${energy(report.targetKcal)} pro Tag (${report.plan ? "erste Woche des Ziel-Plans" : "Tagesbedarf"}). Kohlenhydrate füllen den Rest.`}
                </p>
            </Card>
            <ListGroup footer="Wasser: 35 ml pro kg Körpergewicht, ohne Mehrbedarf durch Sport oder Hitze.">
                {MACRO_NUTRIENTS.map((nutrient) => (
                    <ListRow key={nutrient} title={MACRO_LABELS[nutrient]} value={orMissing(macros, (values) => macroText(values[nutrient], KCAL_PER_GRAM[nutrient]))} />
                ))}
                <ListRow title="Wasser" value={orMissing(report.waterMl, (ml) => `${formatNumber(ml / 1000, 1)} l`)} />
            </ListGroup>
        </>
    );
}
