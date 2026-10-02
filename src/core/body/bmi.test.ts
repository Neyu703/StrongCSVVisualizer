import { describe, expect, it } from "vitest";
import { bmi, bmiCategory, bmiPrime, healthyWeightRange, ponderalIndex } from "./bmi";

describe("bmi", () => {
    it("matches calculator.net for 65 kg at 180 cm", () => {
        const value = bmi(65, 180)!;
        expect(value.toFixed(1)).toBe("20.1");
        expect(bmiPrime(value).toFixed(1)).toBe("0.8");
        expect(ponderalIndex(65, 180)!.toFixed(1)).toBe("11.1");
        expect(healthyWeightRange(180)!.map((weight) => weight.toFixed(1))).toEqual(["59.9", "81.0"]);
    });

    it.each([
        [15.9, "severeThinness"],
        [16, "moderateThinness"],
        [17, "mildThinness"],
        [18.5, "normal"],
        [24.9, "normal"],
        [25, "overweight"],
        [30, "obese1"],
        [35, "obese2"],
        [40, "obese3"],
        [60, "obese3"],
    ])("classifies BMI %d as %s", (value, category) => {
        expect(bmiCategory(value)).toBe(category);
    });

    it("returns null for missing or invalid input", () => {
        expect(bmi(NaN, 180)).toBeNull();
        expect(bmi(65, 0)).toBeNull();
        expect(ponderalIndex(-1, 180)).toBeNull();
        expect(healthyWeightRange(NaN)).toBeNull();
    });
});
