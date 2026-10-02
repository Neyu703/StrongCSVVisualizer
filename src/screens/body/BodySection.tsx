import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Gauge } from "../../components/Gauge";
import { ListGroup, ListRow } from "../../components/ListGroup";
import { RangeScale } from "../../components/RangeScale";
import { BMI_CLASSES } from "../../core/body/bmi";
import { BODY_FAT_CLASSES } from "../../core/body/bodyFat";
import { LEAN_MASS_FORMULAS } from "../../core/body/composition";
import { IDEAL_WEIGHT_FORMULAS } from "../../core/body/idealWeight";
import { bySex, scaleSegments } from "../../core/body/math";
import type { BodyReport, RatioResult } from "../../core/body/report";
import { formatQuantity } from "../../core/body/units";
import { formatNumber } from "../../core/format";
import {
    BMI_COLORS,
    BMI_LABELS,
    BODY_FAT_COLORS,
    BODY_FAT_LABELS,
    BODY_FAT_SOURCE_LABELS,
    IDEAL_WEIGHT_LABELS,
    LEAN_MASS_LABELS,
    orMissing,
} from "./labels";
import type { ProfileProps } from "./MeasurementInput";

const BMI_SCALE = [12, 42] as const;

/** Class limits labeled on the BMI gauge (17 and 35 are left out to keep the labels apart). */
const BMI_TICKS = [16, 18.5, 25, 30, 40] as const;

interface BodySectionProps extends ProfileProps {
    report: BodyReport;
}

/**
 * Formats a percentage.
 * @param value percent
 * @returns e.g. "15,7 %"
 */
function percent(value: number): string {
    return `${formatNumber(value, 1)} %`;
}

/**
 * Formats a ratio with its risk note.
 * @param result ratio and risk flag
 * @returns e.g. "0,48 · unauffällig"
 */
function ratioText({ value, elevated }: RatioResult): string {
    return `${formatNumber(value, 2)} · ${elevated ? "erhöhtes Risiko" : "unauffällig"}`;
}

/** Body tab section: BMI, body fat, ideal weight and body composition. */
export function BodySection({ profile, report }: BodySectionProps) {
    const mass = (kg: number) => formatQuantity("mass", kg, profile.units);
    const { bmi, bodyFat } = report;

    if (bmi === null) {
        return <EmptyState title="Angaben fehlen" text="Gib im Profil mindestens Größe und Gewicht ein." />;
    }

    const bmiSegments = scaleSegments(BMI_CLASSES, ...BMI_SCALE).map((segment) => ({ ...segment, color: BMI_COLORS[segment.key] }));
    const bodyFatScale = [0, bySex(profile.sex, 40, 48)] as const;
    const bodyFatSegments = scaleSegments(BODY_FAT_CLASSES[profile.sex], ...bodyFatScale).map((segment, index, all) => ({
        ...segment,
        color: BODY_FAT_COLORS[segment.key],
        label: BODY_FAT_LABELS[segment.key],
        rangeText: index === all.length - 1 ? `ab ${segment.from} %` : index === 0 ? `unter ${segment.to} %` : `${segment.from}–${segment.to} %`,
    }));

    return (
        <>
            <Card title="Body-Mass-Index">
                <Gauge
                    segments={bmiSegments}
                    min={BMI_SCALE[0]}
                    max={BMI_SCALE[1]}
                    value={bmi.value}
                    valueText={formatNumber(bmi.value, 1)}
                    caption={BMI_LABELS[bmi.category]}
                    ticks={BMI_TICKS}
                />
            </Card>
            <ListGroup footer="WHO-Klassen für Erwachsene. Der BMI unterscheidet nicht zwischen Fett und Muskeln und überschätzt deshalb muskulöse Menschen.">
                <ListRow title="Gesunder Gewichtsbereich" value={`${mass(bmi.healthyRange[0])} – ${mass(bmi.healthyRange[1])}`} />
                <ListRow title="BMI Prime" subtitle="BMI ÷ 25" value={formatNumber(bmi.prime, 2)} />
                <ListRow title="Ponderal-Index" subtitle="kg/m³" value={formatNumber(bmi.ponderal, 1)} />
            </ListGroup>

            {bodyFat && (
                <>
                    <Card title={`Körperfett: ${percent(bodyFat.percent)}`}>
                        <RangeScale
                            segments={bodyFatSegments}
                            min={bodyFatScale[0]}
                            max={bodyFatScale[1]}
                            value={bodyFat.percent}
                            valueText={`${percent(bodyFat.percent)}, ${BODY_FAT_LABELS[bodyFat.category]}`}
                        />
                    </Card>
                    <ListGroup footer={`Weitere Werte auf Basis von ${BODY_FAT_SOURCE_LABELS[bodyFat.source]}. Klassen nach ACE, Idealwert nach Jackson & Pollock.`}>
                        <ListRow title="Kategorie" value={BODY_FAT_LABELS[bodyFat.category]} />
                        <ListRow title="US-Navy-Methode" value={orMissing(bodyFat.navy, percent)} />
                        <ListRow title="BMI-Methode" value={orMissing(bodyFat.bmiMethod, percent)} />
                        <ListRow title="Fettmasse" value={mass(bodyFat.fatKg)} />
                        <ListRow title="Magermasse" value={mass(bodyFat.leanKg)} />
                        <ListRow title="Idealer Körperfettanteil" subtitle="für dein Alter" value={percent(bodyFat.idealPercent)} />
                        <ListRow title="Fett bis zum Idealwert" value={mass(bodyFat.fatToIdealKg)} />
                    </ListGroup>
                </>
            )}

            <ListGroup header="Idealgewicht" footer="Klassische Formeln aus Größe und Geschlecht; sie berücksichtigen weder Muskelmasse noch Körperbau.">
                {IDEAL_WEIGHT_FORMULAS.map((formula) => (
                    <ListRow key={formula} title={IDEAL_WEIGHT_LABELS[formula]} value={orMissing(report.idealWeights?.[formula] ?? null, mass)} />
                ))}
            </ListGroup>

            <ListGroup
                header="Körperzusammensetzung"
                footer="FFMI: fettfreie Masse pro m², normalisiert auf 1,80 m. Taille/Größe ab 0,5 und Taille/Hüfte ab 0,90 (Männer) bzw. 0,85 (Frauen) gelten als erhöhtes Risiko."
            >
                {LEAN_MASS_FORMULAS.map((formula) => (
                    <ListRow key={formula} title={`Magermasse (${LEAN_MASS_LABELS[formula]})`} value={orMissing(report.leanMass[formula], mass)} />
                ))}
                <ListRow title="FFMI" value={orMissing(report.ffmi, (ffmi) => `${formatNumber(ffmi.value, 1)} · normalisiert ${formatNumber(ffmi.normalized, 1)}`)} />
                <ListRow title="Taille / Größe" value={orMissing(report.waistToHeight, ratioText)} />
                <ListRow title="Taille / Hüfte" value={orMissing(report.waistToHip, ratioText)} />
                <ListRow
                    title="Körperoberfläche"
                    subtitle="Mosteller · Du Bois"
                    value={orMissing(report.bodySurfaceArea, (area) => `${formatNumber(area.mosteller, 2)} · ${formatNumber(area.duBois, 2)} m²`)}
                />
            </ListGroup>
        </>
    );
}
