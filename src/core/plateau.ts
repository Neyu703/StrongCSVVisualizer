import { MS_PER_DAY, daysBefore, parseDate } from "./dates";
import { exerciseRecords, exerciseSummaries } from "./stats";
import { addTrend } from "./trend";
import type { WorkoutSet } from "./types";

/** Only sessions of the last eight weeks decide whether a lift stagnates. */
const WINDOW_DAYS = 56;
/** Fewer sessions in the window are too little evidence for a trend. */
const MIN_SESSIONS = 4;

/** A weighted exercise whose estimated 1RM no longer rises. */
export interface Plateau {
    exercise: string;
    /** Fitted 1RM change per day over the window, zero or negative. */
    slopePerDay: number;
    /** Whole days since the session that set the best 1RM. */
    daysSinceBest: number;
}

/**
 * Finds weighted exercises whose 1RM trend over the last eight weeks is flat or falling.
 * @param sets all sets
 * @param now reference time
 * @returns plateaus with the steepest decline first
 */
export function findPlateaus(sets: WorkoutSet[], now: Date): Plateau[] {
    const cutoff = daysBefore(now, WINDOW_DAYS);
    return exerciseSummaries(sets)
        .flatMap(({ name }) => {
            const { kind, sessions, records } = exerciseRecords(sets, name);
            const recent = sessions
                .map((session) => ({ time: parseDate(session.date).getTime(), value: session.e1rm }))
                .filter((point) => point.time >= cutoff);
            if (kind !== "strength" || recent.length < MIN_SESSIONS) {
                return [];
            }
            const trend = addTrend(recent, { x: (point) => point.time / MS_PER_DAY, y: (point) => point.value }, "theil-sen");
            const best = records.find((record) => record.key === "best1RM");
            if (trend === null || best === undefined || trend.slope > 0) {
                return [];
            }
            return [
                {
                    exercise: name,
                    slopePerDay: trend.slope,
                    daysSinceBest: Math.floor((now.getTime() - parseDate(best.date).getTime()) / MS_PER_DAY),
                },
            ];
        })
        .sort((first, second) => first.slopePerDay - second.slopePerDay);
}
