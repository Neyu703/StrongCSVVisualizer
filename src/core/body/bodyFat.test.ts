import { describe, expect, it } from "vitest";
import { bmi } from "./bmi";
import { bmiBodyFat, bodyFatCategory, bodyMassSplit, fatToIdeal, idealBodyFat, navyBodyFat } from "./bodyFat";

describe("body fat", () => {
    it("matches calculator.net for a 25-year-old man, 70 kg, 178 cm, neck 50, waist 96", () => {
        const percent = navyBodyFat({ sex: "male", heightCm: 178, neckCm: 50, waistCm: 96, hipCm: NaN })!;
        expect(percent.toFixed(1)).toBe("15.7");
        expect(bodyFatCategory("male", percent)).toBe("fitness");
        const { fatKg, leanKg } = bodyMassSplit(70, percent);
        expect([fatKg.toFixed(1), leanKg.toFixed(1)]).toEqual(["11.0", "59.0"]);
        const ideal = idealBodyFat("male", 25);
        expect(ideal).toBe(10.5);
        expect(fatToIdeal(70, percent, ideal).toFixed(1)).toBe("3.6");
        expect(bmiBodyFat("male", bmi(70, 178)!, 25)!.toFixed(1)).toBe("16.1");
    });

    it("uses the hip for women", () => {
        const percent = navyBodyFat({ sex: "female", heightCm: 166, neckCm: 32, waistCm: 72, hipCm: 98 })!;
        expect(percent).toBeCloseTo(495 / (1.29579 - 0.35004 * Math.log10(138) + 0.221 * Math.log10(166)) - 450);
        expect(bmiBodyFat("female", 22, 30)).toBeCloseTo(1.2 * 22 + 0.23 * 30 - 5.4);
    });

    it("returns null for missing or impossible measurements", () => {
        expect(navyBodyFat({ sex: "male", heightCm: 178, neckCm: 50, waistCm: 50, hipCm: NaN })).toBeNull();
        expect(navyBodyFat({ sex: "female", heightCm: NaN, neckCm: 32, waistCm: 72, hipCm: 98 })).toBeNull();
        expect(bmiBodyFat("male", 22, NaN)).toBeNull();
    });

    it.each([
        ["male", 5, "essential"],
        ["male", 13.9, "athletes"],
        ["male", 24, "average"],
        ["male", 25, "obese"],
        ["female", 13, "essential"],
        ["female", 20, "athletes"],
        ["female", 24, "fitness"],
        ["female", 31, "average"],
        ["female", 32, "obese"],
    ] as const)("classifies %s at %d %% as %s", (sex, percent, category) => {
        expect(bodyFatCategory(sex, percent)).toBe(category);
    });

    it("interpolates and clamps the ideal body fat table", () => {
        expect(idealBodyFat("male", 27.5)).toBeCloseTo(11.6);
        expect(idealBodyFat("female", 20)).toBe(17.7);
        expect(idealBodyFat("female", 18)).toBe(17.7);
        expect(idealBodyFat("male", 70)).toBe(20.9);
    });

    it("never asks to lose negative fat", () => {
        expect(fatToIdeal(70, 8, 10.5)).toBe(0);
    });
});
