import { describe, expect, it } from "vitest";
import { heatColor, toCssColor } from "./heat";

describe("heatColor", () => {
    it("runs from yellow over orange to red", () => {
        expect(toCssColor(heatColor(0))).toBe("#ffd60a");
        expect(toCssColor(heatColor(0.5))).toBe("#ff9500");
        expect(toCssColor(heatColor(1))).toBe("#ff3b30");
    });

    it("blends between the stops", () => {
        expect(toCssColor(heatColor(0.25))).toBe("#ffb605");
        expect(toCssColor(heatColor(0.75))).toBe("#ff6818");
    });

    it("clamps values outside 0–1", () => {
        expect(heatColor(-3)).toBe(heatColor(0));
        expect(heatColor(7)).toBe(heatColor(1));
    });
});

describe("toCssColor", () => {
    it("zero-pads small values", () => {
        expect(toCssColor(0x0000ff)).toBe("#0000ff");
        expect(toCssColor(0)).toBe("#000000");
    });
});
