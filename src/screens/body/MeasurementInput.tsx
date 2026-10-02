import { NumberField } from "../../components/NumberField";
import { MEASUREMENT_RANGES } from "../../core/body/profile";
import type { BodyProfile, MeasurementField } from "../../core/body/profile";
import { cmToFeetInches, feetInchesToCm, fromDisplay, toDisplay, unitLabel } from "../../core/body/units";
import type { Quantity } from "../../core/body/units";
import styles from "./Body.module.scss";

/** Props every part of the body tab receives. */
export interface ProfileProps {
    profile: BodyProfile;
    onChange: (changes: Partial<BodyProfile>) => void;
}

interface MeasurementInputProps extends ProfileProps {
    field: MeasurementField;
    label: string;
    /** Converted between unit systems; omit for values without one (age, bpm, %). */
    quantity?: Quantity;
    /** Unit label for values without a quantity. */
    unit?: string;
    digits?: number;
}

/** Number field for one profile measurement, shown and typed in the chosen unit system. */
export function MeasurementInput({ profile, onChange, field, label, quantity, unit, digits = 1 }: MeasurementInputProps) {
    const shown = (metricValue: number) => (quantity ? toDisplay(quantity, metricValue, profile.units) : metricValue);
    const stored = profile[field];
    const [min, max] = MEASUREMENT_RANGES[field];
    return (
        <NumberField
            label={label}
            value={stored === null ? null : shown(stored)}
            unit={quantity ? unitLabel(quantity, profile.units) : unit}
            digits={digits}
            range={[shown(min), shown(max)]}
            onChange={(value) =>
                onChange({ [field]: value === null || !quantity ? value : fromDisplay(quantity, value, profile.units) })
            }
        />
    );
}

const FEET_RANGE = [4, 8] as const;
const INCHES_RANGE = [0, 11.9] as const;

/** Height in cm, or in feet and inches for the imperial system. */
export function HeightInput({ profile, onChange }: ProfileProps) {
    if (profile.units === "metric") {
        return <MeasurementInput profile={profile} onChange={onChange} field="heightCm" label="Größe" quantity="length" digits={0} />;
    }
    const height = profile.heightCm === null ? null : cmToFeetInches(profile.heightCm);
    const change = (feet: number | null, inches: number | null) =>
        onChange({ heightCm: feet === null ? null : feetInchesToCm(feet, inches ?? 0) });
    return (
        <div className={styles.pair}>
            <NumberField label="Größe (Fuß)" value={height?.feet ?? null} unit="ft" digits={0} range={FEET_RANGE} onChange={(feet) => change(feet, height?.inches ?? null)} />
            <NumberField label="Größe (Zoll)" value={height?.inches ?? null} unit="in" range={INCHES_RANGE} onChange={(inches) => change(height?.feet ?? null, inches)} />
        </div>
    );
}
