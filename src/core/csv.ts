/** One CSV record keyed by its header names. */
export type CsvRow = Record<string, string>;

/**
 * Picks the delimiter of a CSV file from its header line.
 * @param headerLine first line of the file
 * @returns ";" for newer Strong exports, "," otherwise
 */
export function detectDelimiter(headerLine: string): "," | ";" {
    const semicolons = headerLine.split(";").length;
    const commas = headerLine.split(",").length;
    return semicolons > commas ? ";" : ",";
}

/**
 * Splits CSV text into records of fields (RFC 4180: quotes, escaped quotes, newlines in fields).
 * @param text CSV text without BOM
 * @param delimiter field delimiter
 * @returns raw records including the header record
 */
function splitRecords(text: string, delimiter: string): string[][] {
    const records: string[][] = [];
    let record: string[] = [];
    let field = "";
    let insideQuotes = false;

    for (let position = 0; position < text.length; position++) {
        const char = text[position];
        if (insideQuotes) {
            if (char !== '"') {
                field += char;
            } else if (text[position + 1] === '"') {
                field += '"';
                position++;
            } else {
                insideQuotes = false;
            }
        } else if (char === '"') {
            insideQuotes = true;
        } else if (char === delimiter) {
            record.push(field);
            field = "";
        } else if (char === "\n" || char === "\r") {
            if (char === "\r" && text[position + 1] === "\n") {
                position++;
            }
            record.push(field);
            records.push(record);
            record = [];
            field = "";
        } else {
            field += char;
        }
    }

    if (field !== "" || record.length > 0) {
        record.push(field);
        records.push(record);
    }
    return records;
}

/**
 * Parses CSV text into rows keyed by header name; blank lines are skipped.
 * @param text full CSV file content
 * @returns one object per data record, empty for an empty file
 */
export function parseCsv(text: string): CsvRow[] {
    const cleanText = text.replace(/^﻿/, "");
    const firstLine = cleanText.split(/\r?\n/, 1)[0];
    const [header, ...records] = splitRecords(cleanText, detectDelimiter(firstLine));
    if (header === undefined) {
        return [];
    }
    return records
        .filter((record) => record.some((field) => field !== ""))
        .map((record) =>
            Object.fromEntries(header.map((name, column) => [name.trim(), record[column] ?? ""])),
        );
}
