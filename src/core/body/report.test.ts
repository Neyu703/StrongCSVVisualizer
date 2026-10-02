import { describe, expect, it } from "vitest";
import { defaultProfile } from "./profile";
import type { BodyProfile } from "./profile";
import { bodyReport } from "./report";

const NOW = new Date(2026, 0, 1);

/** The calculator.net reference man: 25 years, 70 kg, 178 cm, neck 50, waist 96. */
const PROFILE: BodyProfile = { ...defaultProfile("male", "metric"), age: 25, weightKg: 70, heightCm: 178, neckCm: 50, waistCm: 96, hipCm: 100 };

describe("bodyReport", () => {
    it("combines all results for a complete profile", () => {
        const report = bodyReport(PROFILE, NOW);
        expect(report.bmi!.category).toBe("normal");
        expect(report.bodyFat).toMatchObject({ source: "navy", category: "fitness", idealPercent: 10.5 });
        expect(report.bodyFat!.percent.toFixed(1)).toBe("15.7");
        expect(report.bodyFat!.bmiMethod!.toFixed(1)).toBe("16.1");
        expect(report.idealWeights).not.toBeNull();
        expect(report.leanMass.boer).toBeCloseTo(0.407 * 70 + 0.267 * 178 - 19.2);
        expect(report.ffmi!.value).toBeCloseTo(report.bodyFat!.leanKg / 1.78 ** 2);
        expect(report.waistToHeight!.elevated).toBe(true);
        expect(report.waistToHip!.value).toBe(0.96);
        expect(report.bodySurfaceArea).not.toBeNull();
        expect(report.bmr.mifflin).toBe(10 * 70 + 6.25 * 178 - 5 * 25 + 5);
        expect(report.bmr.katch).toBeCloseTo(370 + 21.6 * report.bodyFat!.leanKg);
        expect(report.maintenance).toBeCloseTo(report.bmr.mifflin! * 1.465);
        expect(report.calorieGoals).toHaveLength(7);
        expect(report.targetKcal).toBe(report.maintenance);
        expect(report.macros!.proteinG).toBeCloseTo(126);
        expect(report.waterMl).toBe(2450);
        expect(report.maxHeartRate).toEqual({ fox: 195, tanaka: 190.5 });
        expect(report.heartRateZones).toHaveLength(5);
        expect(report.plan).toBeNull();
    });

    it("prefers a measured body fat value and bases the macros on the plan", () => {
        const report = bodyReport({ ...PROFILE, bodyFatPercent: 12, goalWeightKg: 68, bmrFormula: "katch" }, NOW);
        expect(report.bodyFat).toMatchObject({ source: "measured", percent: 12 });
        expect(report.bmr.katch).toBeCloseTo(370 + 21.6 * 61.6);
        expect(report.plan!.weeks).toBe(4);
        expect(report.plan!.points[1].kcal).toBeCloseTo((370 + 21.6 * 69.5 * 0.88) * 1.465 - 550);
        expect(report.targetKcal).toBe(report.plan!.points[0].kcal);
    });

    it("falls back to the BMI method without circumferences", () => {
        const report = bodyReport({ ...PROFILE, neckCm: null }, NOW);
        expect(report.bodyFat!.source).toBe("bmi");
        expect(report.waistToHip!.elevated).toBe(true);
    });

    it("degrades to null results for an empty profile", () => {
        const empty: BodyProfile = {
            ...PROFILE,
            age: null,
            heightCm: null,
            weightKg: null,
            neckCm: null,
            waistCm: null,
            hipCm: null,
        };
        const report = bodyReport(empty, NOW);
        expect(report.bmi).toBeNull();
        expect(report.bodyFat).toBeNull();
        expect(report.ffmi).toBeNull();
        expect(report.maintenance).toBeNull();
        expect(report.calorieGoals).toEqual([]);
        expect(report.macros).toBeNull();
        expect(report.waterMl).toBeNull();
        expect(report.heartRateZones).toBeNull();
        expect(report.plan).toBeNull();
    });

    it("needs a body weight for a measured body fat value", () => {
        expect(bodyReport({ ...PROFILE, weightKg: null, bodyFatPercent: 15 }, NOW).bodyFat).toBeNull();
    });
});
