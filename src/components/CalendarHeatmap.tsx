import { useEffect, useRef } from "react";
import type { CalendarDay, CalendarWeek } from "../core/calendar";
import { formatDate } from "../core/format";
import styles from "./CalendarHeatmap.module.scss";

interface CalendarHeatmapProps {
    weeks: CalendarWeek[];
}

/**
 * Picks the style of a day cell.
 * @param day the calendar day
 * @returns CSS class names; days without workouts keep the base style, future days are left blank
 */
function levelClass({ workouts, future }: CalendarDay): string {
    if (future) {
        return `${styles.day} ${styles.future}`;
    }
    if (workouts === 0) {
        return styles.day;
    }
    return `${styles.day} ${workouts === 1 ? styles.once : styles.multiple}`;
}

/** GitHub-style grid of training days: one column per week, Monday at the top. */
export function CalendarHeatmap({ weeks }: CalendarHeatmapProps) {
    const scroller = useRef<HTMLDivElement>(null);

    // Start at the right edge so the current week is visible
    useEffect(() => {
        scroller.current?.scrollTo({ left: scroller.current.scrollWidth });
    }, [weeks]);

    return (
        <div ref={scroller} className={styles.scroller}>
            <div className={styles.grid} role="img" aria-label="Trainingstage der letzten Wochen">
                {weeks.flatMap((week) =>
                    week.days.map((calendarDay) => (
                        <span
                            key={calendarDay.day}
                            className={levelClass(calendarDay)}
                            title={`${formatDate(`${calendarDay.day} 00:00:00`, "medium")}: ${calendarDay.workouts} Workout${calendarDay.workouts === 1 ? "" : "s"}`}
                        />
                    )),
                )}
            </div>
        </div>
    );
}
