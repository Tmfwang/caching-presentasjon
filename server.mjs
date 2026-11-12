import { createServer } from "node:http";
import { readFile } from "node:fs/promises";

const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/style.css", ["style.css", "text/css; charset=utf-8"]],
  ["/dist/main.js", ["dist/main.js", "text/javascript; charset=utf-8"]],
]);
const port = Number(process.env.PORT ?? 4173);
createServer(async (request, response) => {
  const path = new URL(request.url ?? "/", "http://localhost").pathname;
  if (path === "/favicon.ico") {
    response.writeHead(204).end();
    return;
  }
  const file = files.get(path);
  if (!file) {
    response.writeHead(404).end("Ikke funnet");
    return;
  }
  try {
    const body = await readFile(new URL(file[0], import.meta.url));
    response
      .writeHead(200, { "Content-Type": file[1], "Cache-Control": "no-store" })
      .end(body);
  } catch {
    response
      .writeHead(500)
      .end("Filen kunne ikke leses. Kjør pnpm run build først.");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Presentasjonen er klar på http://localhost:${port}`);
});
