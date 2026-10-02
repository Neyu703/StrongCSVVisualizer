import { useMemo, useState } from "react";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import type { SegmentOption } from "../components/SegmentedControl";
import { StatGrid } from "../components/StatGrid";
import { StatTile } from "../components/StatTile";
import { defaultProfile } from "../core/body/profile";
import { ACTIVITY_FACTORS } from "../core/body/energy";
import { bodyReport } from "../core/body/report";
import { formatEnergy, toDisplay, unitLabel, unitSystemOf } from "../core/body/units";
import { formatNumber } from "../core/format";
import type { BodyModel } from "../core/settings";
import type { WeightUnit, WorkoutSet } from "../core/types";
import { useBodyProfile } from "../useBodyProfile";
import { BodySection } from "./body/BodySection";
import { EnergySection } from "./body/EnergySection";
import { BMI_COLORS, BMI_LABELS, BMR_LABELS, BODY_FAT_COLORS, BODY_FAT_LABELS, BODY_FAT_SOURCE_LABELS, MISSING, orMissing } from "./body/labels";
import { PlannerSection } from "./body/PlannerSection";
import { ProfileCard } from "./body/ProfileCard";
import { TrainingSection } from "./body/TrainingSection";
import styles from "./body/Body.module.scss";

type Section = "body" | "energy" | "planner" | "training";

const SECTIONS: SegmentOption<Section>[] = [
    { value: "body", label: "Körper" },
    { value: "energy", label: "Energie & Ernährung" },
    { value: "planner", label: "Ziel-Planer" },
    { value: "training", label: "Training" },
];

interface BodyProps {
    sets: WorkoutSet[];
    /** Weight unit of the imported data; sets the starting unit system. */
    unit: WeightUnit;
    /** 3D model setting; sets the starting sex. */
    bodyModel: BodyModel;
    now: Date;
}

/** Body tab: one profile drives live estimates of body composition, energy, a weight plan and training values. */
export function Body({ sets, unit, bodyModel, now }: BodyProps) {
    const { profile, updateProfile } = useBodyProfile(() => defaultProfile(bodyModel, unitSystemOf(unit)));
    const report = useMemo(() => bodyReport(profile, now), [profile, now]);
    const [section, setSection] = useState<Section>("body");
    const sectionProps = { profile, report, onChange: updateProfile };
    const idealWeights = report.idealWeights && Object.values(report.idealWeights);
    const massNumber = (kg: number) => formatNumber(toDisplay("mass", kg, profile.units));

    return (
        <>
            <ScreenHeader title="Körper" />
            <ProfileCard profile={profile} onChange={updateProfile} />
            <StatGrid>
                <StatTile
                    label="BMI"
                    value={orMissing(report.bmi, (bmi) => formatNumber(bmi.value, 1))}
                    detail={report.bmi ? BMI_LABELS[report.bmi.category] : undefined}
                    detailColor={report.bmi ? BMI_COLORS[report.bmi.category] : undefined}
                />
                <StatTile
                    label="Körperfett"
                    value={orMissing(report.bodyFat, (bodyFat) => `${formatNumber(bodyFat.percent, 1)} %`)}
                    detail={report.bodyFat ? `${BODY_FAT_LABELS[report.bodyFat.category]} · ${BODY_FAT_SOURCE_LABELS[report.bodyFat.source]}` : undefined}
                    detailColor={report.bodyFat ? BODY_FAT_COLORS[report.bodyFat.category] : undefined}
                />
                <StatTile
                    label="Tagesbedarf"
                    value={orMissing(report.maintenance, (kcal) => formatEnergy(kcal, profile.energyUnit))}
                    detail={`${BMR_LABELS[profile.bmrFormula]} · Faktor ${formatNumber(ACTIVITY_FACTORS[profile.activity], 3)}`}
                />
                <StatTile
                    label="Idealgewicht"
                    value={
                        idealWeights
                            ? `${massNumber(Math.min(...idealWeights))}–${massNumber(Math.max(...idealWeights))} ${unitLabel("mass", profile.units)}`
                            : MISSING
                    }
                    detail="Spanne aus 4 Formeln"
                />
            </StatGrid>
            <div className={styles.sectionPicker}>
                <SegmentedControl label="Bereich" options={SECTIONS} value={section} onChange={setSection} />
            </div>
            {section === "body" && <BodySection {...sectionProps} />}
            {section === "energy" && <EnergySection {...sectionProps} />}
            {section === "planner" && <PlannerSection {...sectionProps} />}
            {section === "training" && <TrainingSection profile={profile} report={report} sets={sets} libraryUnit={unit} />}
            <p className={styles.disclaimer}>Alle Werte sind Schätzungen aus Formeln und ersetzen keine medizinische Beratung.</p>
        </>
    );
}
