import { describe, expect, it } from "vitest";
import {
    describeImport,
    describeSet,
    describeTrainingHabit,
    formatCompact,
    formatDate,
    formatDuration,
    formatNumber,
    formatTrend,
    formatValue,
    formatWeight,
} from "./format";
import { makeSet } from "./testing";

describe("number formatting", () => {
    it("uses German notation with limited fraction digits", () => {
        expect(formatNumber(1234567)).toBe("1.234.567");
        expect(formatNumber(102.456, 1)).toBe("102,5");
        expect(formatWeight(102.5, "kg")).toBe("102,5 kg");
        expect(formatWeight(225, "lb")).toBe("225 lb");
    });

    it("abbreviates large numbers", () => {
        expect(formatCompact(1536368.5)).toMatch(/^1,5\s+Mio\.$/);
        expect(formatCompact(950)).toBe("950");
    });
});

describe("formatDuration", () => {
    it.each([
        [4080, "1 Std. 8 Min."],
        [3600, "1 Std. 0 Min."],
        [2520, "42 Min."],
        [45, "45 Sek."],
        [0, "0 Sek."],
    ])("%d s → %s", (seconds, text) => {
        expect(formatDuration(seconds)).toBe(text);
    });
});

describe("formatDate", () => {
    it("formats timestamps and epoch milliseconds in all styles", () => {
        expect(formatDate("2026-09-29 12:35:19", "medium")).toBe("29.09.2026");
        expect(formatDate("2026-09-29 12:35:19", "short")).toBe("29.09.26");
        expect(formatDate(new Date(2026, 8, 29).getTime(), "medium")).toBe("29.09.2026");
        expect(formatDate("2026-09-29 12:35:19", "long")).toContain("2026");
    });
});

describe("formatValue", () => {
    it("formats every kind of value", () => {
        expect(formatValue("weight", 100, "kg")).toBe("100 kg");
        expect(formatValue("reps", 8, "kg")).toBe("8 Wdh.");
        expect(formatValue("distance", 3.724, "kg")).toBe("3,72 km");
        expect(formatValue("time", 1500, "kg")).toBe("25 Min.");
    });
});

describe("formatTrend", () => {
    it("shows the monthly change with an explicit sign", () => {
        expect(formatTrend(0.05, "weight", "kg")).toBe("Trend: +1,5 kg pro Monat");
        expect(formatTrend(-0.05, "weight", "lb")).toBe("Trend: −1,5 lb pro Monat");
        expect(formatTrend(0, "reps", "kg")).toBe("Trend: ±0 Wdh. pro Monat");
    });
});

describe("describeSet", () => {
    it("describes weighted, rep-only, assisted and cardio sets", () => {
        expect(describeSet(makeSet(), "kg")).toBe("100 kg × 5");
        expect(describeSet(makeSet({ weight: 0, reps: 8 }), "kg")).toBe("8 Wdh.");
        expect(describeSet(makeSet({ exercise: "Pull Up (Assisted)", weight: 30, reps: 8 }), "kg")).toBe("−30 kg × 8");
        expect(describeSet(makeSet({ weight: 0, reps: 0, distance: 5, seconds: 1500 }), "kg")).toBe("5 km · 25 Min.");
        expect(describeSet(makeSet({ weight: 0, reps: 0, distance: 0, seconds: 900 }), "kg")).toBe("15 Min.");
        expect(describeSet(makeSet({ weight: 0, reps: 0, distance: 2, seconds: 0 }), "kg")).toBe("2 km");
    });
});

describe("describeImport", () => {
    it("summarizes nothing, one and many new workouts", () => {
        expect(describeImport(0, 0)).toContain("Keine neuen Workouts");
        expect(describeImport(1, 12)).toBe("1 neues Workout (12 Sätze) hinzugefügt.");
        expect(describeImport(196, 2449)).toBe("196 neue Workouts (2.449 Sätze) hinzugefügt.");
    });
});

describe("describeTrainingHabit", () => {
    it("names the usual weekday and hour window", () => {
        expect(describeTrainingHabit(1, 18)).toBe("Meist Di · meist 18–19 Uhr");
        expect(describeTrainingHabit(6, 23)).toBe("Meist So · meist 23–24 Uhr");
    });

    it("is empty without workouts", () => {
        expect(describeTrainingHabit(null, null)).toBe("");
        expect(describeTrainingHabit(1, null)).toBe("");
        expect(describeTrainingHabit(null, 18)).toBe("");
    });
});
