import { describe, expect, it } from "vitest";
import { heartRateZones, maxHeartRate, oneRepMax, pace, riegel } from "./training";

describe("training", () => {
    it("estimates the 1RM with three formulas", () => {
        const result = oneRepMax(100, 5)!;
        expect(result.epley).toBeCloseTo(116.67, 2);
        expect(result.brzycki).toBeCloseTo(112.5);
        expect(result.lombardi).toBeCloseTo(100 * 5 ** 0.1);
        expect(oneRepMax(100, 1)).toEqual({ epley: 100, brzycki: 100, lombardi: 100 });
    });

    it.each([
        [NaN, 5],
        [100, 0],
        [100, 31],
        [100, 2.5],
    ])("rejects weight %d with %d reps", (weight, reps) => {
        expect(oneRepMax(weight, reps)).toBeNull();
    });

    it("estimates the maximum heart rate", () => {
        expect(maxHeartRate(30)).toEqual({ fox: 190, tanaka: 187 });
        expect(maxHeartRate(NaN)).toBeNull();
    });

    it("uses the heart rate reserve when the resting rate is known", () => {
        expect(heartRateZones(200, 60)[0]).toEqual([130, 144]);
        expect(heartRateZones(200, NaN)[4]).toEqual([180, 200]);
    });

    it("computes pace, speed and Riegel predictions", () => {
        expect(pace(10, 3000)).toEqual({ secondsPerKm: 300, kmh: 12 });
        expect(pace(0, 3000)).toBeNull();
        expect(riegel(5, 1500, 10)).toBeCloseTo(1500 * 2 ** 1.06);
    });
});
