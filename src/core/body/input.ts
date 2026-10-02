/**
 * Parses a typed decimal number; comma and point both count as decimal separator.
 * @param text field content
 * @returns the number, null for an empty field, NaN for anything else
 */
export function parseDecimal(text: string): number | null {
    const trimmed = text.trim();
    if (trimmed === "") {
        return null;
    }
    return /^\d+([.,]\d*)?$/.test(trimmed) ? Number(trimmed.replace(",", ".")) : NaN;
}

/**
 * Shows a number in an input field: rounded, German decimal comma, no thousands separator.
 * @param value the number, null for an empty field
 * @param digits maximum fraction digits
 * @returns field content
 */
export function formatDecimal(value: number | null, digits: number): string {
    if (value === null) {
        return "";
    }
    const factor = 10 ** digits;
    return String(Math.round(value * factor) / factor).replace(".", ",");
}

/**
 * Parses a clock-style duration such as "25:30" or "1:45:00".
 * @param text field content
 * @returns seconds, null for an empty field, NaN for anything else
 */
export function parseClock(text: string): number | null {
    const trimmed = text.trim();
    if (trimmed === "") {
        return null;
    }
    if (!/^\d+(:[0-5]\d){1,2}$/.test(trimmed)) {
        return NaN;
    }
    return trimmed.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

/**
 * Formats seconds as a clock-style duration.
 * @param totalSeconds duration
 * @returns "m:ss" below an hour, otherwise "h:mm:ss"
 */
export function formatClock(totalSeconds: number): string {
    const rounded = Math.round(totalSeconds);
    const hours = Math.floor(rounded / 3600);
    const minutes = Math.floor((rounded % 3600) / 60);
    const seconds = String(rounded % 60).padStart(2, "0");
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}` : `${minutes}:${seconds}`;
}
