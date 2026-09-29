/** Heat scale from light load to heavy load: yellow → orange → red (Apple system colors). */
const HEAT_STOPS = [0xffd60a, 0xff9500, 0xff3b30];

/**
 * Splits a 0xRRGGBB color into its channels.
 * @param color packed color
 * @returns red, green, blue (0–255)
 */
function channels(color: number): [number, number, number] {
    return [(color >> 16) & 0xff, (color >> 8) & 0xff, color & 0xff];
}

/**
 * Maps a relative training intensity to a heat color.
 * @param intensity 0 (lightest load) to 1 (highest load); values outside are clamped
 * @returns packed 0xRRGGBB color
 */
export function heatColor(intensity: number): number {
    const position = Math.min(1, Math.max(0, intensity)) * (HEAT_STOPS.length - 1);
    const lower = Math.min(Math.floor(position), HEAT_STOPS.length - 2);
    const fraction = position - lower;
    const [fromRed, fromGreen, fromBlue] = channels(HEAT_STOPS[lower]);
    const [toRed, toGreen, toBlue] = channels(HEAT_STOPS[lower + 1]);
    const mix = (from: number, to: number) => Math.round(from + (to - from) * fraction);
    return (mix(fromRed, toRed) << 16) | (mix(fromGreen, toGreen) << 8) | mix(fromBlue, toBlue);
}

/**
 * Formats a packed color for CSS.
 * @param color packed 0xRRGGBB color
 * @returns e.g. "#ff9500"
 */
export function toCssColor(color: number): string {
    return `#${color.toString(16).padStart(6, "0")}`;
}
