export const MS_PER_DAY = 86_400_000;

/**
 * Computes the timestamp a number of days before a reference time.
 * @param now reference time
 * @param days size of the time window in days
 * @returns epoch milliseconds of the window start
 */
export function daysBefore(now: Date, days: number): number {
    return now.getTime() - days * MS_PER_DAY;
}

/**
 * Parses a Strong timestamp ("YYYY-MM-DD HH:mm:ss") as local time.
 * @param text timestamp from the CSV
 * @returns the date
 */
export function parseDate(text: string): Date {
    return new Date(text.replace(" ", "T"));
}

/**
 * Finds the Monday (00:00 local) of the week containing a date.
 * @param date any date
 * @returns a new Date at the start of that week
 */
export function mondayOf(date: Date): Date {
    const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return monday;
}

/**
 * Formats a date as local "YYYY-MM-DD".
 * @param date the date
 * @returns ISO day string
 */
export function isoDay(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}
