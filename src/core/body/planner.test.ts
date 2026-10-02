import { describe, expect, it } from "vitest";
import { planWeight } from "./planner";
import type { PlanInput } from "./planner";

const NOW = new Date(2026, 0, 1);

const INPUT: PlanInput = {
    sex: "male",
    heightCm: 180,
    currentKg: 80,
    goalKg: 78,
    kgPerWeek: 0.5,
    maintenanceAt: (weightKg) => 30 * weightKg,
    now: NOW,
};

describe("planWeight", () => {
    it("plans a loss week by week with falling maintenance", () => {
        const plan = planWeight(INPUT)!;
        expect(plan.weeks).toBe(4);
        expect(plan.endDate).toEqual(new Date(2026, 0, 29));
        expect(plan.points.map((point) => point.weightKg)).toEqual([80, 79.5, 79, 78.5, 78]);
        expect(plan.points[0].kcal).toBe(2400 - 550);
        expect(plan.points[1].kcal).toBe(2385 - 550);
        // The last point is the new maintenance
        expect(plan.points[4].kcal).toBe(2340);
        expect(plan.belowMinimum).toBe(false);
        expect(plan.goalUnderweight).toBe(false);
    });

    it("rounds a partial last week up and ends exactly at the goal", () => {
        const plan = planWeight({ ...INPUT, goalKg: 81.2, kgPerWeek: 1 })!;
        expect(plan.weeks).toBe(2);
        expect(plan.points.map((point) => point.weightKg)).toEqual([80, 81, 81.2]);
        expect(plan.points[0].kcal).toBe(2400 + 1100);
    });

    it("does not add a week for float noise", () => {
        expect(planWeight({ ...INPUT, currentKg: 77.5, goalKg: 75, kgPerWeek: 0.25 })!.weeks).toBe(10);
    });

    it("keeps the current weight when the goal is reached", () => {
        const plan = planWeight({ ...INPUT, goalKg: 80 })!;
        expect(plan.weeks).toBe(0);
        expect(plan.points).toEqual([{ week: 0, weightKg: 80, kcal: 2400 }]);
        expect(Object.is(plan.weeks, -0)).toBe(false);
    });

    it("warns about very low intake and an underweight goal", () => {
        const plan = planWeight({ ...INPUT, sex: "female", goalKg: 55, kgPerWeek: 1, maintenanceAt: () => 1800 })!;
        expect(plan.belowMinimum).toBe(true);
        expect(plan.goalUnderweight).toBe(true);
    });

    it("returns null without a goal", () => {
        expect(planWeight({ ...INPUT, goalKg: NaN })).toBeNull();
    });
});
