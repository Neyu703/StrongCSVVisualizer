import { copyFileSync } from "node:fs";

// The single-file build lands in dist/; expose it next to the sources for double-click use
copyFileSync("dist/index.html", "StrongPro.html");
