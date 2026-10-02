import { describe, expect, it } from "vitest";
import { allPositive, bySex, isInRange, recordOf, scaleSegments } from "./math";

describe("math", () => {
    it("accepts only finite positive measurements", () => {
        expect(allPositive(1, 2.5)).toBe(true);
        expect(allPositive()).toBe(true);
        expect(allPositive(1, 0)).toBe(false);
        expect(allPositive(NaN)).toBe(false);
        expect(allPositive(Infinity)).toBe(false);
    });

    it("picks values per sex", () => {
        expect(bySex("male", 1, 2)).toBe(1);
        expect(bySex("female", 1, 2)).toBe(2);
    });

    it("builds a record from keys", () => {
        expect(recordOf(["a", "b"], (key) => key.toUpperCase())).toEqual({ a: "A", b: "B" });
    });

    it("checks inclusive ranges", () => {
        expect(isInRange(1, [1, 2])).toBe(true);
        expect(isInRange(2.5, [1, 2])).toBe(false);
        expect(isInRange("1", [1, 2])).toBe(false);
    });

    it("cuts classes into scale segments", () => {
        const classes: [string, number][] = [
            ["low", 10],
            ["mid", 20],
            ["high", Infinity],
        ];
        expect(scaleSegments(classes, 5, 30)).toEqual([
            { key: "low", from: 5, to: 10 },
            { key: "mid", from: 10, to: 20 },
            { key: "high", from: 20, to: 30 },
        ]);
        expect(scaleSegments(classes, 12, 18)).toEqual([{ key: "mid", from: 12, to: 18 }]);
    });
});
