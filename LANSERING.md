# Checklista inför lansering – Shoot for the Moon

Sajten är ett **utkast**. Allt nedan är exempel eller platshållare som måste bytas eller
bekräftas innan sajten går live på shootforthemoon.se. Sök i koden efter `exempel: true`,
`EXEMPEL` och `platshallare` för att hitta allt.

## 1. Exempelinnehåll som ska bytas

| Vad | Var | Vad som behövs från Caroline |
| --- | --- | --- |
| **Evenemangen i kalendern** (5 st, påhittade titlar, datum, tider, priser, platser och antal platser) | `src/lib/innehall.ts` → `AKTIVITETER` | Riktiga evenemang: titel, datum, tid, längd, lokal, pris, språk, antal platser, kort text, bild |
| **Citaten** (Anna L., Peter S., Karin B. är påhittade) | `src/lib/innehall.ts` → `CITAT` | Riktiga omdömen **med personens tillåtelse** att publicera namn |
| **Teman** för Stand Up History, film och museum ("Teman meddelas") | `src/lib/sprak.ts` → `erbjudanden.lista[].teman` | Lista med teman, filmer och museer |
| **Vanliga frågor** (svaren är platshållare: "Svaret fylls i före lansering.") | `src/lib/sprak.ts` → `fragor` | Svar på alla fem frågorna. Lägg därefter gärna till FAQ-schema i `seo.ts` |
| **Om Caroline** och **TV och dokumentär** | `src/lib/sprak.ts` → `om`, `tv` | Bekräfta att uppgifterna stämmer i dag (Filmlance, Nordic Noir m.m.) |
| **Engelska och spanska översättningar** | `src/lib/sprak.ts`, `evenemangtexter.ts`, `innehall.ts` | Låt Caroline eller någon med språket läsa igenom |

När alla `exempel: true` är borta försvinner exempel-etiketterna och utkast-rutan i kalendern
av sig själva.

## 2. Funktioner som måste kopplas in

- [ ] **E-post för anmälningar och kontaktformuläret.** Inga miljövariabler är satta i Vercel
      i dag, så *ingenting skickas*. Sätt i Vercel → Settings → Environment Variables:
      `RESEND_API_KEY`, `KONTAKT_TILL` (Carolines adress) och `KONTAKT_FRAN`
      (t.ex. `Shoot for the Moon <hej@shootforthemoon.se>`, kräver att domänen verifieras i Resend).
- [ ] **Testa en riktig anmälan** när e-posten är kopplad. Exempel-evenemang skickar
      medvetet ingenting (de visar en utkast-bekräftelse), så testa med ett riktigt evenemang.
- [ ] **Platser kvar** räknas inte ner automatiskt. Antingen uppdaterar Caroline `platserKvar`
      själv, eller så bygger vi ett CMS/en databas (se punkt 4).
- [ ] **Betalning**: i dag skickar Caroline betalningsinformation i bekräftelsen. Beslut: fortsätta
      så, eller koppla Stripe/Swish-betalning direkt vid anmälan.

## 3. Juridik och domän

- [ ] **Bolagsnamn och adress i integritetspolicyn** (`src/lib/integritet.ts`). Org.nr 556931-6606 är
      inlagt, men det exakta registrerade namnet (t.ex. "Shoot for the Moon AB"?) och postadressen
      saknas. Bekräfta med Caroline och lägg till i policyn och sidfoten.
- [ ] **Lagringstiden 24 månader** i integritetspolicyn är ett förslag. Caroline ska godkänna den.
- [ ] **Händelsedata för Google (schema.org/Event)**: lägg till när evenemangen är riktiga, så att
      de kan visas med datum direkt i Googles sökresultat. Får inte läggas till för exempel-evenemang.
      (Påminnelse inlagd 6 nov.)

- [x] Integritetspolicy på /integritet, /privacy och /privacidad, länkad vid alla formulär och i sidfoten.
- [ ] **Rundvandringen med kartan** visar rutten publikt. Caroline har sagt att hon inte kan visa
      rutten. Beslut krävs: ta bort kartan, eller få hennes uttryckliga ja.
- [ ] Inga tankstreck (– eller —) i texterna; skriv om med kommatecken, kolon eller punkt.
- [ ] Ordet "guide" ska inte förekomma någonstans (kontrollerat i utkastet, kontrollera igen efter
      nya texter).
- [ ] **Domän**: koppla shootforthemoon.se i Vercel och byt `DOMAN` i `vite.config.ts`.
      Den gamla sajten (tv-produktionsbolaget) ersätts – säkerställ att Caroline vill det.
- [ ] **Delningsbilden** (`public/og.jpg`): kör länken genom Facebooks Sharing Debugger efter
      lansering så att den gamla bilden ("Guidad rundvandring") inte ligger kvar i cachen.

## 4. Efter lansering

- [ ] **Bloggen/anteckningarna togs bort ur utkastet** (okt 2026). Caroline bad i sitt första mejl om
      ett sätt att blogga med bild och kommentar. Bestäm med henne: egen blogg via CMS, eller
      Instagram-flöde på sajten.

- [ ] CMS så att Caroline själv kan lägga in evenemang, inlägg och citat utan oss.
- [x] Instagram-länk (sidfoten och Om mig).
- [ ] Nyhetsbrev: beslut tas vecka 45 (påminnelse inlagd).
- [ ] Lista evenemangen i lokala kalendrar (The Calendar Mallorca, Majorca Daily Bulletin).

## Bilder

Riktiga bilder från tidigare kvällar ligger i `public/evenemang/` (från Caroline, okt 2026).
Fler bilder per evenemangstyp – särskilt film och museum – behövs.
