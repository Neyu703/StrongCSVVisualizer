import { MS_PER_DAY } from "../dates";
import { HEALTHY_BMI, bmi } from "./bmi";
import { caloriesForChange } from "./energy";
import { allPositive } from "./math";
import type { Sex } from "./math";

/** Lowest daily intake recommended without medical supervision. */
export const MIN_DAILY_KCAL: Record<Sex, number> = { male: 1500, female: 1200 };

/** Planned state at the start of one week. */
export interface PlanWeek {
    week: number;
    weightKg: number;
    /** Daily intake during this week; in the last entry the maintenance at the goal weight. */
    kcal: number;
}

export interface WeightPlan {
    weeks: number;
    endDate: Date;
    points: PlanWeek[];
    /** Some planned intake lies below MIN_DAILY_KCAL. */
    belowMinimum: boolean;
    /** The goal weight gives an underweight BMI. */
    goalUnderweight: boolean;
}

export interface PlanInput {
    sex: Sex;
    heightCm: number;
    currentKg: number;
    goalKg: number;
    /** Planned change per week in kg, positive for gain and loss alike. */
    kgPerWeek: number;
    /** Daily energy expenditure at a body weight; it falls as weight drops. */
    maintenanceAt: (weightKg: number) => number;
    now: Date;
}

/**
 * Plans the way to a goal weight at a steady weekly rate, recomputing maintenance each week.
 * @param input body data, goal, rate and start date
 * @returns weeks, end date, weekly points and warnings; null for missing input
 */
export function planWeight({ sex, heightCm, currentKg, goalKg, kgPerWeek, maintenanceAt, now }: PlanInput): WeightPlan | null {
    if (!allPositive(heightCm, currentKg, goalKg, kgPerWeek)) {
        return null;
    }
    const direction = Math.sign(goalKg - currentKg);
    // The tolerance keeps float noise such as 10.000000001 from adding a week
    const weeks = Math.max(0, Math.ceil(Math.abs(goalKg - currentKg) / kgPerWeek - 1e-9));
    const points = Array.from({ length: weeks + 1 }, (_, week): PlanWeek => {
        const weightKg = week === weeks ? goalKg : currentKg + direction * kgPerWeek * week;
        const weeklyChange = week === weeks ? 0 : direction * kgPerWeek;
        return { week, weightKg, kcal: caloriesForChange(maintenanceAt(weightKg), weeklyChange) };
    });
    return {
        weeks,
        endDate: new Date(now.getTime() + weeks * 7 * MS_PER_DAY),
        points,
        belowMinimum: points.some((point) => point.kcal < MIN_DAILY_KCAL[sex]),
        goalUnderweight: bmi(goalKg, heightCm)! < HEALTHY_BMI[0],
    };
}
