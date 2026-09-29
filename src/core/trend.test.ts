import { describe, expect, it } from "vitest";
import { addTrend } from "./trend";
import type { TrendMethod } from "./trend";

interface Point {
    day: number;
    value: number;
}

const AXES = { x: (point: Point) => point.day, y: (point: Point) => point.value };

/** Builds points on the line y = 2x + 1. */
function linearPoints(days: number[]): Point[] {
    return days.map((day) => ({ day, value: 2 * day + 1 }));
}

describe.each<TrendMethod>(["theil-sen", "least-squares"])("addTrend (%s)", (method) => {
    it("reproduces an exact line, also with uneven spacing", () => {
        const result = addTrend(linearPoints([0, 1, 5, 6, 20]), AXES, method);
        expect(result?.slope).toBeCloseTo(2);
        expect(result?.points.map((point) => point.trend)).toEqual([1, 3, 11, 13, 41].map((value) => expect.closeTo(value)));
    });

    it("keeps the original point fields", () => {
        const result = addTrend(linearPoints([0, 1]), AXES, method);
        expect(result?.points[1]).toMatchObject({ day: 1, value: 3 });
    });

    it("finds a falling trend", () => {
        const points = [10, 8, 6, 4].map((value, day) => ({ day, value }));
        expect(addTrend(points, AXES, method)?.slope).toBeCloseTo(-2);
    });

    it("cannot fit fewer than two points or points sharing one x", () => {
        expect(addTrend([], AXES, method)).toBeNull();
        expect(addTrend(linearPoints([3]), AXES, method)).toBeNull();
        expect(addTrend([{ day: 3, value: 1 }, { day: 3, value: 5 }], AXES, method)).toBeNull();
    });

    it("passes the point index to the x accessor", () => {
        const points = [{ value: 5 }, { value: 7 }, { value: 9 }];
        const result = addTrend(points, { x: (_, index) => index, y: (point) => point.value }, method);
        expect(result?.slope).toBeCloseTo(2);
    });
});

describe("robustness", () => {
    /** A steady +2 per day line with one crashed session. */
    const withOutlier = [...linearPoints([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])];
    withOutlier[9] = { day: 9, value: -40 };

    it("Theil-Sen ignores a single outlier, least squares gets pulled away", () => {
        expect(addTrend(withOutlier, AXES, "theil-sen")?.slope).toBeCloseTo(2);
        expect(addTrend(withOutlier, AXES, "least-squares")?.slope).toBeLessThan(0.5);
    });

    it("Theil-Sen handles an even and an odd number of slopes", () => {
        expect(addTrend(linearPoints([0, 1, 2]), AXES, "theil-sen")?.slope).toBeCloseTo(2);
        expect(addTrend(linearPoints([0, 1]), AXES, "theil-sen")?.slope).toBeCloseTo(2);
    });

    it("least squares follows the average of noisy data", () => {
        const points = [1, 3, 2, 5, 4, 6].map((value, day) => ({ day, value }));
        expect(addTrend(points, AXES, "least-squares")?.slope).toBeCloseTo(0.8857, 4);
    });
});
