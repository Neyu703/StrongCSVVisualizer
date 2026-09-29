import { isoDay, mondayOf, parseDate } from "./dates";
import { estimate1RM, exerciseKind, groupBy, setVolume, workingSets } from "./sets";
import type { ExerciseKind } from "./sets";
import type { Workout, WorkoutSet } from "./types";

/** Best values of one exercise within a single workout (warm-ups excluded). */
export interface ExerciseSession {
    date: string;
    e1rm: number;
    maxWeight: number;
    volume: number;
    bestSetVolume: number;
    maxReps: number;
    /** Summed distance in km (cardio). */
    distance: number;
    /** Summed time in seconds (cardio). */
    seconds: number;
    /** The working sets of that workout, in logged order. */
    sets: WorkoutSet[];
}

/** Numeric fields of a session that can be charted or turned into a record. */
export type SessionMetric = Exclude<keyof ExerciseSession, "date" | "sets">;

export type RecordKey =
    | "maxWeight"
    | "best1RM"
    | "bestSetVolume"
    | "maxWorkoutVolume"
    | "maxReps"
    | "maxDistance"
    | "longestTime";

/** One personal record and the day it was set. */
export interface RecordEntry {
    key: RecordKey;
    /** Session metric the value comes from (determines how it is formatted). */
    metric: SessionMetric;
    value: number;
    date: string;
}

/** Best weight lifted for at least the given number of reps. */
export interface RepMaxEntry {
    reps: number;
    weight: number;
    date: string;
}

export interface ExerciseRecords {
    kind: ExerciseKind;
    /** Per-workout progression, oldest first. */
    sessions: ExerciseSession[];
    records: RecordEntry[];
    repMax: RepMaxEntry[];
}

export interface ExerciseSummary {
    name: string;
    kind: ExerciseKind;
    workouts: number;
    lastDate: string;
}

export interface WeekCount {
    /** Monday of the week, "YYYY-MM-DD". */
    weekStart: string;
    count: number;
}

export interface OverviewStats {
    workouts: number;
    workingSets: number;
    totalVolume: number;
    totalSeconds: number;
    /** Workouts per week from the first workout up to the current week. */
    weeks: WeekCount[];
    /** Consecutive weeks with a workout up to now (an empty current week does not break it). */
    currentStreak: number;
    longestStreak: number;
}

/** Which session metric feeds which record, per exercise kind. */
const RECORD_FIELDS: Record<ExerciseKind, [RecordKey, SessionMetric][]> = {
    strength: [
        ["maxWeight", "maxWeight"],
        ["best1RM", "e1rm"],
        ["bestSetVolume", "bestSetVolume"],
        ["maxWorkoutVolume", "volume"],
        ["maxReps", "maxReps"],
    ],
    reps: [["maxReps", "maxReps"]],
    cardio: [
        ["maxDistance", "distance"],
        ["longestTime", "seconds"],
    ],
};

const MAX_REP_MAX = 10;

/**
 * Sums numbers.
 * @param values numbers to add
 * @returns the total
 */
function sum(values: number[]): number {
    return values.reduce((total, value) => total + value, 0);
}

/**
 * Groups sets into workouts (by start time) and exercises (by first appearance), oldest workout first.
 * @param sets all sets
 * @returns workouts in chronological order
 */
export function groupWorkouts(sets: WorkoutSet[]): Workout[] {
    return [...groupBy(sets, (set) => set.date)]
        .sort(([firstDate], [secondDate]) => firstDate.localeCompare(secondDate))
        .map(([date, workoutSets]) => ({
            date,
            name: workoutSets[0].workout,
            duration: workoutSets[0].duration,
            notes: workoutSets.find((set) => set.workoutNotes !== "")?.workoutNotes ?? "",
            exercises: [...groupBy(workoutSets, (set) => set.exercise)].map(([name, exerciseSets]) => ({
                name,
                sets: exerciseSets,
            })),
        }));
}

/**
 * Sums the volume of all working sets of a workout.
 * @param workout a grouped workout
 * @returns total volume in the library's weight unit
 */
export function workoutVolume(workout: Workout): number {
    return sum(workout.exercises.flatMap((exercise) => exercise.sets).map(setVolume));
}

/**
 * Selects all sets of one exercise.
 * @param sets all sets
 * @param exercise exercise name
 * @returns sets of that exercise, oldest workout first
 */
function setsOf(sets: WorkoutSet[], exercise: string): WorkoutSet[] {
    return sets
        .filter((set) => set.exercise === exercise)
        .sort((first, second) => first.date.localeCompare(second.date));
}

/**
 * Condenses the working sets of one workout into best values.
 * @param date workout start
 * @param sessionSets non-empty working sets of one exercise in that workout
 * @returns the session
 */
function toSession(date: string, sessionSets: WorkoutSet[]): ExerciseSession {
    const volumes = sessionSets.map(setVolume);
    return {
        date,
        e1rm: Math.max(...sessionSets.map((set) => estimate1RM(set.weight, set.reps))),
        maxWeight: Math.max(...sessionSets.map((set) => set.weight)),
        volume: sum(volumes),
        bestSetVolume: Math.max(...volumes),
        maxReps: Math.max(...sessionSets.map((set) => set.reps)),
        distance: sum(sessionSets.map((set) => set.distance)),
        seconds: sum(sessionSets.map((set) => set.seconds)),
        sets: sessionSets,
    };
}

/**
 * Builds the per-workout progression from one exercise's own sets, oldest first (basis for the charts).
 * @param ownSets sets of one exercise, oldest first
 * @returns one session per workout that contains working sets of the exercise
 */
function sessionsOf(ownSets: WorkoutSet[]): ExerciseSession[] {
    return [...groupBy(workingSets(ownSets), (set) => set.date)].map(([date, sessionSets]) =>
        toSession(date, sessionSets),
    );
}

/**
 * Builds the per-workout progression of one exercise, oldest first.
 * @param sets all sets
 * @param exercise exercise name
 * @returns one session per workout that contains working sets of the exercise
 */
export function exerciseHistory(sets: WorkoutSet[], exercise: string): ExerciseSession[] {
    return sessionsOf(setsOf(sets, exercise));
}

/**
 * Finds the earliest session reaching the highest positive value of a metric.
 * @param sessions sessions oldest first
 * @param metric metric to compare
 * @returns the record session, undefined when the metric is never above 0
 */
function bestSession(sessions: ExerciseSession[], metric: SessionMetric): ExerciseSession | undefined {
    return sessions.reduce<ExerciseSession | undefined>(
        (best, session) => (session[metric] > (best ? best[metric] : 0) ? session : best),
        undefined,
    );
}

/**
 * Builds the rep-max table: the heaviest weight lifted for at least 1..10 reps.
 * @param strengthSets working sets of a weighted exercise, oldest first
 * @returns entries for rep counts that were ever reached
 */
function repMaxTable(strengthSets: WorkoutSet[]): RepMaxEntry[] {
    const entries: RepMaxEntry[] = [];
    for (let reps = 1; reps <= MAX_REP_MAX; reps++) {
        const best = strengthSets.reduce<WorkoutSet | undefined>(
            (heaviest, set) => (set.reps >= reps && set.weight > (heaviest ? heaviest.weight : 0) ? set : heaviest),
            undefined,
        );
        if (best) {
            entries.push({ reps, weight: best.weight, date: best.date });
        }
    }
    return entries;
}

/**
 * Computes all personal records of one exercise.
 * @param sets all sets
 * @param exercise exercise name
 * @returns kind, sessions, records and (for weighted lifts) the rep-max table
 */
export function exerciseRecords(sets: WorkoutSet[], exercise: string): ExerciseRecords {
    const ownSets = setsOf(sets, exercise);
    const kind = exerciseKind(exercise, ownSets);
    const sessions = sessionsOf(ownSets);
    const records = RECORD_FIELDS[kind].flatMap(([key, metric]) => {
        const session = bestSession(sessions, metric);
        return session ? [{ key, metric, value: session[metric], date: session.date }] : [];
    });
    return { kind, sessions, records, repMax: kind === "strength" ? repMaxTable(workingSets(ownSets)) : [] };
}

/**
 * Lists all exercises with kind, workout count and last performed date, most frequent first.
 * @param sets all sets
 * @returns one summary per exercise
 */
export function exerciseSummaries(sets: WorkoutSet[]): ExerciseSummary[] {
    return [...groupBy(sets, (set) => set.exercise)]
        .map(([name, exerciseSets]) => {
            const dates = exerciseSets.map((set) => set.date);
            return {
                name,
                kind: exerciseKind(name, exerciseSets),
                workouts: new Set(dates).size,
                lastDate: dates.reduce((latest, date) => (date > latest ? date : latest)),
            };
        })
        .sort((first, second) => second.workouts - first.workouts || first.name.localeCompare(second.name));
}

/**
 * Counts workouts per week, filling weeks without training with 0.
 * @param workoutDates workout start times, oldest first
 * @param now reference time; the series ends with its week
 * @returns weekly counts, empty without workouts
 */
function weeklyCounts(workoutDates: string[], now: Date): WeekCount[] {
    if (workoutDates.length === 0) {
        return [];
    }
    const counts = new Map<string, number>();
    for (const date of workoutDates) {
        const week = isoDay(mondayOf(parseDate(date)));
        counts.set(week, (counts.get(week) ?? 0) + 1);
    }
    const weeks: WeekCount[] = [];
    const lastWeek = mondayOf(now);
    const cursor = mondayOf(parseDate(workoutDates[0]));
    for (; cursor <= lastWeek; cursor.setDate(cursor.getDate() + 7)) {
        const weekStart = isoDay(cursor);
        weeks.push({ weekStart, count: counts.get(weekStart) ?? 0 });
    }
    return weeks;
}

/**
 * Computes, for every week, how many consecutive training weeks end there.
 * @param weeks weekly counts
 * @returns run length per week (0 for weeks without workouts)
 */
function runLengths(weeks: WeekCount[]): number[] {
    const runs: number[] = [];
    weeks.forEach((week, index) => runs.push(week.count > 0 ? (runs[index - 1] ?? 0) + 1 : 0));
    return runs;
}

/**
 * Computes the headline numbers of the overview tab.
 * @param sets all sets
 * @param now reference time (for the weekly series and the streak)
 * @returns totals, weekly workout counts and streaks
 */
export function overviewStats(sets: WorkoutSet[], now: Date): OverviewStats {
    const workouts = groupWorkouts(sets);
    const weeks = weeklyCounts(
        workouts.map((workout) => workout.date),
        now,
    );
    const currentWeekIsEmpty = weeks.at(-1)?.count === 0;
    const runs = runLengths(weeks);
    return {
        workouts: workouts.length,
        workingSets: workingSets(sets).length,
        totalVolume: sum(sets.map(setVolume)),
        totalSeconds: sum(workouts.map((workout) => workout.duration)),
        weeks,
        currentStreak: (currentWeekIsEmpty ? runs.at(-2) : runs.at(-1)) ?? 0,
        longestStreak: Math.max(0, ...runs),
    };
}
