import { describe, expect, it } from "vitest";
import { bodySurfaceArea, ffmi, leanMass, ratio } from "./composition";

describe("composition", () => {
    it.each([
        ["boer", "male", 0.407 * 80 + 0.267 * 180 - 19.2],
        ["boer", "female", 0.252 * 80 + 0.473 * 180 - 48.3],
        ["james", "male", 1.1 * 80 - 128 * (80 / 180) ** 2],
        ["james", "female", 1.07 * 80 - 148 * (80 / 180) ** 2],
        ["hume", "male", 0.3281 * 80 + 0.33929 * 180 - 29.5336],
        ["hume", "female", 0.29569 * 80 + 0.41813 * 180 - 43.2933],
    ] as const)("computes %s lean mass for %s", (formula, sex, expected) => {
        expect(leanMass(formula, sex, 80, 180)).toBeCloseTo(expected);
    });

    it("returns null for missing input", () => {
        expect(leanMass("boer", "male", NaN, 180)).toBeNull();
        expect(ffmi(60, NaN)).toBeNull();
        expect(ratio(80, 0)).toBeNull();
        expect(bodySurfaceArea(80, NaN)).toBeNull();
    });

    it("normalizes the FFMI to 1.80 m", () => {
        const result = ffmi(64.8, 180)!;
        expect(result.value).toBeCloseTo(20);
        expect(result.normalized).toBeCloseTo(20);
        expect(ffmi(57.6, 160)!.normalized).toBeCloseTo(22.5 + 6.1 * 0.2);
    });

    it("computes ratios and body surface area", () => {
        expect(ratio(90, 180)).toBe(0.5);
        const area = bodySurfaceArea(80, 180)!;
        expect(area.mosteller).toBe(2);
        expect(area.duBois).toBeCloseTo(0.007184 * 80 ** 0.425 * 180 ** 0.725);
    });
});
