import { describe, expect, it } from "vitest";
import { searchWorkouts } from "./search";
import { makeSet } from "./testing";
import { groupWorkouts } from "./stats";

const WORKOUTS = groupWorkouts([
    makeSet({ date: "2024-01-01 10:00:00", workout: "Push Day", exercise: "Bench Press", notes: "Schulter zwickt", workoutNotes: "Neuer Plan" }),
    makeSet({ date: "2024-01-01 10:00:00", workout: "Push Day", exercise: "Bench Press", notes: "" }),
    makeSet({ date: "2024-01-03 10:00:00", workout: "Pull Day", exercise: "Deadlift", notes: "  " }),
    makeSet({ date: "2024-01-05 10:00:00", workout: "Legs", exercise: "Squat", notes: "linke Schulter besser" }),
]);

describe("searchWorkouts", () => {
    it("returns every workout without notes for an empty or blank query", () => {
        expect(searchWorkouts(WORKOUTS, "")).toHaveLength(3);
        expect(searchWorkouts(WORKOUTS, "   ").every((match) => match.notes.length === 0)).toBe(true);
    });

    it("matches the workout name, ignoring case and surrounding spaces", () => {
        expect(searchWorkouts(WORKOUTS, " PULL ").map((match) => match.workout.name)).toEqual(["Pull Day"]);
    });

    it("matches exercise names", () => {
        expect(searchWorkouts(WORKOUTS, "squat").map((match) => match.workout.name)).toEqual(["Legs"]);
    });

    it("matches workout notes and returns them", () => {
        const [match] = searchWorkouts(WORKOUTS, "neuer plan");
        expect(match.workout.name).toBe("Push Day");
        expect(match.notes).toEqual(["Neuer Plan"]);
    });

    it("matches set notes and returns only the matching ones", () => {
        const matches = searchWorkouts(WORKOUTS, "schulter");
        expect(matches.map((match) => match.workout.name)).toEqual(["Push Day", "Legs"]);
        expect(matches.map((match) => match.notes)).toEqual([["Schulter zwickt"], ["linke Schulter besser"]]);
    });

    it("returns nothing when no workout matches", () => {
        expect(searchWorkouts(WORKOUTS, "xyz")).toEqual([]);
    });
});
