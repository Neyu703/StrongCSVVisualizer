import { describe, expect, it } from "vitest";
import { busiestHour, busiestWeekday, trainingCalendar } from "./calendar";
import { parseDate } from "./dates";
import { makeWorkout } from "./testing";

const WORKOUTS = [
    makeWorkout({ date: "2024-03-12 18:30:00" }),
    makeWorkout({ date: "2024-03-12 19:10:00" }),
    makeWorkout({ date: "2024-03-18 18:00:00" }),
    makeWorkout({ date: "2024-01-02 07:00:00" }),
];

describe("trainingCalendar", () => {
    const calendar = trainingCalendar(WORKOUTS, parseDate("2024-03-20 09:00:00"), 2);

    it("returns the requested number of weeks ending with the current one, Monday to Sunday", () => {
        expect(calendar.map((week) => week.weekStart)).toEqual(["2024-03-11", "2024-03-18"]);
        expect(calendar[0].days.map((day) => day.day)).toEqual([
            "2024-03-11",
            "2024-03-12",
            "2024-03-13",
            "2024-03-14",
            "2024-03-15",
            "2024-03-16",
            "2024-03-17",
        ]);
    });

    it("counts workouts per day and ignores workouts outside the window", () => {
        expect(calendar.flatMap((week) => week.days.map((day) => day.workouts))).toEqual([
            0, 2, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
        ]);
    });

    it("marks the days after today as future", () => {
        expect(calendar[1].days.map((day) => day.future)).toEqual([false, false, false, true, true, true, true]);
        expect(calendar[0].days.some((day) => day.future)).toBe(false);
    });

    it("defaults to 53 weeks", () => {
        expect(trainingCalendar([], parseDate("2024-03-20 09:00:00"))).toHaveLength(53);
    });
});

describe("busiestWeekday", () => {
    it("returns the most frequent weekday with Monday as 0", () => {
        expect(busiestWeekday(WORKOUTS)).toBe(1);
    });

    it("prefers the earlier weekday on a tie", () => {
        expect(busiestWeekday([makeWorkout({ date: "2024-03-13 10:00:00" }), makeWorkout({ date: "2024-03-11 10:00:00" })])).toBe(0);
    });

    it("returns null without workouts", () => {
        expect(busiestWeekday([])).toBeNull();
    });
});

describe("busiestHour", () => {
    it("returns the most frequent start hour", () => {
        expect(busiestHour(WORKOUTS)).toBe(18);
    });

    it("returns null without workouts", () => {
        expect(busiestHour([])).toBeNull();
    });
});
