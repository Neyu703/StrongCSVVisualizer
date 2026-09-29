import { Card } from "../components/Card";
import { ListGroup, SwitchRow } from "../components/ListGroup";
import { ModelCredit } from "../components/ModelCredit";
import { ScreenHeader } from "../components/ScreenHeader";
import { SegmentedControl } from "../components/SegmentedControl";
import type { SegmentOption } from "../components/SegmentedControl";
import type { BodyModel, Settings as SettingsValues } from "../core/settings";
import styles from "./Settings.module.scss";

const BODY_MODEL_OPTIONS: SegmentOption<BodyModel>[] = [
    { value: "male", label: "Männlich" },
    { value: "female", label: "Weiblich" },
];

interface SettingsProps {
    settings: SettingsValues;
    onChange: (changes: Partial<SettingsValues>) => void;
}

/** Settings tab: optional chart features and the 3D model. */
export function Settings({ settings, onChange }: SettingsProps) {
    return (
        <>
            <ScreenHeader title="Einstellungen" />
            <ListGroup
                header="Diagramme"
                footer="Übungsdiagramme: robuste Trendgerade nach Theil-Sen (Median aller Steigungen, unempfindlich gegen Ausreißer wie leichte Deload-Einheiten). Workouts pro Woche: Ausgleichsgerade nach der Methode der kleinsten Quadrate."
            >
                <SwitchRow
                    title="Trendlinien"
                    checked={settings.showTrendlines}
                    onChange={(showTrendlines) => onChange({ showTrendlines })}
                />
            </ListGroup>
            <Card title="3D-Modell im Tab Muskeln">
                <SegmentedControl
                    label="Körpermodell"
                    options={BODY_MODEL_OPTIONS}
                    value={settings.bodyModel}
                    onChange={(bodyModel) => onChange({ bodyModel })}
                />
                <p className={styles.note}>
                    Das weibliche Modell ist laut Autor eine illustrative, fachlich nicht geprüfte Abwandlung des
                    männlichen Modells.
                </p>
                <ModelCredit />
            </Card>
        </>
    );
}
