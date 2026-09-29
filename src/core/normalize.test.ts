import { describe, expect, it } from "vitest";
import { parseCsv } from "./csv";
import { normalizeRows, parseDuration } from "./normalize";
import { LEGACY_HEADER } from "./testing";

const NEW_HEADER =
    "Workout #;Date;Workout Name;Duration (sec);Exercise Name;Set Order;Weight (lb);Reps;RPE;Distance (meters);Seconds;Notes;Workout Notes";

describe("parseDuration", () => {
    it.each([
        ["42m", 2520],
        ["1h 8m", 4080],
        ["1h 5m 3s", 3903],
        ["2520", 2520],
        ["", 0],
        ["abc", 0],
    ])("%s → %d seconds", (text, seconds) => {
        expect(parseDuration(text)).toBe(seconds);
    });
});

describe("normalizeRows", () => {
    it("normalizes the legacy comma export", () => {
        const csv = [
            LEGACY_HEADER,
            '2022-02-28 11:49:43,"Deadlift Baby",42m,"Highrow ",W,60.0,10.0,0,0.0,"","Deadlift only",7',
            "2022-02-28 11:49:43,Deadlift Baby,42m,Highrow ,Rest Timer,0,0.0,0,180.0,,,",
            "2022-02-28 11:49:43,Deadlift Baby,42m,Running,1,0,0.0,3.72,624.0,,,",
        ].join("\n");
        const { unit, sets } = normalizeRows(parseCsv(csv));
        expect(unit).toBe("kg");
        expect(sets).toHaveLength(2);
        expect(sets[0]).toEqual({
            date: "2022-02-28 11:49:43",
            workout: "Deadlift Baby",
            duration: 2520,
            exercise: "Highrow",
            setOrder: "W",
            weight: 60,
            reps: 10,
            distance: 0,
            seconds: 0,
            rpe: 7,
            notes: "",
            workoutNotes: "Deadlift only",
        });
        expect(sets[1]).toMatchObject({ distance: 3.72, seconds: 624, rpe: null });
    });

    it("normalizes the new semicolon export with units in the headers", () => {
        const csv = [NEW_HEADER, "1;2024-01-02 10:00:00;Push;3600;Bench;1;100,5;5;8;1500;0;;"].join("\n");
        const { unit, sets } = normalizeRows(parseCsv(csv));
        expect(unit).toBe("lb");
        expect(sets[0]).toMatchObject({ duration: 3600, weight: 100.5, reps: 5, rpe: 8, distance: 1.5 });
    });

    it("treats a kg header as kg and tolerates invalid numbers and missing columns", () => {
        const csv = "Date;Exercise Name;Weight (kg);Reps\n2024-01-02 10:00:00;Bench;x;5";
        const { unit, sets } = normalizeRows(parseCsv(csv));
        expect(unit).toBe("kg");
        expect(sets[0]).toMatchObject({ weight: 0, reps: 5, workout: "", duration: 0, rpe: null, distance: 0 });
    });

    it("rejects files that are not Strong exports", () => {
        expect(() => normalizeRows(parseCsv("a,b\n1,2"))).toThrow("keine Strong-CSV");
        expect(() => normalizeRows([])).toThrow("keine Strong-CSV");
    });

    it("returns no sets when only Rest Timer rows exist", () => {
        const csv = `${LEGACY_HEADER}\n2022-02-28 11:49:43,A,1m,B,Rest Timer,0,0,0,180,,,`;
        expect(normalizeRows(parseCsv(csv)).sets).toEqual([]);
    });
});
