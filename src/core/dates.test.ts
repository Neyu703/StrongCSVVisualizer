import { describe, expect, it } from "vitest";
import { daysBefore, isoDay, mondayOf, parseDate } from "./dates";

describe("dates", () => {
    it("computes the start of a day-based time window", () => {
        expect(isoDay(new Date(daysBefore(new Date(2024, 2, 10, 12), 7)))).toBe("2024-03-03");
    });

    it("parses a Strong timestamp as local time", () => {
        const date = parseDate("2024-03-05 13:45:10");
        expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2024, 2, 5, 13]);
    });

    it("finds the Monday of a week, also for Sundays", () => {
        expect(isoDay(mondayOf(parseDate("2024-03-06 12:00:00")))).toBe("2024-03-04");
        expect(isoDay(mondayOf(parseDate("2024-03-10 23:59:00")))).toBe("2024-03-04");
        expect(isoDay(mondayOf(parseDate("2024-03-04 00:00:00")))).toBe("2024-03-04");
    });

    it("zero-pads month and day", () => {
        expect(isoDay(new Date(2024, 0, 2))).toBe("2024-01-02");
    });
});
