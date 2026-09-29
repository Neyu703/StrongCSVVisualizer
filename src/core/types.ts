/** Weight unit of the imported library. */
export type WeightUnit = "kg" | "lb";

/** One logged set, normalized from a Strong CSV row. */
export interface WorkoutSet {
    /** Workout start, "YYYY-MM-DD HH:mm:ss" (unique per workout, sortable as text). */
    date: string;
    workout: string;
    /** Workout duration in seconds. */
    duration: number;
    exercise: string;
    /** Raw Strong set marker: "1".."n", "W" (warm-up), "F" (failure), "D" (drop). */
    setOrder: string;
    weight: number;
    reps: number;
    /** Distance in kilometers. */
    distance: number;
    seconds: number;
    rpe: number | null;
    notes: string;
    workoutNotes: string;
}

/** Everything persisted in localStorage. */
export interface Library {
    unit: WeightUnit;
    sets: WorkoutSet[];
}

/** One exercise inside a workout, sets in logged order. */
export interface ExerciseBlock {
    name: string;
    sets: WorkoutSet[];
}

/** All sets sharing one start time. */
export interface Workout {
    date: string;
    name: string;
    duration: number;
    notes: string;
    exercises: ExerciseBlock[];
}
