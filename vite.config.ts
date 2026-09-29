import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
    // Relative base + single inlined file: works via file:// without a server
    base: "./",
    plugins: [react(), viteSingleFile()],
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
        coverage: {
            provider: "v8",
            include: ["src/core/**/*.ts"],
            exclude: ["src/core/**/*.test.ts", "src/core/types.ts", "src/core/testing.ts"],
            thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
        },
    },
});
