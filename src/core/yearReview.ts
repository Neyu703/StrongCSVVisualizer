import { busiestWeekday } from "./calendar";
import { parseDate } from "./dates";
import { groupBy, setVolume } from "./sets";
import { exerciseRecords, exerciseSummaries, groupWorkouts, overviewStats, recordSessions } from "./stats";
import type { ExerciseSummary, OverviewStats } from "./stats";
import type { WorkoutSet } from "./types";

const TOP_EXERCISES = 5;
const DECEMBER = 11;

/** The month of a year with the highest lifted volume. */
export interface StrongestMonth {
    /** 0 (January) to 11 (December). */
    month: number;
    volume: number;
}

/** Highlights of one calendar year of training. */
export interface YearReview extends Pick<OverviewStats, "workouts" | "workingSets" | "totalVolume" | "totalSeconds" | "longestStreak"> {
    year: number;
    /** The most frequent exercises by number of workouts, at most five. */
    topExercises: ExerciseSummary[];
    /** Weighted lifts whose 1RM beat all earlier sessions during the year. */
    newRecords: number;
    /** Null when no weight was lifted that year. */
    strongestMonth: StrongestMonth | null;
    /** 0 (Monday) to 6 (Sunday). */
    busiestWeekday: number | null;
}

/**
 * Selects the sets of one calendar year.
 * @param sets all sets
 * @param year the year
 * @returns sets whose workout started in that year
 */
function setsOfYear(sets: WorkoutSet[], year: number): WorkoutSet[] {
    return sets.filter((set) => set.date.startsWith(`${year}-`));
}

/**
 * Lists the years in which workouts were logged.
 * @param sets all sets
 * @returns years, newest first
 */
export function reviewYears(sets: WorkoutSet[]): number[] {
    return [...new Set(sets.map((set) => Number(set.date.slice(0, 4))))].sort((first, second) => second - first);
}

/**
 * Counts the weighted lifts whose 1RM beat all earlier sessions in a year.
 * @param sets all sets (records depend on the whole history)
 * @param year the year
 * @returns number of new 1RM records
 */
function countNewRecords(sets: WorkoutSet[], year: number): number {
    return exerciseSummaries(sets).filter(({ kind }) => kind === "strength").reduce((total, { name }) => {
        const records = recordSessions(exerciseRecords(sets, name).sessions, "e1rm");
        return total + records.filter((session) => session.date.startsWith(`${year}-`)).length;
    }, 0);
}

/**
 * Finds the month with the highest lifted volume.
 * @param yearSets sets of one year
 * @returns the month, null when no weight was lifted
 */
function findStrongestMonth(yearSets: WorkoutSet[]): StrongestMonth | null {
    const volumes = [...groupBy(yearSets, (set) => String(parseDate(set.date).getMonth()))].map(([month, monthSets]) => ({
        month: Number(month),
        volume: monthSets.reduce((total, set) => total + setVolume(set), 0),
    }));
    return volumes.reduce<StrongestMonth | null>((best, entry) => (entry.volume > (best?.volume ?? 0) ? entry : best), null);
}

/**
 * Summarizes one calendar year of training.
 * @param sets all sets
 * @param year the year to review
 * @returns totals, top exercises, new records, strongest month and favourite weekday
 */
export function yearReview(sets: WorkoutSet[], year: number): YearReview {
    const yearSets = setsOfYear(sets, year);
    const { workouts, workingSets, totalVolume, totalSeconds, longestStreak } = overviewStats(yearSets, new Date(year, DECEMBER, 31));
    return {
        year,
        workouts,
        workingSets,
        totalVolume,
        totalSeconds,
        longestStreak,
        topExercises: exerciseSummaries(yearSets).slice(0, TOP_EXERCISES),
        newRecords: countNewRecords(sets, year),
        strongestMonth: findStrongestMonth(yearSets),
        busiestWeekday: busiestWeekday(groupWorkouts(yearSets)),
    };
}
