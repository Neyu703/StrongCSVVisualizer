import { describe, expect, it } from "vitest";
import { idealWeights } from "./idealWeight";

/**
 * Rounds every value of a record to one decimal for comparison.
 * @param weights weights per formula
 * @returns rounded text per formula
 */
function rounded(weights: Record<string, number>): Record<string, string> {
    return Object.fromEntries(Object.entries(weights).map(([formula, weight]) => [formula, weight.toFixed(1)]));
}

describe("ideal weight", () => {
    it("matches calculator.net for a man of 180 cm", () => {
        expect(rounded(idealWeights("male", 180)!)).toEqual({ robinson: "72.6", miller: "71.5", devine: "75.0", hamwi: "77.3" });
    });

    it("uses the female coefficients", () => {
        expect(rounded(idealWeights("female", 152.4)!)).toEqual({ robinson: "49.0", miller: "53.1", devine: "45.5", hamwi: "45.5" });
    });

    it("returns null without height", () => {
        expect(idealWeights("male", NaN)).toBeNull();
    });
});
