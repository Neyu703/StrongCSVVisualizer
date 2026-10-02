import { describe, expect, it } from "vitest";
import { cmToFeetInches, feetInchesToCm, formatEnergy, formatQuantity, fromDisplay, toDisplay, unitLabel, unitSystemOf } from "./units";

describe("units", () => {
    it("derives the unit system from the Strong weight unit", () => {
        expect(unitSystemOf("kg")).toBe("metric");
        expect(unitSystemOf("lb")).toBe("imperial");
    });

    it("keeps metric values unchanged", () => {
        expect(toDisplay("mass", 80, "metric")).toBe(80);
        expect(fromDisplay("length", 180, "metric")).toBe(180);
    });

    it("converts imperial values both ways", () => {
        expect(toDisplay("mass", 0.45359237, "imperial")).toBe(1);
        expect(fromDisplay("mass", toDisplay("mass", 72.6, "imperial"), "imperial")).toBeCloseTo(72.6);
        expect(toDisplay("length", 2.54, "imperial")).toBe(1);
        expect(fromDisplay("length", 10, "imperial")).toBe(25.4);
        expect(fromDisplay("distance", 1, "imperial")).toBe(1.609344);
    });

    it("labels units per system", () => {
        expect(unitLabel("distance", "metric")).toBe("km");
        expect(unitLabel("length", "imperial")).toBe("in");
    });

    it("splits heights into feet and inches without 12-inch remainders", () => {
        expect(cmToFeetInches(182.88)).toEqual({ feet: 6, inches: 0 });
        expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 10.9 });
        expect(feetInchesToCm(6, 0)).toBeCloseTo(182.88);
    });

    it("formats with German numbers and units", () => {
        expect(formatQuantity("mass", 72.6, "metric")).toBe("72,6 kg");
        expect(formatQuantity("mass", 45.359237, "imperial")).toBe("100 lb");
        expect(formatQuantity("length", 25.4, "imperial")).toBe("10 in");
        expect(formatQuantity("mass", 0.25, "metric", 2)).toBe("0,25 kg");
        expect(formatEnergy(1655, "kcal")).toBe("1.655 kcal");
        expect(formatEnergy(1000, "kJ")).toBe("4.184 kJ");
    });
});
