import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";

const output = new URL("./site/", import.meta.url);
await rm(output, { recursive: true, force: true });
await mkdir(new URL("dist/", output), { recursive: true });
let html = await readFile(new URL("index.html", import.meta.url), "utf8");
for (const file of ["style.css", "dist/main.js"]) {
  const content = await readFile(new URL(file, import.meta.url));
  const hash = createHash("sha256").update(content).digest("hex").slice(0, 12);
  const versioned = file.replace(/(\.[^.]+)$/, `.${hash}$1`);
  await writeFile(new URL(versioned, output), content);
  html = html.replace(`"./${file}"`, `"./${versioned}"`);
  // Behold tidligere filadresser for nettlesere som fortsatt har eldre HTML i cachen.
  await copyFile(new URL(file, import.meta.url), new URL(file, output));
}
await writeFile(new URL("index.html", output), html);
console.log("Publiseringsklare filer er bygget til site/.");
