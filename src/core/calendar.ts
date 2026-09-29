import { isoDay, mondayOf, parseDate, weekStarts } from "./dates";
import type { Workout } from "./types";

const DAYS_PER_WEEK = 7;

/** One calendar day and how many workouts started on it. */
export interface CalendarDay {
    /** "YYYY-MM-DD". */
    day: string;
    workouts: number;
}

/** One calendar week, Monday to Sunday. */
export interface CalendarWeek {
    /** Monday of the week, "YYYY-MM-DD". */
    weekStart: string;
    days: CalendarDay[];
}

/**
 * Lists the seven days of a week.
 * @param weekStart Monday of the week, "YYYY-MM-DD"
 * @returns ISO days, Monday first
 */
function daysOfWeek(weekStart: string): string[] {
    const cursor = parseDate(`${weekStart} 00:00:00`);
    return Array.from({ length: DAYS_PER_WEEK }, () => {
        const day = isoDay(cursor);
        cursor.setDate(cursor.getDate() + 1);
        return day;
    });
}

/**
 * Builds the training calendar: workouts per day for the last weeks, ending with the current week.
 * @param workouts grouped workouts
 * @param now reference time; the last week is its week
 * @param weeks number of weeks to show
 * @returns weeks oldest first
 */
export function trainingCalendar(workouts: Workout[], now: Date, weeks = 53): CalendarWeek[] {
    const counts = new Map<string, number>();
    for (const workout of workouts) {
        const day = isoDay(parseDate(workout.date));
        counts.set(day, (counts.get(day) ?? 0) + 1);
    }
    const firstWeek = mondayOf(now);
    firstWeek.setDate(firstWeek.getDate() - (weeks - 1) * DAYS_PER_WEEK);
    return weekStarts(firstWeek, now).map((weekStart) => ({
        weekStart,
        days: daysOfWeek(weekStart).map((day) => ({ day, workouts: counts.get(day) ?? 0 })),
    }));
}

/**
 * Finds the most frequent value; on a tie the smallest one wins.
 * @param values numbers to count
 * @returns the mode, null for an empty list
 */
function mostFrequent(values: number[]): number | null {
    const counts = new Map<number, number>();
    for (const value of values) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    const ranked = [...counts].sort(([firstValue, firstCount], [secondValue, secondCount]) => secondCount - firstCount || firstValue - secondValue);
    return ranked[0]?.[0] ?? null;
}

/**
 * Finds the weekday on which most workouts were started.
 * @param workouts grouped workouts
 * @returns 0 (Monday) to 6 (Sunday), null without workouts
 */
export function busiestWeekday(workouts: Workout[]): number | null {
    return mostFrequent(workouts.map((workout) => (parseDate(workout.date).getDay() + 6) % DAYS_PER_WEEK));
}

/**
 * Finds the hour of day in which most workouts were started.
 * @param workouts grouped workouts
 * @returns 0 to 23, null without workouts
 */
export function busiestHour(workouts: Workout[]): number | null {
    return mostFrequent(workouts.map((workout) => parseDate(workout.date).getHours()));
}
