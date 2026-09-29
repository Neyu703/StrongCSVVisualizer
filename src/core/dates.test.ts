import { describe, expect, it } from "vitest";
import { daysBefore, isoDay, lastWeekStarts, mondayOf, parseDate, weekStarts } from "./dates";

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

    it("lists the Mondays from the first date's week up to the current week", () => {
        expect(weekStarts(parseDate("2024-03-06 12:00:00"), parseDate("2024-03-20 09:00:00"))).toEqual([
            "2024-03-04",
            "2024-03-11",
            "2024-03-18",
        ]);
    });

    it("lists a single week when both dates share it", () => {
        expect(weekStarts(parseDate("2024-03-04 00:00:00"), parseDate("2024-03-10 23:00:00"))).toEqual(["2024-03-04"]);
    });

    it("lists the Mondays of the last weeks ending with the current one", () => {
        expect(lastWeekStarts(parseDate("2024-03-20 09:00:00"), 3)).toEqual(["2024-03-04", "2024-03-11", "2024-03-18"]);
        expect(lastWeekStarts(parseDate("2024-03-20 09:00:00"), 1)).toEqual(["2024-03-18"]);
    });

    it("counts calendar weeks even across a daylight-saving change just after midnight", () => {
        expect(lastWeekStarts(parseDate("2024-04-01 00:30:00"), 2)).toEqual(["2024-03-25", "2024-04-01"]);
    });
});
