# Mindre venting. Mer flyt.

En selvstendig, animert presentasjon av felles cacheløsning. Tolv slides, omtrent ti minutter, med et kort kodeeksempel som overgang til live-demo.

## Start presentasjonen

Fra rotmappen i dette repositoriet, med Node.js 22 eller nyere og pnpm installert:

```sh
pnpm install
pnpm dev
```

Åpne **http://localhost:4173**. Repositoriet har eget byggeoppsett og krever ikke det opprinnelige monorepoet.

Bygg og oppstart kan også kjøres separat:

```sh
pnpm run build
pnpm start
```

Bygget skriver nettleserklar JavaScript til `dist/`. Serveren bruker bare Node-standardbiblioteket og lytter på `127.0.0.1`. Velg en annen port med `PORT=4174 pnpm start`.

Presentasjonen bruker ingen eksterne tjenester, fonter, bilder eller CDN-er. Etter byggeoppsettet kan den vises uten internettilgang.

## Publisering

Nettsiden publiseres på **https://tmfwang.github.io/caching-presentasjon/**.

GitHub Actions bygger og publiserer automatisk ved push til `main`. I repositoriets **Settings → Pages** skal publiseringskilden være **GitHub Actions**. Eget domene er ikke nødvendig.

`pnpm build` lager mappen `site/` med bare HTML, CSS og ferdigkompilert JavaScript. Den kan også publiseres på andre statiske webservere. Relative ressurslenker gjør at presentasjonen fungerer under `/caching-presentasjon/`, inkludert direktelenker som `#7/4`.

Publiserte CSS- og JavaScript-filer får en innholdshash i filnavnet, slik at nettleseren henter nye filer når innholdet endres. HTML-en peker på de tilhørende versjonene for å unngå at gammel JavaScript kjøres mot oppdatert HTML.

## Navigasjon

| Handling                                         | Tast / kontroll                                 |
| ------------------------------------------------ | ----------------------------------------------- |
| Neste animasjonssteg, deretter neste slide       | `→`, `Space`, `Page Down` eller klikk på scenen |
| Forrige steg, deretter forrige slides siste steg | `←` eller `Page Up`                             |
| Første slide                                     | `Home`                                          |
| Siste slide, med kode synlig                     | `End`                                           |
| Start gjeldende slide på nytt                    | `R` eller ↻                                     |
| Slideoversikt                                    | `O` eller ▦                                     |
| Presentatørnotater                               | `N` eller N-knappen                             |
| Fullskjerm                                       | `F` eller ⛶                                     |
| Lukk notater / oversikt / fullskjerm             | `Escape`                                        |

Kontrollene nederst kan også brukes med mus eller tastatur. Klikk på kodekortet går ikke videre, slik at koden kan markeres.

Direktelenker bruker formatet `#slide/steg`, med slides fra 1 og steg fra 0. Eksempel: **http://localhost:4173/#8/4** åpner Redis-delen av OpenShift-sliden. Posisjonen beholdes ved oppfriskning.

Presentatørnotatene beskriver poeng, steg, anbefalt tid og faglige presiseringer for hver slide. **Notatdialogen åpnes på samme skjerm**, så bruk den ved innøving og lukk den før videre presentasjon.

## Innøving

- Gjennomfør gjerne først med `O` og `N` for å bli kjent med scener og faglige presiseringer.
- Ett trykk flytter til neste fortellersteg. Dataflytene går rolig i loop med en liten pause mellom rundene, slik at du kan forklare så lenge du vil. Forespørsler og svar deler rundetid og beholder rekkefølgen. Ingen slides går videre automatisk.
- Engangshendelser som pod-omstart og versjonsbytte spilles én gang og holder deretter tilstanden. Ved redusert bevegelse vises dataflytene uten loop.
- Du kan gå videre mens en animasjon pågår. Den gamle scenen fjernes, slik at animasjoner ikke blir liggende igjen.
- Hovedtemaene er bakgrunnsoppdatering, fingeravtrykk og single-flight. Bruk mest tid her.
- Siste slide leder til din egen live-demo. Demoen er ikke innebygd i presentasjonen.
- Alle trafikktall, diagrammer og datastrømmer er pedagogiske simuleringer, ikke målinger av bibliotekets ytelse.

## Utvikling og kontroll

```sh
pnpm check
pnpm format:check
pnpm build
```

Etter endring i TypeScript: kjør bygget på nytt og oppfrisk nettleseren. Serveren trenger ikke omstart ved endring av HTML, CSS eller ferdigbygd JavaScript.

Visningen skaleres samlet fra en 1600 × 900-scene til vinduet, med 16:9-format. Test primært ved 1920 × 1080 og 1280 × 720. Nettleserens innstilling for redusert bevegelse erstatter bevegelser med de samme slutt-tilstandene.

## Filer

- `index.html`: semantisk ramme, navigasjon og dialog.
- `style.css`: sceneuttrykk, diagramstil, animasjoner og redusert bevegelse.
- `src/main.ts`: slides, presentatørnotater, SVG-tegninger og deterministisk navigasjon.
- `server.mjs`: liten lokal server med eksplisitt liste over offentlige filer.
- `build.mjs`: pakker bare nettsidens filer til `site/` for publisering.
- `.github/workflows/pages.yml`: automatisk bygging og publisering på GitHub Pages.
- `kravspesifikasjon.md`: avtalt fortelling og akseptansekriterier.

Faglig grunnlag er `shared_library/utilities/caching/README.md` i det opprinnelige monorepoet og cachebibliotekets API. Presentasjonen inneholder pedagogiske simuleringer og kan kjøres uavhengig av biblioteket.
