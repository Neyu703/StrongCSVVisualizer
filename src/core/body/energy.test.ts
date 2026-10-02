import { describe, expect, it } from "vitest";
import { ACTIVITY_LEVELS, BMR_FORMULAS, bmr, calorieGoals, caloriesForChange, tdee } from "./energy";
import type { BmrInput } from "./energy";

const MAN: BmrInput = { sex: "male", age: 25, weightKg: 65, heightCm: 180, leanMassKg: 55 };
const WOMAN: BmrInput = { ...MAN, sex: "female" };

describe("energy", () => {
    it("lists all formulas and activity levels", () => {
        expect(BMR_FORMULAS).toEqual(["mifflin", "harris", "katch"]);
        expect(ACTIVITY_LEVELS).toHaveLength(6);
    });

    it("computes Mifflin-St Jeor like calculator.net", () => {
        expect(bmr("mifflin", MAN)).toBe(1655);
        expect(bmr("mifflin", WOMAN)).toBe(1489);
    });

    it("computes the revised Harris-Benedict rate", () => {
        expect(bmr("harris", MAN)).toBeCloseTo(13.397 * 65 + 4.799 * 180 - 5.677 * 25 + 88.362);
        expect(bmr("harris", WOMAN)).toBeCloseTo(9.247 * 65 + 3.098 * 180 - 4.33 * 25 + 447.593);
    });

    it("computes Katch-McArdle from lean mass", () => {
        expect(bmr("katch", MAN)).toBeCloseTo(370 + 21.6 * 55);
        expect(bmr("katch", { ...MAN, leanMassKg: NaN })).toBeNull();
    });

    it("returns null for missing body data", () => {
        expect(bmr("mifflin", { ...MAN, age: NaN })).toBeNull();
        expect(bmr("harris", { ...MAN, heightCm: 0 })).toBeNull();
    });

    it("scales by activity and adds 1100 kcal per kg and week", () => {
        expect(tdee(1000, "sedentary")).toBe(1200);
        expect(tdee(1000, "extreme")).toBe(1900);
        expect(caloriesForChange(2000, -0.5)).toBe(1450);
        expect(calorieGoals(2000).map((goal) => Math.round(goal.kcal))).toEqual([900, 1450, 1725, 2000, 2275, 2550, 3100]);
    });
});
