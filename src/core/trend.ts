/** Fitted straight line y = slope · x + intercept. */
export interface TrendLine {
    slope: number;
    intercept: number;
}

/**
 * Fitting method:
 * - "theil-sen": median of all pairwise slopes; robust against outliers (breakdown point ≈ 29 %),
 *   the right choice for lift progress with the occasional light or failed session.
 * - "least-squares": classic regression; the right choice for count data with many zeros,
 *   where the median slope of Theil-Sen collapses to 0.
 */
export type TrendMethod = "theil-sen" | "least-squares";

/** How to read x and y out of a chart point. */
export interface TrendAxes<Point> {
    x: (point: Point, index: number) => number;
    y: (point: Point) => number;
}

/** Points extended with the fitted value, plus the fitted slope (change of y per unit of x). */
export interface TrendResult<Point> {
    points: (Point & { trend: number })[];
    slope: number;
}

interface Coordinate {
    x: number;
    y: number;
}

/**
 * Computes the median of numbers.
 * @param values non-empty list
 * @returns the middle value (mean of the two middle values for even counts)
 */
function median(values: number[]): number {
    const sorted = [...values].sort((first, second) => first - second);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

/**
 * Computes the arithmetic mean.
 * @param values non-empty list
 * @returns the mean
 */
function mean(values: number[]): number {
    return values.reduce((total, value) => total + value, 0) / values.length;
}

/**
 * Fits a line with the Theil-Sen estimator.
 * @param coordinates at least two points
 * @returns the line, or null when all points share the same x
 */
function fitTheilSen(coordinates: Coordinate[]): TrendLine | null {
    const slopes: number[] = [];
    for (let first = 0; first < coordinates.length; first++) {
        for (let second = first + 1; second < coordinates.length; second++) {
            const distance = coordinates[second].x - coordinates[first].x;
            if (distance !== 0) {
                slopes.push((coordinates[second].y - coordinates[first].y) / distance);
            }
        }
    }
    if (slopes.length === 0) {
        return null;
    }
    const slope = median(slopes);
    return { slope, intercept: median(coordinates.map(({ x, y }) => y - slope * x)) };
}

/**
 * Fits a line by ordinary least squares.
 * @param coordinates at least two points
 * @returns the line, or null when all points share the same x
 */
function fitLeastSquares(coordinates: Coordinate[]): TrendLine | null {
    const meanX = mean(coordinates.map(({ x }) => x));
    const meanY = mean(coordinates.map(({ y }) => y));
    let spreadX = 0;
    let covariance = 0;
    for (const { x, y } of coordinates) {
        spreadX += (x - meanX) ** 2;
        covariance += (x - meanX) * (y - meanY);
    }
    if (spreadX === 0) {
        return null;
    }
    const slope = covariance / spreadX;
    return { slope, intercept: meanY - slope * meanX };
}

const FITTERS: Record<TrendMethod, (coordinates: Coordinate[]) => TrendLine | null> = {
    "theil-sen": fitTheilSen,
    "least-squares": fitLeastSquares,
};

/**
 * Adds the fitted trend value to every chart point.
 * @param points chart points
 * @param axes how to read x and y from a point (x in the unit the slope should be expressed in)
 * @param method fitting method
 * @returns points with a `trend` field and the slope, or null when no line can be fitted
 *          (fewer than two points or all at the same x)
 */
export function addTrend<Point>(
    points: Point[],
    axes: TrendAxes<Point>,
    method: TrendMethod,
): TrendResult<Point> | null {
    if (points.length < 2) {
        return null;
    }
    const xs = points.map(axes.x);
    const line = FITTERS[method](points.map((point, index) => ({ x: xs[index], y: axes.y(point) })));
    if (line === null) {
        return null;
    }
    return {
        slope: line.slope,
        points: points.map((point, index) => ({ ...point, trend: line.slope * xs[index] + line.intercept })),
    };
}
