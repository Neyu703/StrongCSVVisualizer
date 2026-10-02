import type { ReactNode } from "react";
import { Card } from "../../components/Card";
import { SegmentedControl } from "../../components/SegmentedControl";
import { SelectField } from "../../components/SelectField";
import { ACTIVITY_OPTIONS, ENERGY_OPTIONS, SEX_OPTIONS, UNIT_OPTIONS } from "./labels";
import { HeightInput, MeasurementInput } from "./MeasurementInput";
import type { ProfileProps } from "./MeasurementInput";
import styles from "./Body.module.scss";

/** Visible caption above a control group that labels itself via ARIA. */
export function LabeledGroup({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className={styles.group}>
            <span className={styles.groupLabel}>{label}</span>
            {children}
        </div>
    );
}

/** Inputs shared by all body calculators: sex, units, measurements and activity. */
export function ProfileCard({ profile, onChange }: ProfileProps) {
    const inputProps = { profile, onChange };
    return (
        <Card title="Profil">
            <div className={styles.switches}>
                <LabeledGroup label="Geschlecht">
                    <SegmentedControl label="Geschlecht" options={SEX_OPTIONS} value={profile.sex} onChange={(sex) => onChange({ sex })} />
                </LabeledGroup>
                <LabeledGroup label="Einheiten">
                    <SegmentedControl label="Einheiten" options={UNIT_OPTIONS} value={profile.units} onChange={(units) => onChange({ units })} />
                </LabeledGroup>
                <LabeledGroup label="Energie">
                    <SegmentedControl label="Energie" options={ENERGY_OPTIONS} value={profile.energyUnit} onChange={(energyUnit) => onChange({ energyUnit })} />
                </LabeledGroup>
            </div>
            <div className={styles.fields}>
                <MeasurementInput {...inputProps} field="age" label="Alter" unit="Jahre" digits={0} />
                <HeightInput {...inputProps} />
                <MeasurementInput {...inputProps} field="weightKg" label="Gewicht" quantity="mass" />
                <MeasurementInput {...inputProps} field="neckCm" label="Halsumfang" quantity="length" />
                <MeasurementInput {...inputProps} field="waistCm" label="Taillenumfang" quantity="length" />
                <MeasurementInput {...inputProps} field="hipCm" label="Hüftumfang" quantity="length" />
                <MeasurementInput {...inputProps} field="restingHeartRate" label="Ruhepuls (optional)" unit="bpm" digits={0} />
                <MeasurementInput {...inputProps} field="bodyFatPercent" label="Körperfett gemessen (optional)" unit="%" />
            </div>
            <SelectField label="Aktivität" options={ACTIVITY_OPTIONS} value={profile.activity} onChange={(activity) => onChange({ activity })} />
            <p className={styles.note}>
                Taille auf Höhe des Bauchnabels, Hals unterhalb des Kehlkopfs, Hüfte an der breitesten Stelle messen. Ein gemessener
                Körperfettwert ersetzt die Schätzungen in allen Ergebnissen.
            </p>
        </Card>
    );
}
