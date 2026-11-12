type Slide = {
  title: string;
  accent: string;
  chapter: string;
  duration: number;
  labels: string[];
  note: string;
  draw: (step: number) => string;
};

const flowSlowDown = 2.2;
const icons: Record<string, string> = {
  user: '<circle cx="0" cy="-12" r="10"/><path d="M-20 22v-5a20 20 0 0 1 40 0v5"/>',
  service:
    '<rect x="-22" y="-24" width="44" height="48" rx="7"/><path d="M-12-12h24M-12 0h24M-12 12h12"/>',
  source:
    '<ellipse cx="0" cy="-19" rx="25" ry="9"/><path d="M-25-19v38c0 12 50 12 50 0v-38M-25 0c0 12 50 12 50 0"/>',
  cache: '<path d="m0-27 28 15v29L0 33-28 17v-29Z M-28-12 0 4l28-16M0 4v29"/>',
  lock: '<rect x="-21" y="-4" width="42" height="33" rx="6"/><path d="M-12-4v-13a12 12 0 0 1 24 0v13M0 9v8"/>',
  shield:
    '<path d="m0-30 27 11v20c0 18-27 30-27 30S-27 19-27 1v-20Z M-12 0l9 10L15-10"/>',
};

function text(x: number, y: number, value: string, cls = "label"): string {
  return `<text x="${x}" y="${y}" class="${cls}">${value}</text>`;
}
function icon(
  x: number,
  y: number,
  name: string,
  color = "#63d9f3",
  scale = 1,
): string {
  if (!name) return "";
  return `<g transform="translate(${x} ${y}) scale(${scale})" style="color:${color}" class="glyph">${icons[name]}</g>`;
}
function node(
  x: number,
  y: number,
  name: string,
  label: string,
  tone = "cyan",
  detail = "",
): string {
  const colors: Record<string, string> = {
    cyan: "#63d9f3",
    green: "#90edb5",
    purple: "#b49aff",
    red: "#ff8c91",
    "": "#9aa9c2",
  };
  return `<g><rect x="${x - 80}" y="${y - 70}" width="160" height="140" rx="22" class="panel ${tone}"/>${icon(x, y - 5, name, colors[tone])}${text(x, y + 105, label)}${detail ? text(x, y + 133, detail, "small") : ""}</g>`;
}
function doc(x: number, y: number, version = "v1", scale = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${scale})" class="payload"><rect x="-36" y="-46" width="72" height="92" rx="9"/><path d="M-20-25H12M-20-13H20M-20-1H12" class="glyph"/>${text(0, 28, version)}</g>`;
}
function wire(path: string, tone = ""): string {
  return `<path d="${path}" class="wire ${tone}"/>`;
}
function packet(
  path: string,
  tone = "cyan",
  delay = 0,
  duration = 1.4,
  payload = false,
): string {
  const color: Record<string, string> = {
    cyan: "#63d9f3",
    green: "#90edb5",
    purple: "#b49aff",
    red: "#ff8c91",
  };
  return `<g class="packet" style="offset-path:path('${path}');--delay:${delay}s;--duration:${duration}s;color:${color[tone]}">${payload ? '<rect x="-12" y="-17" width="24" height="34" rx="4" fill="currentColor"/><path d="M-6-7H6M-6 0H6M-6 7H2" stroke="#11231e" stroke-width="2"/>' : '<circle r="7" fill="currentColor"/><path d="m-3-3 4 3-4 3" fill="none" stroke="#101c2d" stroke-width="1.5"/>'}</g>`;
}
function svg(content: string, description: string): string {
  return `<svg viewBox="0 0 1440 510" role="img" aria-label="${description}">${content}</svg>`;
}
const left = "M260 250H500";
const right = "M660 250H1110";
const back = "M1110 290H660";
const answer = "M500 290H260";

function flow(
  step: number,
  mode: "plain" | "cache" | "outage" | "refresh",
): string {
  const cached = mode !== "plain";
  const outage = mode === "outage" && step > 0;
  const refresh = mode === "refresh";
  const loaded =
    (mode === "cache" && step >= 2) || mode === "outage" || refresh;
  let body =
    wire(left, "active") +
    wire(right, outage ? "broken" : "active") +
    wire(back, outage ? "broken" : "return") +
    wire(answer, "return");
  body +=
    node(180, 270, "user", "Brukere") +
    node(
      580,
      270,
      loaded ? "" : cached ? "cache" : "service",
      cached ? "Tjeneste + cache" : "Tjeneste",
      cached ? "green" : "cyan",
    );
  body += node(
    1190,
    270,
    "source",
    "Datakilde",
    outage ? "red" : "purple",
    outage ? "Utilgjengelig" : "",
  );
  if (loaded) {
    body += doc(580, 265, refresh && step >= 5 ? "v2" : "v1", 0.65);
    if (refresh && step === 4)
      body += `<g class="reveal" style="animation-delay:${1.5 * flowSlowDown}s">${doc(580, 265, "v2", 0.65)}</g>`;
  }
  if (mode === "plain" && step > 0) {
    const count = step === 1 ? 1 : step === 2 ? 4 : 7;
    for (let i = 0; i < count; i++) {
      const y = 250 + i * 6;
      body += packet(`M260 ${y}H500 M660 ${y}H1090`, "cyan", i * 0.13, 1.3);
      body += packet(
        `M1110 ${y + 30}H660 M500 ${y + 30}H280`,
        "green",
        1.4 + i * 0.13,
        1,
        true,
      );
    }
    if (step === 3)
      body += `<g class="reveal">${text(1000, 120, "Samme dokumentliste. Igjen og igjen.", "small")}${[0, 1, 2, 3].map((i) => doc(1020 + i * 23, 170, "v1", 0.35)).join("")}</g>`;
  }
  if (mode === "cache") {
    if (step === 1) body += packet("M260 250H1110", "cyan");
    if (step === 2)
      body +=
        packet(back, "green", 0, 1.1, true) +
        packet(answer, "green", 0.8, 0.7, true);
    if (step >= 3)
      for (let i = 0; i < 4; i++)
        body +=
          packet(left, "cyan", i * 0.18, 0.6) +
          packet(answer, "green", 0.6 + i * 0.18, 0.65, true);
    if (step === 4)
      body += `<g class="reveal">${text(420, 100, "5 forespørsler", "label cyan-text")}${text(1010, 100, "1 kildekall", "label green-text")}${text(1010, 130, "Illustrert eksempel", "micro")}</g>`;
  }
  if (mode === "outage") {
    body += text(580, 140, "Gyldige cachedata", "small green-text");
    if (outage) body += text(1190, 275, "×", "large red-text");
    if (step >= 2)
      for (let i = 0; i < (step === 3 ? 4 : 1); i++)
        body +=
          packet(left, "cyan", i * 0.2, 0.55) +
          packet(answer, "green", 0.5 + i * 0.2, 0.65, true);
  }
  if (refresh) {
    const update = "M660 225C800 110 970 110 1110 225";
    const updated = "M1110 305C970 430 800 430 660 305";
    body +=
      wire(update, "purple") +
      wire(updated, "purple") +
      text(875, 110, "Oppdatering", "small purple-text") +
      text(380, 355, "Svar", "small green-text");
    if (step >= 1) body += packet(left, "cyan", 0, 0.65);
    if (step >= 2)
      body +=
        packet(answer, "green", 0, 0.65, true) +
        text(380, 385, step >= 5 ? "v2" : "v1", "small green-text");
    if (step === 3)
      body +=
        packet(answer, "green", 0, 0.7, true) +
        packet(update, "purple", 0, 1.8);
    if (step === 4) body += packet(updated, "purple", 0, 1.5, true);
  }
  return svg(
    body,
    "Brukere, tjeneste og datakilde. " +
      (outage
        ? "Datakilden er nede, men gyldige cachedata kan leveres."
        : "Forespørsler og svar følger de markerte forbindelsene."),
  );
}

function freshness(step: number): string {
  const zones = [
    { x: 120, w: 330, label: "Fersk", tone: "green" },
    { x: 450, w: 500, label: "Kan oppdateres", tone: "purple" },
    { x: 950, w: 370, label: "Utløpt", tone: "red" },
  ];
  let body = zones
    .map(
      (z) =>
        `<rect x="${z.x}" y="185" width="${z.w}" height="120" class="panel ${z.tone}"/>${text(z.x + z.w / 2, 253, z.label)}`,
    )
    .join("");
  body +=
    wire("M120 325H1320", "active") +
    text(450, 365, "Oppdateringsgrense", "small") +
    text(950, 365, "Utløp", "small");
  if (step > 0) {
    const x = [0, 280, 695, 1140][step];
    body += `<g class="reveal"><path d="M${x} 130v40m-7-8 7 8 7-8" stroke="#63d9f3" stroke-width="3" fill="none"/>${text(x, 105, "Oppslag", "small cyan-text")}</g>`;
    body += doc(x, 420, "v1", 0.55);
    body += text(
      x,
      490,
      step === 3
        ? "Vent på ny lasting"
        : step === 2
          ? "Svar nå + oppdatering"
          : "Svar nå",
      `small ${step === 3 ? "red-text" : "green-text"}`,
    );
    if (step === 2)
      body +=
        icon(805, 420, "source", "#b49aff", 0.6) +
        packet("M730 420H780", "purple", 0, 1.2);
    if (step === 3)
      body +=
        icon(1250, 420, "source", "#ff8c91", 0.6) +
        packet("M1240 420H1165", "green", 0.9, 1, true);
  }
  return svg(
    body,
    "Tidslinje: fersk gir svar straks, etter oppdateringsgrensen kan oppdatering starte, etter utløp må ny lasting avventes.",
  );
}

function fingerprint(step: number): string {
  const changed = step >= 4;
  let body =
    node(340, 245, "", "Cache", "green") +
    node(1100, 245, "", "Datakilde", "purple");
  body +=
    doc(340, 242, changed ? "v2" : "v1", 0.75) +
    doc(1100, 242, changed ? "v2" : "v1", 0.75);
  body +=
    wire("M420 195C650 70 800 70 1020 195", "purple") +
    wire("M1020 295C800 440 650 440 420 295", changed ? "return" : "");
  if (step > 0)
    body +=
      packet("M1020 185C830 85 650 85 460 185", "purple", 0, 1.2) +
      text(720, 92, "Sist oppdatert", "small purple-text");
  if (step >= 2) {
    body += `<g class="reveal"><rect x="500" y="190" width="440" height="100" rx="18" class="panel ${changed ? "purple" : "green"}"/>${text(720, 235, changed ? "10:32 ≠ 10:47" : "10:32 = 10:32", "large")}${text(720, 270, changed ? "Endret" : "Uendret", "small")}</g>`;
  }
  if (step === 3)
    body +=
      text(
        720,
        390,
        "Behold dokumentlisten. Forny gyldigheten.",
        "label green-text",
      ) +
      wire("M250 410H430", "return") +
      packet("M250 410H430", "green", 0, 1);
  if (step === 4)
    body +=
      packet("M1020 295C800 440 650 440 420 295", "green", 0.5, 1.5, true) +
      text(720, 445, "Hent ny dokumentliste", "small green-text");
  if (step === 5)
    body += `<g class="reveal">${wire("M510 405H930", "purple")}<path d="M720 390v30" stroke="#b49aff" stroke-width="3"/>${text(720, 455, "Valgfri grense: vent på kontroll", "small purple-text")}</g>`;
  return svg(
    body,
    "Et lite fingeravtrykk sammenlignes. Uendret betyr at payloaden beholdes og gyldigheten fornyes. Endret betyr ny lasting.",
  );
}

function singleFlight(step: number): string {
  let body = "";
  for (let i = 0; i < 6; i++) {
    const y = 75 + i * 68;
    const requestPath = `M185 ${y}C340 ${y} 350 250 530 250`;
    const responsePath = `M530 250C350 250 340 ${y} 185 ${y}`;
    body +=
      icon(150, y, "user", "#63d9f3", 0.55) +
      wire(requestPath, step === 4 ? "return" : "active");
    if (step === 1 || step === 2)
      body += packet(requestPath, "cyan", i * 0.08, 1);
    if (step === 4) body += packet(responsePath, "green", i * 0.06, 1.2, true);
  }
  body += node(
    610,
    250,
    step >= 3 ? "" : "cache",
    "Cache",
    "green",
    step >= 3 ? "Domstollisten er lagret" : "Domstolliste · tom cache",
  );
  body +=
    node(1180, 250, "source", "Datakilde", "purple") +
    wire("M690 250H1100", step >= 3 ? "return" : "active");
  if (step === 2) body += packet("M690 250H1100", "cyan", 1.5, 1.3);
  if (step >= 2)
    body += text(
      895,
      170,
      step === 4 ? "Lastet én gang" : "Én lasting",
      "label cyan-text",
    );
  if (step === 2) body += text(420, 425, "De andre venter", "small");
  if (step >= 3)
    body +=
      step === 3
        ? `<g class="reveal" style="animation-delay:${1.3 * flowSlowDown}s">${doc(610, 250, "v1", 0.6)}</g>`
        : doc(610, 250, "v1", 0.6);
  if (step === 3) body += packet("M1100 250H690", "green", 0, 1.3, true);
  if (step === 4) body += text(895, 390, "Single-flight", "large green-text");
  return svg(
    body,
    "Seks samtidige forespørsler etter listen over domstoler. Én laster, de andre venter og gjenbruker resultatet.",
  );
}

function pods(step: number): string {
  const redis = step >= 4;
  const restart = step === 3 || step === 6;
  const podToSource = "M345 135V80Q345 55 370 55H1255Q1280 55 1280 80V175";
  const sourceToPod = "M1280 175V80Q1280 55 1255 55H370Q345 55 345 80V135";
  const podToRedis = "M425 290C490 390 1010 390 1020 285";
  const loading = step === 5 || step === 7;
  const loadDelay = step === 7 ? 0.9 : 0.2;
  let body = `<rect x="210" y="65" width="720" height="390" rx="30" fill="#101b2a55" stroke="#35445e" stroke-dasharray="7 7"/>${text(570, 100, "OPENSHIFT", "micro")}`;
  if (redis) body += wire(podToSource, "active");
  body += icon(90, 250, "user", "#63d9f3") + text(90, 315, "Bruker", "small");
  body += node(1280, 245, "source", "Datakilde", "purple");
  for (let i = 0; i < 3; i++) {
    const x = 345 + i * 220;
    body += wire(`M115 250C175 250 175 115 ${x} 115V135`, "active");
    body += `<g class="${restart && i === 0 ? "restart-pod" : ""}"><rect x="${x - 80}" y="135" width="160" height="220" rx="17" class="panel cyan"/>${icon(x, 178, "service")}${text(x, 225, `Pod ${String.fromCharCode(65 + i)}`, "label")}`;
    if (!redis) {
      const hasData =
        (step >= 1 && i === 0 && !restart) || (step >= 2 && i === 1);
      body += `<rect x="${x - 57}" y="245" width="114" height="86" rx="10" class="panel green"/>${text(x, 273, "Lokal cache", "small")}`;
      body += hasData ? doc(x, 301, "v1", 0.32) : text(x, 307, "Tom", "small");
      const path = `M${x + 80} 300C${x + 140} 470 1140 470 1200 280`;
      body += wire(path);
      if (
        (step === 1 && i === 0) ||
        (step === 2 && i === 1) ||
        (step === 3 && i === 0)
      )
        body += packet(path, "cyan", 0, 1.3);
    }
    body += "</g>";
    if (redis) {
      const path = `M${x + 80} 290C${x + 145} 390 1010 390 1020 285`;
      body += wire(path, "purple");
      if ((loading && i > 0) || (step === 6 && i === 0))
        body += packet(
          `M1020 285C1010 390 ${x + 145} 390 ${x + 80} 290`,
          "green",
          step === 6 ? 0 : loadDelay + 2.7 + i * 0.16,
          0.9,
          true,
        );
      if (step === 7) body += packet(path, "cyan", i * 0.08, 0.6);
    }
  }
  if (redis) {
    body += node(
      1035,
      230,
      step >= 5 && step < 7 ? "" : "cache",
      "Redis",
      "purple",
      "Delt cache",
    );
    if (step === 6) body += doc(1035, 230, "v1", 0.55);
    if (loading)
      body += `<g class="reveal" style="animation-delay:${(loadDelay + 2.6) * flowSlowDown}s">${doc(1035, 230, "v1", 0.55)}</g>`;
    if (step === 7) body += text(1035, 165, "Ny nøkkel", "small");
    if (loading)
      body +=
        packet(podToSource, "cyan", loadDelay, 0.8) +
        packet(sourceToPod, "green", loadDelay + 0.9, 0.8, true) +
        packet(podToRedis, "green", loadDelay + 1.8, 0.8, true);
    if (step === 7)
      body += text(
        1100,
        450,
        "Én lasting på tvers av podder",
        "small green-text",
      );
  }
  if (restart)
    body += text(345, 400, "Pod A starter på nytt", "small red-text");
  return (
    `<div class="mode-pill">${redis ? "Redis · delt" : "Caffeine · lokalt"}</div>` +
    svg(
      body,
      redis
        ? "Tre podder deler domstollisten i Redis. Pod A henter fra datakilden og skriver til Redis; Redis kaller ikke datakilden. Cacheverdien overlever omstart av Pod A. Lasting kan samordnes mellom podder."
        : "Tre podder har hver sin lokale domstolliste i Caffeine. Ved omstart mister Pod A sin lokale cache.",
    )
  );
}

function architecture(step: number): string {
  const names = ["Application", "Manager", "Engine", "Access", "Resource"];
  let body = "";
  names.forEach((name, i) => {
    const y = 65 + i * 80;
    const active =
      step >= 3 ||
      (step === 1 && i === 3) ||
      (step === 2 && (i === 1 || i === 2 || i === 3));
    if (i < names.length - 1) body += wire(`M565 ${y + 30}v20`, "active");
    body += `<rect x="365" y="${y - 30}" width="400" height="60" rx="14" class="panel ${active ? "green" : ""}"/>${text(565, y + 8, name)}`;
    if (active)
      body += `<g class="reveal">${wire(`M775 ${y + 5}H950`, "return")}${icon(1010, y + 5, "cache", "#90edb5", 0.65)}${text(1110, y + 12, "Cache", "small green-text")}</g>`;
  });
  body += icon(565, 468, "source", "#b49aff", 0.65) + wire("M565 415v25");
  if (step >= 2)
    body +=
      doc(210, 220, "Domene", 1.25) +
      text(210, 320, "Dine dataklasser", "small green-text");
  return svg(
    body,
    "Cachefunksjonalitet kan brukes fra Application, Manager, Engine, Access og Resource. Access returnerer domenemodeller og inngår sammen med Manager og Engine i illustrasjonen av caching av domenedata.",
  );
}

function protection(step: number): string {
  let body = node(720, 180, "shield", "Automatisk beskyttelse", "green");
  body += `<rect x="120" y="130" width="300" height="95" rx="15" class="panel cyan"/>${text(270, 185, "dokumentliste:123", "label cyan-text")}`;
  body += wire("M430 180H630", "active") + wire("M810 180H1030", "return");
  body += `<rect x="1040" y="130" width="280" height="95" rx="15" class="panel ${step >= 1 ? "green" : ""}"/>${text(1180, 185, step >= 1 ? "9f3a…72bc" : "Lagringsnøkkel", step >= 1 ? "label green-text" : "small")}`;
  if (step >= 1)
    body +=
      packet("M430 180H1030", "cyan", 0, 1) +
      text(1180, 270, "Nøkler hashes", "small green-text");
  body +=
    doc(270, 370, "v1", 0.7) + wire("M320 370H1030", step >= 2 ? "purple" : "");
  body += node(
    1180,
    370,
    step >= 2 ? "lock" : "cache",
    "Redis",
    step >= 2 ? "purple" : "",
  );
  if (step >= 2)
    body +=
      packet("M320 370H1030", "purple", 0, 1.2, true) +
      icon(720, 370, "lock", "#b49aff") +
      text(720, 450, "Redis-verdier krypteres", "small purple-text");
  return svg(
    body,
    "Lesbare nøkler hashes til ugjenkjennelige lagringsnøkler. Redis-verdier krypteres automatisk.",
  );
}

function telemetry(step: number): string {
  let body =
    node(220, 250, "cache", "Cache", "green") + wire("M300 250H510", "active");
  body += `<rect x="520" y="65" width="810" height="385" rx="24" class="panel"/>${text(925, 105, "ILLUSTRERTE SIGNALER", "micro")}`;
  const metrics = ["Treff", "Lasting", "Oppdatering", "Feil"];
  metrics.forEach((label, i) => {
    const x = 640 + i * 190;
    const active = i === 0 ? step >= 1 : i === 3 ? step >= 3 : step >= 2;
    const tone = i === 3 ? "red" : i === 2 ? "purple" : "green";
    body += `<rect x="${x - 75}" y="145" width="150" height="155" rx="13" class="panel ${active ? tone : ""}"/>${text(x, 180, label, "small")}`;
    for (let j = 0; j < 6; j++) {
      const height = active ? [25, 40, 32, 65, 50, 80][(j + i) % 6] : 4;
      body += `<rect x="${x - 55 + j * 19}" y="${280 - height}" width="11" height="${height}" rx="3" fill="${active ? ["#90edb5", "#63d9f3", "#b49aff", "#ff8c91"][i] : "#35445e"}" class="reveal"/>`;
    }
  });
  if (step >= 1) body += packet("M300 250H510", "green", 0, 0.9);
  if (step === 3)
    body += `<g class="reveal"><rect x="565" y="335" width="720" height="65" rx="10" class="panel red"/>${text(925, 375, "×  Feil ved oppdatering · logghendelse", "small red-text")}</g>`;
  return svg(
    body,
    "Illustrert dashboard med standardiserte signaler for cachetreff, lasting, oppdatering og feil, samt logger.",
  );
}

function codeScene(step: number): string {
  return `<div class="code-card" data-no-advance><div class="code-top"><i></i><i></i><i></i><span>Kotlin · i din tjeneste</span></div><pre><code><span class="code-line"><span class="kw">val</span> dokumentliste: List&lt;Dokument&gt; = caching.<span class="fn">getOrRefresh</span>(</span><span class="code-line ${step === 1 ? "highlight" : ""}">    key = <span class="str">"dokumentliste:$sakId"</span>,</span><span class="code-line">    operationName = <span class="str">"hentDokumentliste"</span>,</span><span class="code-line ${step === 2 ? "highlight" : ""}">    loader = { dokumentAccess.<span class="fn">hentDokumentliste</span>(sakId) },</span><span class="code-line">)</span></code></pre></div>${step === 3 ? '<div class="demo-call">La oss prøve. ↗</div>' : ""}`;
}

const slides: Slide[] = [
  {
    title: "Hvorfor hente det samme om igjen?",
    accent: "samme",
    chapter: "01 / HVORFOR CACHE",
    duration: 35,
    labels: [
      "Én sak. Én dokumentliste. Mange som trenger den.",
      "Hvert oppslag tar hele turen.",
      "Flere brukere. Det samme arbeidet.",
      "Ventetid for brukerne. Belastning på kilden.",
    ],
    note: "Start med behovet, ikke teknologien. Hent dokumentlisten for samme sak først én gang, så flere ganger. La publikum se at identiske data hentes om igjen. Trafikken er en illustrasjon, ikke en ytelsesmåling.",
    draw: (s) => flow(s, "plain"),
  },
  {
    title: "Hent én gang. Gjenbruk.",
    accent: "Gjenbruk.",
    chapter: "01 / HVORFOR CACHE",
    duration: 40,
    labels: [
      "En liten mellomlagring. En stor forskjell.",
      "Første oppslag: hent fra kilden.",
      "Behold resultatet.",
      "Raskere svar. Mindre belastning.",
      "Flere forespørsler trenger ikke bety flere kildekall.",
    ],
    note: "Følg dokumentlisten inn i cachen. Første oppslag må hente, deretter kan resultatet gjenbrukes. Telleren er et forenklet eksempel: fem forespørsler, ett kildekall.",
    draw: (s) => flow(s, "cache"),
  },
  {
    title: "Datakilden nede. Fortsatt svar.",
    accent: "Fortsatt svar.",
    chapter: "01 / HVORFOR CACHE",
    duration: 35,
    labels: [
      "Dokumentlisten finnes allerede i cachen.",
      "Datakilden blir utilgjengelig.",
      "Gyldige cachedata kan fortsatt leveres.",
      "Mindre avhengighet av oppetid ved hvert oppslag.",
    ],
    note: "Poenget er tåleevne: kilden trenger ikke være oppe ved hvert eneste oppslag. Vi viser en verdi innenfor gjeldende gyldighetsgrenser. Cachebom, utløp og nødvendig kontroll kan fortsatt feile. Ikke forklar bakgrunnsoppdatering her.",
    draw: (s) => flow(s, "outage"),
  },
  {
    title: "Svar nå. Oppdater i bakgrunnen.",
    accent: "Svar nå.",
    chapter: "02 / DETTE FÅR DU",
    duration: 60,
    labels: [
      "Dokumentliste v1 finnes allerede.",
      "Et oppslag utløser behov for oppdatering.",
      "Brukeren får v1 med en gang.",
      "Svaret og oppdateringen går i hvert sitt spor.",
      "En ny versjon erstatter den gamle.",
      "Neste oppslag får v2.",
    ],
    note: "Bruk tid på de to sporene. Et oppslag etter oppdateringsgrensen får en brukbar lagret verdi, mens oppdatering kan starte. Det er oppslag som utløser arbeidet, ikke en periodisk timer. Neste bruker kan få ny versjon.",
    draw: (s) => flow(s, "refresh"),
  },
  {
    title: "Du bestemmer ferskheten.",
    accent: "Du bestemmer",
    chapter: "02 / DETTE FÅR DU",
    duration: 40,
    labels: [
      "Samme data. Ulike behov for ferskhet.",
      "Fersk: svar med en gang.",
      "Etter oppdateringsgrensen: svar nå, oppdater i bakgrunnen.",
      "Etter utløp: vent på ny lasting.",
    ],
    note: "Dette er modellen uten valgfritt fingeravtrykk. Intervallene kan tilpasses tjenesten og overstyres per oppslag, men samme nøkkel må bruke samme intervaller. Tidene regnes fra siste lasting eller vellykkede kontroll. Ikke gå inn i standardverdier.",
    draw: freshness,
  },
  {
    title: "Er noe egentlig endret?",
    accent: "egentlig endret?",
    chapter: "02 / DETTE FÅR DU",
    duration: 60,
    labels: [
      "En stor dokumentliste. En liten versjonssjekk.",
      "Hent bare fingeravtrykket først.",
      "Samme fingeravtrykk.",
      "Ingen ny payload. Gyldigheten starter på nytt.",
      "Endret fingeravtrykk? Hent ny dokumentliste.",
      "Du kan også kreve kontroll før neste svar.",
    ],
    note: "Fingeravtrykk er valgfritt og leveres av konsumenten. Her bruker vi sist oppdatert-tidspunkt: 10:32 er uendret, mens 10:47 betyr at dokumentlisten er endret. Datoen er utelatt kun for å forenkle illustrasjonen; i reell bruk må hele tidspunktet og tilstrekkelig presisjon inngå. Uendret kontroll fornyer gyldigheten; endring gir ny payload. Alle endringer som påvirker resultatet må endre fingeravtrykket. Siste steg viser den valgfrie grensen der kontroll må avventes. Størrelsen på pakkene er en metafor.",
    draw: fingerprint,
  },
  {
    title: "Mange spør. Én henter.",
    accent: "Én henter.",
    chapter: "02 / DETTE FÅR DU",
    duration: 55,
    labels: [
      "Samme domstolliste. Samtidige oppslag. Tom cache.",
      "Alle trenger listen over domstoler.",
      "Én laster. De andre venter.",
      "Resultatet lagres én gang.",
      "Alle gjenbruker resultatet.",
    ],
    note: "Eksempelet her er listen over domstoler, som deles av alle kallere. Vi viser en cachebom, slik at de andre faktisk må vente. Single-flight samordner per nøkkel. Ved brukbar lagret verdi kan andre få den mens oppdatering pågår. Redis samordner også mellom podder; lokal cache gjør ikke det mellom uavhengige podder.",
    draw: singleFlight,
  },
  {
    title: "Lokalt eller delt i OpenShift.",
    accent: "Lokalt eller delt",
    chapter: "03 / PASSER DIN TJENESTE",
    duration: 65,
    labels: [
      "Caffeine: hver pod har sin egen domstolliste.",
      "Caffeine: Pod A henter og lagrer lokalt.",
      "Caffeine: Pod B må bygge sin egen kopi.",
      "Caffeine: omstart tømmer den lokale cachen.",
      "Redis: ett delt lager utenfor applikasjonspoddene.",
      "Redis: poddene gjenbruker samme domstolliste.",
      "Redis: Pod A starter på nytt. Den delte verdien er der fortsatt.",
      "Redis: også lasting kan samordnes på tvers av podder.",
    ],
    note: "Vi fortsetter med listen over domstoler. Velg lokal cache når hver pod kan ha sin egen kopi. Velg Redis når data og samordning skal deles. Ved cachebom henter Pod A fra datakilden og skriver resultatet til Redis. De andre poddene gjenbruker deretter den delte verdien. Redis kaller aldri datakilden selv. Redis-scenen viser et selvstendig alternativ, ikke et lokalt lag foran Redis. Omstarten gjelder applikasjonspod A, ikke Redis. Deling krever samme Redis, prefiks, applikasjonsnavn og hemmelighet. API-et for konsumenten er det samme.",
    draw: pods,
  },
  {
    title: "Cache der du trenger den.",
    accent: "der du trenger den.",
    chapter: "03 / PASSER DIN TJENESTE",
    duration: 30,
    labels: [
      "Ikke et nytt arkitekturlag. Et verktøy i lagene dine.",
      "Cache domenemodeller som returneres fra Access.",
      "Eller gjenbruk domenedata og beregnede resultater.",
      "Tilgjengelig fra alle arkitekturlag.",
    ],
    note: "Vis alle fem lagene: Application, Manager, Engine, Access og Resource. Access returnerer domenemodeller og fremheves derfor sammen med Manager og Engine på steget om domenemodeller. Resource håndterer rådata og klienter. Fremhev at dette også fungerer i domenelaget. Kotlin-dataklassene trenger ikke cacheannotasjoner eller teknologiavhengigheter. Løsningen håndterer serialisering. Figuren viser mulige plasseringer, ikke at samme data skal caches i alle lag. Laget kan opprette sin egen instans.",
    draw: architecture,
  },
  {
    title: "Beskyttelse følger med.",
    accent: "følger med.",
    chapter: "04 / FERDIG HÅNDTERT",
    duration: 25,
    labels: [
      "Fellesløsningen tar hånd om lagringsbeskyttelsen.",
      "Nøkler hashes automatisk.",
      "Redis-verdier krypteres automatisk.",
    ],
    note: "Hold dette svært overfladisk. Nøkler hashes, Redis-verdier krypteres. Ikke kall hashing reversibel kryptering, og ikke si at Caffeine-verdier krypteres. Hemmelighet og øvrig oppsett kan vises i live-demoen.",
    draw: protection,
  },
  {
    title: "Innsikt følger med.",
    accent: "følger med.",
    chapter: "04 / FERDIG HÅNDTERT",
    duration: 25,
    labels: [
      "Standardiserte metrikker og logger.",
      "Se når cachen gir treff.",
      "Følg lasting og oppdateringer.",
      "Fang opp feil og tilhørende logger.",
    ],
    note: "Dette er en illustrasjon av signalene, ikke et ferdig dashboard som følger med biblioteket. Ingen tall er produksjonsmålinger. Konsumenten får standardiserte metrikker og logger for treff, lasting, oppdateringer og feil.",
    draw: telemetry,
  },
  {
    title: "Klar til bruk.",
    accent: "bruk.",
    chapter: "05 / FRA IDÉ TIL KODE",
    duration: 35,
    labels: [
      "Du henter data. Fellesløsningen håndterer cachen.",
      "En nøkkel som identifiserer resultatet.",
      "Din vanlige hentefunksjon.",
      "La oss gå til live-demoen.",
    ],
    note: "Eksempelet forutsetter en opprettet caching-instans. Nøkkelen må inkludere alle parametere som påvirker resultatet. operationName er fast, ikke en bruker-ID. Dette eksempelet gjelder applikasjonsdelte data; brukeravhengige resultater trenger isolatedFor og fortsatt autorisasjon. Gå videre til oppsett og kjøring i live-demoen.",
    draw: codeScene,
  },
];

function element<T extends HTMLElement>(id: string): T {
  const result = document.getElementById(id);
  if (!result) throw new Error(`Mangler elementet ${id}`);
  return result as T;
}
let current = 0;
let step = 0;
const scene = element("scene");
const dialog = element<HTMLDialogElement>("dialog");
let dialogMode: "notes" | "overview" = "notes";
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let flowAnimations: Animation[] = [];

function startFlowLoops(): void {
  for (const animation of flowAnimations) animation.cancel();
  flowAnimations = [];
  if (reducedMotion.matches) return;

  const packets = Array.from(scene.querySelectorAll<SVGGElement>(".packet"));
  if (packets.length === 0) return;

  const timings = packets.map((packet) => {
    const style = getComputedStyle(packet);
    return {
      packet,
      delay: parseFloat(style.getPropertyValue("--delay")) * flowSlowDown,
      duration: parseFloat(style.getPropertyValue("--duration")) * flowSlowDown,
    };
  });
  // Felles rundetid bevarer rekkefølgen mellom forespørsler og svar ved gjentakelse.
  const cycle =
    Math.max(...timings.map(({ delay, duration }) => delay + duration)) + 1.2;
  const startTime = document.timeline.currentTime;
  flowAnimations = timings.map(({ packet, delay, duration }) => {
    const start = delay / cycle;
    const end = (delay + duration) / cycle;
    const fade = 0.15 / cycle;
    const animation = packet.animate(
      [
        { offset: 0, offsetDistance: "0%", opacity: 0 },
        { offset: start, offsetDistance: "0%", opacity: 0 },
        {
          offset: start + fade,
          offsetDistance: "0%",
          opacity: 1,
          easing: "cubic-bezier(0.35, 0, 0.25, 1)",
        },
        { offset: end, offsetDistance: "100%", opacity: 1 },
        { offset: end + fade, offsetDistance: "100%", opacity: 0 },
        { offset: 1, offsetDistance: "100%", opacity: 0 },
      ],
      { duration: cycle * 1000, iterations: Infinity },
    );
    animation.startTime = startTime;
    return animation;
  });
}

function render(): void {
  const slide = slides[current];
  element("title").innerHTML = slide.title.replace(
    slide.accent,
    `<em>${slide.accent}</em>`,
  );
  element("eyebrow").textContent =
    `Felles cacheløsning / ${String(current + 1).padStart(2, "0")}`;
  element("chapter").textContent = slide.chapter;
  scene.innerHTML = slide.draw(step);
  startFlowLoops();
  element("step-label").textContent = slide.labels[step];
  element("steps").innerHTML = slide.labels
    .map(
      (_, i) =>
        `<span class="step-dot ${i <= step ? "done" : ""}" ${i === step ? 'aria-current="step"' : ""}></span>`,
    )
    .join("");
  element("steps").setAttribute(
    "aria-label",
    `Steg ${step + 1} av ${slide.labels.length}`,
  );
  element("counter").textContent =
    `${String(current + 1).padStart(2, "0")} / 12`;
  element("progress").style.width =
    `${((current + (step + 1) / slide.labels.length) / slides.length) * 100}%`;
  element<HTMLButtonElement>("previous").disabled = current === 0 && step === 0;
  element<HTMLButtonElement>("next").disabled =
    current === slides.length - 1 && step === slide.labels.length - 1;
  element("announcement").textContent =
    `Slide ${current + 1}: ${slide.title} ${slide.labels[step]}`;
  document.title = `${current + 1}. ${slide.title} — Felles caching`;
  history.replaceState(null, "", `#${current + 1}/${step}`);
}
function move(direction: number): void {
  if (direction > 0) {
    if (step < slides[current].labels.length - 1) step++;
    else if (current < slides.length - 1) {
      current++;
      step = 0;
    }
  } else if (step > 0) step--;
  else if (current > 0) {
    current--;
    step = slides[current].labels.length - 1;
  }
  render();
}
function readHash(): void {
  const match = /^#(\d+)(?:\/(\d+))?$/.exec(location.hash);
  current = Math.max(
    0,
    Math.min(slides.length - 1, Number(match?.[1] ?? 1) - 1),
  );
  step = Math.max(
    0,
    Math.min(slides[current].labels.length - 1, Number(match?.[2] ?? 0)),
  );
  render();
}
function resize(): void {
  const scale = Math.min(innerWidth / 1600, innerHeight / 900);
  const deck = element("deck");
  deck.style.transform = `scale(${scale})`;
  deck.style.left = `${(innerWidth - 1600 * scale) / 2}px`;
  deck.style.top = `${(innerHeight - 900 * scale) / 2}px`;
}
async function fullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
  } catch {
    element("announcement").textContent =
      "Fullskjerm er ikke tilgjengelig i denne nettleseren.";
  }
}
function openDialog(mode: "notes" | "overview"): void {
  dialogMode = mode;
  const slide = slides[current];
  element("dialog-title").textContent =
    mode === "notes" ? `${current + 1}. ${slide.title}` : "Velg en slide";
  if (mode === "notes") {
    element("dialog-body").innerHTML =
      `<p class="note-step">Steg ${step + 1}/${slide.labels.length} · ${slide.duration} sekunder</p><p>${slide.note}</p><ol>${slide.labels.map((label, i) => `<li${i === step ? ' class="note-step"' : ""}>${label}</li>`).join("")}</ol><p>Notatene vises på denne skjermen. Lukk før du fortsetter presentasjonen.</p>`;
  } else {
    element("dialog-body").innerHTML =
      `<div class="overview-grid">${slides.map((s, i) => `<button data-slide="${i}" ${current === i ? 'aria-current="true"' : ""}>${String(i + 1).padStart(2, "0")} · ${s.title}</button>`).join("")}</div>`;
  }
  if (!dialog.open) dialog.showModal();
}

element("next").addEventListener("click", () => move(1));
element("previous").addEventListener("click", () => move(-1));
element("restart").addEventListener("click", () => {
  step = 0;
  render();
});
element("fullscreen").addEventListener("click", () => void fullscreen());
element("notes").addEventListener("click", () => openDialog("notes"));
element("overview").addEventListener("click", () => openDialog("overview"));
element("close-dialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  element(dialogMode === "notes" ? "notes" : "overview").focus({
    preventScroll: true,
  });
});
dialog.addEventListener("click", (event) => {
  const target = (event.target as HTMLElement).closest<HTMLButtonElement>(
    "[data-slide]",
  );
  if (target) {
    current = Number(target.dataset.slide);
    step = 0;
    dialog.close();
    render();
  }
});
element("slide").addEventListener("click", (event) => {
  if (!(event.target as Element).closest("[data-no-advance], button, a"))
    move(1);
});
document.addEventListener("keydown", (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return;
  if (dialog.open) {
    if (event.key.toLowerCase() === (dialogMode === "notes" ? "n" : "o"))
      dialog.close();
    return;
  }
  if (
    event.target instanceof Element &&
    event.target.closest("button, input, textarea, select, a") &&
    (event.key === " " || event.key === "Enter")
  )
    return;
  if (["ArrowRight", " ", "PageDown"].includes(event.key)) {
    event.preventDefault();
    move(1);
  } else if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    move(-1);
  } else if (event.key === "Home") {
    event.preventDefault();
    current = 0;
    step = 0;
    render();
  } else if (event.key === "End") {
    event.preventDefault();
    current = slides.length - 1;
    step = 0;
    render();
  } else if (event.key.toLowerCase() === "r") {
    step = 0;
    render();
  } else if (event.key.toLowerCase() === "n") openDialog("notes");
  else if (event.key.toLowerCase() === "o") openDialog("overview");
  else if (event.key.toLowerCase() === "f") void fullscreen();
});
window.addEventListener("resize", resize);
window.addEventListener("hashchange", readHash);
reducedMotion.addEventListener("change", startFlowLoops);
resize();
readHash();
