import { copyFile, mkdir, rm } from "node:fs/promises";

const output = new URL("./site/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL("dist/", output), { recursive: true });
for (const file of ["index.html", "style.css", "dist/main.js"]) {
  await copyFile(new URL(file, import.meta.url), new URL(file, output));
}
console.log("Publiseringsklare filer er bygget til site/.");
