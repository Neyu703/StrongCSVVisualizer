import { describe, expect, it } from "vitest";
import { formatClock, formatDecimal, parseClock, parseDecimal } from "./input";

describe("input", () => {
    it.each([
        ["", null],
        ["  ", null],
        ["80", 80],
        ["72,5", 72.5],
        ["72.5", 72.5],
        ["80,", 80],
        ["-3", NaN],
        ["1.234,5", NaN],
        ["abc", NaN],
    ])("parses %j as %s", (text, expected) => {
        expect(parseDecimal(text)).toBe(expected);
    });

    it("formats field values with a decimal comma", () => {
        expect(formatDecimal(null, 1)).toBe("");
        expect(formatDecimal(176.36980975, 1)).toBe("176,4");
        expect(formatDecimal(30, 0)).toBe("30");
    });

    it.each([
        ["", null],
        ["25:30", 1530],
        ["1:45:00", 6300],
        ["90", NaN],
        ["25:75", NaN],
        ["a:bc", NaN],
    ])("parses the duration %j as %s", (text, expected) => {
        expect(parseClock(text)).toBe(expected);
    });

    it("formats durations clock-style", () => {
        expect(formatClock(299.6)).toBe("5:00");
        expect(formatClock(65)).toBe("1:05");
        expect(formatClock(6300)).toBe("1:45:00");
    });
});
