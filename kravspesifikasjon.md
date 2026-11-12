# Kravspesifikasjon: presentasjon av felles cacheløsning

## 1. Formål og målgruppe

Presentasjonen skal gjøre det attraktivt og enkelt å ta i bruk felles cacheløsning i `shared_library/utilities/caching`.

Primært budskap publikum skal sitte igjen med:

> Dette vil jeg ta i bruk i min tjeneste.

Målgruppen er omtrent 70 % utviklere og 30 % designere og ikke-tekniske deltakere. Forklaringene skal fungere uten forkunnskaper om caching, samtidig som utviklerne får forståelse av de viktigste egenskapene.

Presentasjonen skal vare omtrent **10 minutter**, etterfulgt av en separat live-demo. Den skal prioritere konsumentens gevinster fremfor interne implementasjonsdetaljer.

## 2. Leveranse og avgrensning

- En frittstående presentasjon med HTML, CSS og TypeScript i et eget repository, `caching-presentasjon`. Presentasjonen ble opprinnelig utviklet i en mappe med samme navn i monorepoet.
- Denne filen beskriver kravene til implementeringen.
- Presentasjonen skal kunne kjøres lokalt uten backend, Redis, OpenShift eller andre eksterne tjenester.
- Alle dataflyter skal være pedagogiske simuleringer, med deterministiske animasjoner.
- Nødvendige oppstarts- og byggekommandoer skal dokumenteres i mappens README ved implementering.
- Sluttleveransen skal inneholde en nettleserkjørbar versjon av TypeScript-koden gjennom et enkelt lokalt bygge-/serveroppsett. Nettleseren skal ikke forventes å kjøre TypeScript direkte.
- Biblioteket og andre applikasjoner i repoet skal ikke måtte endres for å kjøre presentasjonen.
- Ingen nettverksavhengige fonter, bilder, CDN-skript eller andre eksterne ressurser ved visning.

## 3. Fortelling og pedagogiske prinsipper

Fortellingen skal følge denne buen:

1. Gjentatte kall gir venting og unødvendig arbeid.
2. Gjenbruk av data gir raskere svar og mindre avhengighet av datakilden.
3. Fellesløsningen håndterer oppdatering, ferskhetskontroll og samtidighet.
4. Den passer ulike driftsbehov og alle arkitekturlag.
5. Konsumenten får beskyttelse og observability med på kjøpet.
6. Et kort kodeeksempel leder direkte til live-demoen.

Gjennomgående eksempel er **å hente dokumentlisten for en sak**, med cache-nøkkelen `dokumentliste:<sakId>`. Én gjenkjennelig dokumentliste beveger seg mellom bruker, tjeneste, cache og datakilde. Ulike versjoner kan merkes «v1» og «v2».

På slide 7–8 brukes **listen over domstoler** som eksempel på single-flight og deling mellom podder.

Krav til formidlingen:

- Én hovedidé per slide.
- Tegninger og bevegelse skal bære forklaringen.
- Ingen avsnitt eller vanlige punktlister på lerretet.
- Normalt én kort overskrift og noen få etiketter per slide.
- Tekniske ord skal støttes av et synlig eksempel før eller samtidig som de introduseres.
- Ingen kode på slide 1–11. Den eneste kodesnutten skal være på siste slide.
- Tall som illustrerer trafikk eller tid skal fremstå som eksempler, ikke som målte ytelsesløfter.
- Bakgrunnsoppdatering, fingeravtrykk og single-flight skal ha størst faglig vekt.
- Korte presentatørnotater skal beskrive hovedpoeng og animasjonssteg uten å vises på publikumsskjermen.

## 4. Slideplan

Tidene er veiledende og summerer til 10 minutter. Presentatøren styrer fremdriften; ingen automatisk overgang mellom slides.

| Nr. | Tittel                            | Tid    |
| --- | --------------------------------- | ------ |
| 1   | Hvorfor hente det samme om igjen? | 35 sek |
| 2   | Hent én gang. Gjenbruk.           | 40 sek |
| 3   | Datakilden nede. Fortsatt svar.   | 35 sek |
| 4   | Svar nå. Oppdater i bakgrunnen.   | 60 sek |
| 5   | Du bestemmer ferskheten.          | 40 sek |
| 6   | Er noe egentlig endret?           | 60 sek |
| 7   | Mange spør. Én henter.            | 55 sek |
| 8   | Lokalt eller delt i OpenShift.    | 65 sek |
| 9   | Cache der du trenger den.         | 30 sek |
| 10  | Sikkerhet følger med.             | 25 sek |
| 11  | Innsikt følger med.               | 25 sek |
| 12  | Klar til bruk.                    | 35 sek |

### Slide 1 — Hvorfor hente det samme om igjen?

**Mål:** Etablere problemet før løsningen introduseres.

**Tegning:** Brukere til venstre, tjenesten i midten, datakilden til høyre. Gjentatte forespørsler gjelder dokumentlisten for samme sak.

**Animasjonssteg:**

1. Én forespørsel går gjennom tjenesten til datakilden og returnerer dokumentlisten. Ventingen er synlig.
2. Flere brukere ber om dokumentlisten for samme sak. Alle forespørslene tar den samme lange veien.
3. Datakilden får en synlig kø, mens identiske dokumentlister returneres flere ganger.

**Synlig tekst:** Tittel og etikettene «Brukere», «Tjeneste», «Datakilde».

**Muntlig poeng:** Vi bruker tid og kapasitet på å hente data vi nettopp har hentet.

### Slide 2 — Hent én gang. Gjenbruk.

**Mål:** Forklare caching uten å kreve teknisk forkunnskap.

**Tegning:** Viderefør samme diagram. En cache dukker opp som del av tjenestens dataflyt.

**Animasjonssteg:**

1. Første forespørsel finner en tom cache og henter dokumentlisten fra kilden.
2. Dokumentlisten lagres i cachen og leveres til brukeren.
3. Nye forespørsler får samme dokumentliste via en kort returvei, uten nye kildekall.
4. En enkel illustrativ teller synliggjør forskjellen mellom antall forespørsler og antall kildekall.

**Synlig tekst:** Tittel, «Cache» og korte gevinstetiketter: «Raskere svar» og «Mindre belastning».

**Muntlig poeng:** Første oppslag gjør arbeidet. De neste kan gjenbruke resultatet.

### Slide 3 — Datakilden nede. Fortsatt svar.

**Mål:** Vise mindre avhengighet av oppetiden til andre tjenester.

**Tegning:** Samme dataflyt, med en allerede lagret, gyldig dokumentliste i cachen.

**Animasjonssteg:**

1. Datakilden går fra tilgjengelig til utilgjengelig. Forbindelsen til kilden brytes visuelt.
2. Flere forespørsler kommer inn og besvares fra cachen.
3. Svaret når brukerne mens datakilden fortsatt er markert som nede.

**Synlig tekst:** Tittel og en liten etikett «Gyldige cachedata» ved cachen.

**Muntlig poeng:** Vi trenger ikke at datakilden er tilgjengelig ved hvert eneste oppslag.

**Faglig avgrensning:** Scenen skal bruke en verdi innenfor gjeldende gyldighetsgrenser. Den skal ikke fremstille cachen som en ubegrenset reservekopi. Det er ikke nødvendig å forklare bakgrunnsoppdatering eller feilmekanismer her.

### Slide 4 — Svar nå. Oppdater i bakgrunnen.

**Mål:** Forklare den viktigste oppdateringsgevinsten.

**Tegning:** Cachen inneholder «v1». To klart adskilte spor viser svar til brukeren og arbeid mot datakilden.

**Animasjonssteg:**

1. En forespørsel kommer etter at verdien kan oppdateres.
2. «v1» leveres straks til brukeren.
3. Samtidig går en oppdatering mot datakilden i det andre sporet.
4. «v2» kommer tilbake og erstatter «v1» i cachen.
5. Neste forespørsel får «v2».

**Synlig tekst:** Tittel, «Svar» og «Oppdatering».

**Muntlig poeng:** Brukeren slipper å vente på oppdateringen når den lagrede verdien fortsatt kan brukes.

**Faglig krav:** Oppdateringen startes av et oppslag. Animasjonen skal ikke antyde en timer som selv starter periodiske kildekall.

### Slide 5 — Du bestemmer ferskheten.

**Mål:** Gjøre skillet mellom bakgrunnsoppdatering og absolutt utløp forståelig.

**Tegning:** En tidslinje med tre soner: «Fersk», «Kan oppdateres» og «Utløpt».

**Animasjonssteg:**

1. Et oppslag i fersk sone gir umiddelbart svar.
2. Et oppslag etter oppdateringsgrensen gir svar og kan starte oppdatering.
3. Et oppslag etter utløp må vente på ny lasting.

**Synlig tekst:** Tittel, de tre sonene og små markører for «Oppdateringsgrense» og «Utløp».

**Muntlig poeng:** Konsumenten velger hvor lenge data kan gjenbrukes og når ny lasting er nødvendig. Innstillingene kan tilpasses tjenesten og overstyres per oppslag.

**Faglig avgrensning:** Vis først modellen uten valgfritt fingeravtrykk. Ekstra kontrollgrense introduseres på neste slide. Ikke bruk skjermplassen på konfigurasjonsnavn eller standardverdier.

### Slide 6 — Er noe egentlig endret?

**Mål:** Vise verdien av en billig ferskhetskontroll fremfor å hente hele resultatet på nytt.

**Tegning:** En stor dokumentliste og et lite fingeravtrykk i form av sist oppdatert-tidspunkt. Vis kun klokkeslett for enkelhets skyld: `10:32 = 10:32` ved uendret tidspunkt og `10:32 ≠ 10:47` ved endring. Datoen utelates i illustrasjonen, ikke i en reell implementasjon. Størrelsesforskjellen er en pedagogisk metafor, ikke et målt størrelsesforhold.

**Animasjonssteg:**

1. Vis at en oppdatering kan starte med å hente bare et lite fingeravtrykk.
2. Sammenlign kildens fingeravtrykk med det lagrede: De er like.
3. Behold dokumentlisten og forny gyldigheten uten å hente payloaden.
4. Gjenta med et endret fingeravtrykk: Nå hentes en ny dokumentliste.
5. Vis kort at konsumenten også kan sette en grense der neste oppslag må vente på kontrollen.

**Synlig tekst:** Tittel, «Uendret» og «Endret», vist i hvert sitt steg.

**Muntlig poeng:** Når kilden tilbyr en rimelig versjonssjekk, kan vi kontrollere ferskhet uten å hente alt på nytt. Dette er valgfritt.

**Faglige krav:** En vellykket uendret kontroll fornyer oppføringen og starter gyldighetstidene på nytt. Fingeravtrykket må endres når relevante data endres. Det er konsumenten som tilbyr kontrollfunksjonen; biblioteket oppdager ikke selv endringer i datakilden.

### Slide 7 — Mange spør. Én henter.

**Mål:** Forklare single-flight med et konkret visuelt eksempel.

**Tegning:** Mange samtidige forespørsler etter samme liste over domstoler, en tom cache og én datakilde.

**Animasjonssteg:**

1. En gruppe forespørsler treffer samtidig mens verdien mangler.
2. Én forespørsel får hente fra kilden. De andre samles i en synlig ventegruppe.
3. Én domstolliste kommer tilbake og lagres.
4. Alle ventende forespørsler får resultatet.

**Synlig tekst:** Tittel og eventuelt «Single-flight» som sekundær etikett etter at mekanismen er vist.

**Muntlig poeng:** Mange samtidige behov skal ikke bli mange identiske lastinger. Samordningen gjelder per nøkkel.

**Faglig krav:** Bruk en cachebom i eksempelet slik at ventingen er riktig fremstilt. Ved brukbar cacheverdi kan andre kall få den lagrede verdien mens oppdatering pågår. Redis kan samordne på tvers av podder; lokal cache samordner ikke uavhengige podder.

### Slide 8 — Lokalt eller delt i OpenShift.

**Mål:** Gjøre forskjellen mellom Caffeine og Redis konkret i et miljø med flere podder.

**Tegning:** En tydelig ramme merket «OpenShift» inneholder tre podder av samme tjeneste. Brukere sender forespørsler etter listen over domstoler, som kan håndteres av ulike podder. Datakilden vises utenfor tjenesten. Redis tegnes som et separat, delt lager utenfor applikasjonspoddene.

**Animasjonssteg — Caffeine:**

1. Hver pod får sin egen lokale cache.
2. Pod A henter og lagrer domstollisten. Pod B har fortsatt tom cache og må hente selv.
3. Pod A starter på nytt. Den lokale cachen forsvinner, og neste oppslag må hente igjen.

**Animasjonssteg — Redis:** 4. Bytt til ett delt Redis-lager. Behold samme podplasseringer for enkel sammenligning. 5. Pod A fyller cachen. Pod B og C gjenbruker samme verdi. 6. Pod A starter på nytt og leser den fortsatt lagrede verdien fra Redis. 7. Vis kort at samtidige lastinger fra flere podder kan samordnes til ett kildekall.

**Synlig tekst:** Tittel, «Caffeine · lokalt» og «Redis · delt», én modus om gangen.

**Muntlig poeng:** Velg lokal cache når hver pod kan ha sin egen kopi. Velg Redis når podder skal dele verdier og samordning. Konsumenten bruker samme cache-API.

**Faglige krav:** Applikasjonspodden henter fra datakilden og skriver til Redis. Redis har ingen direkte forbindelse til datakilden. Animasjonen skal vise denne rekkefølgen før de andre poddene gjenbruker resultatet. Omstarten gjelder en applikasjonspod, ikke Redis. Scenen skal ikke love at data overlever ethvert Redis-bortfall. Podder som deler cache forutsettes å bruke kompatibel felles konfigurasjon. Ikke tegn løsningen som automatisk kombinert lokalcache og Redis-cache.

### Slide 9 — Cache der du trenger den.

**Mål:** Vise raskt at caching kan brukes i alle arkitekturlag, også for domenedata.

**Tegning:** En vertikal, forenklet arkitektur med «Application», «Manager», «Engine», «Access» og «Resource». Datakilden vises nederst. Cachefunksjonalitet illustreres ved siden av lagene, ikke som et obligatorisk nytt lag.

**Animasjonssteg:**

1. Fremhev Resource som et kjent sted å cache rådata fra eksterne tjenester.
2. Fremhev Manager, Engine og Access grønt, med en gjenkjennelig domenegjenstand eller et beregnet resultat. Access returnerer domenemodeller; Resource håndterer rådata og klienter.
3. Marker at løsningen kan brukes fra alle lagene.

**Synlig tekst:** Tittel, lagnavn og eventuelt «Også domenedata».

**Muntlig poeng:** Dette er ikke bare en cache rundt eksterne kall. Laget som trenger gjenbruk, kan bruke løsningen, også med egne Kotlin-dataklasser uten cacheannotasjoner.

**Faglig krav:** Figuren viser mulige brukssteder, ikke en anbefaling om å cache samme data i alle lag samtidig. Den skal ikke vise én global, delt instans som et arkitekturkrav.

### Slide 10 — Sikkerhet følger med.

**Mål:** Gi et svært overfladisk, visuelt inntrykk av automatisk hashing og kryptering.

**Tegning:** En lesbar nøkkel går gjennom et skjold og blir en ugjenkjennelig nøkkel. En dokumentliste låses før den legges i Redis.

**Animasjonssteg:**

1. Den lesbare nøkkelen omformes til en hash.
2. Redis-verdien vises som låst, uleselig innhold.

**Synlig tekst:** Tittel, «Nøkler hashes» og «Redis-verdier krypteres».

**Muntlig poeng:** Dette håndteres automatisk av fellesløsningen.

**Faglig krav:** Ikke fremstille hashing som reversibel kryptering, og ikke antyde at Caffeine-verdier krypteres. Ingen algoritmenavn, nøkkelavledning eller kryptografiske detaljer på lerretet. Brukerisolering er ikke et eget tema i denne korte sliden.

### Slide 11 — Innsikt følger med.

**Mål:** Vise at konsumenten får standardiserte metrikker og logger.

**Tegning:** Et stilisert, lite dashboard ved siden av den kjente dataflyten.

**Animasjonssteg:**

1. Et cachetreff tenner en treffindikator.
2. En lasting og en oppdatering gir tilsvarende utslag.
3. En illustrert feil tenner en feilindikator og en liten logghendelse.

**Synlig tekst:** Tittel og «Treff», «Lasting», «Oppdatering», «Feil».

**Muntlig poeng:** Vi får innsikt i hvordan cachen oppfører seg, med standardiserte metrikker og logger.

**Faglig krav:** Dashboardet er en illustrasjon av tilgjengelige signaler, ikke et ferdig dashboard biblioteket leverer. Ikke bruk oppdiktede produksjonsmålinger.

### Slide 12 — Klar til bruk.

**Mål:** Gjøre terskelen for å ta løsningen i bruk lav og lede videre til live-demo.

**Tegning:** Et stort, lesbart kodekort. Dette er presentasjonens eneste kodeeksempel.

```kotlin
val dokumentliste: List<Dokument> = caching.getOrRefresh(
    key = "dokumentliste:$sakId",
    operationName = "hentDokumentliste",
    loader = { dokumentAccess.hentDokumentliste(sakId) },
)
```

**Animasjonssteg:**

1. Vis hele det korte eksempelet samlet.
2. Fremhev nøkkelen og deretter hentefunksjonen uten å flytte koden.
3. Vis en diskret avslutning: «La oss prøve.»

**Muntlig poeng:** Dette er bruken når cacheinstansen er satt opp. Nå går vi til live-demoen.

**Faglige krav:** Kodeeksempelet skal kontrolleres mot gjeldende API ved implementering. Det forutsetter en opprettet `caching`-instans og et resultat som kan deles i applikasjonen. Brukeravhengige resultater må isoleres i reell bruk. Instansiering, miljøvariabler og øvrig oppsett forklares eventuelt i live-demoen.

## 5. Visuell retning

- **Mørk og scenepreget:** Dyp mørk bakgrunn, tydelige figurer og lysende datastrømmer.
- Et gjennomarbeidet visuelt uttrykk med stor typografi, mye luft og få aksentfarger.
- Diagrammene skal dominere skjermflaten; dette skal ikke ligne en dokumentasjonsside.
- Bruk konsekvente former og farger for bruker, tjeneste, cache, datakilde og payload.
- Samme dokumentliste og versjonsmarkører skal være gjenkjennelige gjennom hele fortellingen.
- Forslag til fargesemantikk: cyan for forespørsler, grønn for svar/brukbare data, fiolett for oppdatering og varm rød for feil eller utilgjengelighet.
- Farge skal alltid støttes av form, etikett, symbol eller bevegelse.
- Glød og dybde skal understøtte lesbarheten, uten å vaske ut linjer eller tekst på projektor.
- SVG og CSS-baserte figurer foretrekkes for skarpe, skalerbare diagrammer.
- Ingen dekorative stockbilder eller emojier som primære illustrasjoner.
- Normalvisningen skal prioritere selve scenen. Navigasjon og slideindikator skal være diskrete.

## 6. Animasjon og regi

- Hver slide skal ha en tydelig starttilstand og et lite antall meningsfulle steg.
- Presentatørstyrte steg skal normalt være ferdige innen omtrent 1–3 sekunder.
- Små overganger og fremhevinger bør ta omtrent 200–600 ms.
- En rolig strøm eller ventepuls kan fortsette mellom steg når den formidler en pågående tilstand.
- Unngå kontinuerlig bevegelse som konkurrerer med presentatørens forklaring.
- Forespørsel og svar må skilles visuelt med retning og uttrykk.
- Samtidighet skal vises gjennom overlappende bevegelser, ikke bare beskrives med tekst.
- Figurer bør beholde plassering mellom beslektede scener slik at publikum slipper å orientere seg på nytt.
- Kameraeffekter, zoom og partikler skal brukes sparsomt. Ingen blinkende eller strobende effekter.
- Alle relevante tilstandsendringer skal være forståelige også uten animasjonen.

## 7. Navigasjon og tilstandsmodell

- `Pil høyre`, `Space` og `Page Down`: neste animasjonssteg, deretter neste slide.
- `Pil venstre` og `Page Up`: forrige steg; fra første steg går man til forrige slides siste steg.
- Klikk på hovedscenen: samme handling som neste steg.
- Diskrete, klikkbare knapper for fremover og bakover skal være tilgjengelige.
- `Home`: første slide i starttilstand. `End`: siste slide med kodeeksempelet synlig.
- En synlig fullskjermknapp skal kunne aktivere nettleserens fullskjermmodus. `Escape` skal beholde normal funksjon for å forlate fullskjerm.
- Klikk på kontroller, lenker eller kodekort skal ikke utilsiktet gå videre.
- Tilbakenavigasjon skal gjenopprette den tilstanden brukeren forventer, ikke starte tilfeldige eller parallelle animasjoner.
- Raske gjentatte tastetrykk skal håndteres kontrollert uten overlappende tidslinjer eller korrupte scener.
- Når en slide forlates, skal dens animasjoner og tidsstyrte jobber stoppes eller ryddes opp.
- Det skal finnes en enkel måte å starte gjeldende slide på nytt, for eksempel `R` og en diskret kontroll.
- Gjeldende slide skal kunne åpnes direkte via URL-fragment, slik at innøving og gjenopptakelse er enkelt.
- Navigasjonen skal være dokumentert kort i README, ikke kreve en egen instruksjonsslide.

## 8. Tilgjengelighet og visningsforhold

- Primærformat er 16:9 på storskjerm eller projektor, med 1920 × 1080 som referanse.
- Presentasjonen skal også fungere i et vanlig laptopvindu på omtrent 1280 × 720 uten klipping.
- Scenen skal skalere samlet eller omdisponeres kontrollert; diagrammer skal ikke falle fra hverandre ved vindusendring.
- Ingen rulling i normal presentasjonsvisning.
- Høy kontrast og lesbare etiketter også fra bakerst i et møterom.
- All funksjonalitet skal kunne betjenes med tastatur, med synlig fokus på kontroller.
- Kontroller skal ha forståelige tilgjengelige navn. Aktiv slide skal ha en semantisk overskrift.
- Ikke-aktive slides skal ikke fylle tilgjengelighetstreet eller kunne få tastaturfokus.
- Ved `prefers-reduced-motion` skal lange forflytninger og kontinuerlige bevegelser erstattes av rolige tilstandsskifter. Hele forklaringen og navigasjonen skal fortsatt fungere.
- Alt publikumsrettet språk og alle presentatørnotater skal være på norsk. Etablerte teknologinavn og arkitekturlagnavn kan beholdes.

## 9. Faglig kvalitetssikring

Faglig kilde er `shared_library/utilities/caching/README.md` og gjeldende implementasjon. Ved avvik skal presentasjonen justeres til bibliotekets faktiske oppførsel.

Følgende presiseringer skal ivaretas i illustrasjoner og notater:

- Cachen reduserer behovet for datakilden, men garanterer ikke svar ved cachebom, utløp eller nødvendig kontroll når kilden feiler.
- Oppslag utløser eventuell bakgrunnsoppdatering; løsningen beskrives ikke som en periodisk synkroniseringsjobb.
- Fingeravtrykk er valgfritt. Uten kontrollfunksjonen hentes payloaden på nytt ved oppdatering.
- Gyldighetstidene regnes fra siste lasting eller vellykkede fingeravtrykkskontroll.
- Single-flight gjelder samme nøkkel, ikke alle operasjoner samlet.
- Caffeine er lokal per pod. Redis deler data og samordning mellom riktig konfigurerte podder.
- Redis og Caffeine er alternative lagringsteknologier i denne fremstillingen, ikke automatisk et tonivåoppsett.
- Hashing av nøkler og kryptering av Redis-verdier er forskjellige mekanismer.
- Caching kan brukes i alle arkitekturlag og håndtere domenets dataklasser uten cacheannotasjoner.
- Simulerte trafikktall og animasjonshastigheter er pedagogiske, ikke benchmarkresultater.

## 10. Akseptansekriterier for implementeringen

1. Alle 12 slides er implementert i angitt rekkefølge med de beskrevne hovedpoengene.
2. Presentasjonen kan gjennomføres på omtrent 10 minutter uten at animasjonene tvinger frem lange ventepauser.
3. Slide 1–11 inneholder ingen kode. Slide 12 viser ett kort, API-riktig `getOrRefresh`-eksempel.
4. Cachebom, cachetreff, bakgrunnsoppdatering, uendret/endret fingeravtrykk og single-flight kan forstås gjennom figurene og bevegelsen.
5. En egen scene viser at gyldige cachedata kan besvare oppslag mens datakilden er nede.
6. OpenShift-scenen viser minst tre applikasjonspodder, separate lokale cacher, delt Redis og omstart av en applikasjonspod.
7. En egen kort slide viser at løsningen kan brukes i alle arkitekturlagene.
8. Hashing og Redis-kryptering vises kort og korrekt, uten teknisk fordypning.
9. Tastatur- og musenavigasjon fungerer gjennom hele presentasjonen, også bakover og ved gjentatt avspilling.
10. Ingen animasjoner fortsetter utilsiktet etter at en slide er forlatt.
11. Presentasjonen har ingen runtime-feil i nettleserkonsollen under en full gjennomgang.
12. Layout og lesbarhet er kontrollert ved både 1920 × 1080 og 1280 × 720.
13. Redusert bevegelse er kontrollert, og alle vesentlige forklaringer beholdes.
14. Presentasjonen kan vises uten eksterne nettverksressurser etter lokalt oppsett.
15. README beskriver oppstart, bygging og navigasjon. Korte presentatørnotater følger hver slide.

## 11. Bevisste prioriteringer

- Invalidering, detaljert konfigurasjon, brukerisolering og kryptografiske algoritmer får ikke egne slides i denne ti-minuttersfortellingen.
- Dataklasser og automatisk serialisering omtales kort på arkitektursliden.
- Oppsett og eventuell utdyping av API-et passer i den etterfølgende live-demoen.
- Presentasjonen avsluttes med kodeeksempelet og en direkte overgang til live-demo, fremfor en ekstra oppsummeringsslide.
