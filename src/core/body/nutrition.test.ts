import { describe, expect, it } from "vitest";
import { macros, waterNeed } from "./nutrition";

describe("nutrition", () => {
    it("fills the calories left after protein and fat with carbs", () => {
        // 2400 kcal: 144 g protein = 576 kcal, 25 % fat = 600 kcal, 1224 kcal carbs
        expect(macros(2400, 80, 1.8, 0.25)).toEqual({ proteinG: 144, fatG: 600 / 9, carbsG: 306 });
    });

    it("never plans negative carbs", () => {
        expect(macros(1000, 100, 2.2, 0.4).carbsG).toBe(0);
    });

    it("needs 35 ml water per kg", () => {
        expect(waterNeed(80)).toBe(2800);
    });
});
