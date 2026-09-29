import { describe, expect, it } from "vitest";
import { detectDelimiter, parseCsv } from "./csv";

describe("detectDelimiter", () => {
    it("detects comma and semicolon headers", () => {
        expect(detectDelimiter("Date,Workout Name,Duration")).toBe(",");
        expect(detectDelimiter("Workout #;Date;Workout Name")).toBe(";");
    });
});

describe("parseCsv", () => {
    it("parses a comma file keyed by header", () => {
        expect(parseCsv("a,b\n1,2\n3,4")).toEqual([
            { a: "1", b: "2" },
            { a: "3", b: "4" },
        ]);
    });

    it("parses a semicolon file and strips a BOM", () => {
        expect(parseCsv("﻿a;b\n1;2")).toEqual([{ a: "1", b: "2" }]);
    });

    it("handles quotes, escaped quotes, embedded delimiters and newlines", () => {
        const rows = parseCsv('a,b\n"x, ""y""","line1\nline2"\n');
        expect(rows).toEqual([{ a: 'x, "y"', b: "line1\nline2" }]);
    });

    it("handles CRLF and CR line endings and skips blank lines", () => {
        expect(parseCsv("a,b\r\n1,2\r\n\r\n3,4\r5,6")).toEqual([
            { a: "1", b: "2" },
            { a: "3", b: "4" },
            { a: "5", b: "6" },
        ]);
    });

    it("fills missing trailing fields with empty strings", () => {
        expect(parseCsv("a,b,c\n1,2")).toEqual([{ a: "1", b: "2", c: "" }]);
    });

    it("keeps a final record without trailing newline and one ending in a delimiter", () => {
        expect(parseCsv("a,b\n1,")).toEqual([{ a: "1", b: "" }]);
    });

    it("returns no rows for an empty file", () => {
        expect(parseCsv("")).toEqual([]);
    });
});
