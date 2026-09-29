import { useEffect, useRef } from "react";
import type { CalendarWeek } from "../core/calendar";
import { formatDate } from "../core/format";
import styles from "./CalendarHeatmap.module.scss";

interface CalendarHeatmapProps {
    weeks: CalendarWeek[];
}

/**
 * Picks the style of a day cell by its workout count.
 * @param workouts workouts started that day
 * @returns CSS class name, empty days keep the base style
 */
function levelClass(workouts: number): string {
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
                    week.days.map(({ day, workouts }) => (
                        <span
                            key={day}
                            className={levelClass(workouts)}
                            title={`${formatDate(`${day} 00:00:00`, "medium")}: ${workouts} Workout${workouts === 1 ? "" : "s"}`}
                        />
                    )),
                )}
            </div>
        </div>
    );
}
