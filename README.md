# TAB Marketing – webbplats

TAB Marketing drivs av Treatly AB. Byggd med TanStack Start, React och Tailwind. Körs på Vercel.

```sh
bun install
bun run dev
```

## Var saker finns

All text som återkommer på flera ställen har en enda källa:

| Fil                   | Innehåll                                                                   |
| --------------------- | -------------------------------------------------------------------------- |
| `src/lib/foretag.ts`  | Företagsuppgifter (namn, ort, kontakt, org.nr)                             |
| `src/lib/tjanster.ts` | De sex tjänsterna – startsida, `/tjanster`, tjänstesidor, sidfot, formulär |
| `src/lib/priser.ts`   | Alla priser och prisfrågor                                                 |
| `src/lib/projekt.ts`  | Tidigare projekt och marknadsföringsbilder                                 |
| `src/lib/guider.ts`   | Guiderna på `/guider` – text, datum och vanliga frågor                     |
| `src/lib/seo.ts`      | Metadata och strukturerad data (schema.org) för varje sida                 |
| `src/lib/sidor.ts`    | Sidlistan för `sitemap.xml` och `llms.txt`                                 |

Ändrar du ett pris eller en tjänst uppdateras sidorna, den strukturerade datan,
`sitemap.xml` och `llms.txt` automatiskt.

## SEO och GEO

- Varje sida sätter titel, beskrivning, canonical, delningsbild och JSON-LD via `sidhuvud()`.
- `/sitemap.xml`, `/robots.txt` och `/llms.txt` genereras av servern från samma data.
- Sajtens adress är `https://www.treatlymarketing.se` (konstanten `DOMAN` i `vite.config.ts`).
  Domänen utan www skickas vidare dit i Vercel. Byter ni håll i Vercel måste konstanten följa med.
  Alla byggen på Vercel använder den i canonical, sitemap och schema, så vercel.app-adressen
  räknas som en kopia. `SAJT_URL` överstyr vid behov.
- `robots.txt` släpper in alla sökmotorer och AI-tjänsternas robotar med namn.
- Guiderna får `Article`-schema och `lastmod` i sitemap från fältet `uppdaterad`.
  Uppdatera datumet när du ändrar en guide.

## Logga, ikoner och delningsbilder

Allt ligger i `public/` och är byggt från samma källa (ordmärket "Tab" och färgkortet).

| Fil                                         | Används till                                                |
| ------------------------------------------- | ----------------------------------------------------------- |
| `logo/tab-chip.svg`                         | Kortet i sidhuvud och sidfot (`Logo` i `Brand.tsx`)         |
| `favicon.ico`                               | Webbläsarflik: "Tab" i 16 (pixelritad), 32 och 48 px        |
| `favicon-96x96.png`                         | Google-sök (kräver en multipel av 48 px)                    |
| `apple-touch-icon.png`                      | iPhone/iPad hemskärm (180 px, utan transparens)             |
| `icon-192.png`, `icon-512.png`, `-maskable` | Android/PWA via `site.webmanifest`                          |
| `logo.png`                                  | Organisationens logga i den strukturerade datan             |
| `og.jpg`                                    | Standardbild när en sida delas (1200 × 630)                 |
| `og/guider/<slug>.jpg`                      | Guidens egen delningsbild, satt med `delningsbild` i guiden |

Byter ni favicon igen: be Google indexera om startsidan i Search Console, annars dröjer det
innan sökresultaten visar den nya.

### Koppla domänen (Strato → Vercel)

1. Vercel → projektet → Settings → Domains: lägg till `treatlymarketing.se` och
   `www.treatlymarketing.se`, och låt domänen utan www omdirigera till www.
2. Strato → DNS för domänen: lägg in exakt de A- och CNAME-poster som Vercel visar.
   **Behåll namnservrarna hos Strato och rör inte MX-posterna** – annars slutar mejlen
   till edvin@treatlymarketing.se att fungera.
3. Vänta tills Vercel visar Valid Configuration.

### Google Search Console och Bing Webmaster Tools

1. Lägg till egendomen i [Google Search Console](https://search.google.com/search-console)
   som typen **Domän** (`treatlymarketing.se`) och verifiera med TXT-posten Google visar,
   i Stratos DNS. Den täcker www, utan www, http och https på en gång.
2. Skicka in `https://treatlymarketing.se/sitemap.xml` under Webbplatskartor.
3. I [Bing Webmaster Tools](https://www.bing.com/webmasters) väljer du import från
   Google Search Console.

Går DNS inte att använda finns reservvägen URL-prefix med HTML-tagg: sätt koden som
`GOOGLE_SITE_VERIFICATION` (och `BING_SITE_VERIFICATION` för Bing) i Vercel och deploya om.

## Statistik, cookies och samtycke

- **Vercel Web Analytics** räknar besök utan cookies, så ingen cookiebanner behövs för den.
  Slå på under Analytics i Vercel.
- **Klickhändelser** (`src/lib/sparning.ts`): `boka_klick`, `bokning_skickad`,
  `tjanst_oppnad`, `projekt_klick` och `mejl_klick`. De syns i Vercel först på **Pro-planen**;
  på Hobby ignoreras de. Skicka aldrig namn, e-post eller fritext som händelsedata.
- **Spårverktyg som kräver samtycke** slås på med miljövariabler i Vercel:
  - `META_PIXEL_ID` – Meta-pixeln (marknadsföring). Skickar `Lead` när en bokning skickas.
  - `CLARITY_ID` – Microsoft Clarity (statistik: heatmaps och inspelningar).

  Är någon satt visas cookiebannern (`src/components/Samtycke.tsx`), länken
  Cookieinställningar i sidfoten och verktygen i integritetspolicyn. Inget laddas före ett ja.
  Lägger ni till ett verktyg frågar bannern alla besökare igen. Är ingen satt finns ingen banner.

## Bokningsformuläret

Formuläret på `/kontakt` skickar mejl via [Resend](https://resend.com). Sätt i Vercel
(Settings → Environment Variables):

- `RESEND_API_KEY` – API-nyckel från Resend
- `KONTAKT_TILL` – adressen som tar emot bokningarna
- `KONTAKT_FRAN` (valfri) – avsändare, t.ex. `TAB Marketing <bokning@treatlymarketing.se>`,
  när domänen är verifierad i Resend (Resend visar DNS-posterna som läggs in hos Strato)

Utan nyckeln visar formuläret ett felmeddelande i stället för att låtsas att det skickats.

Sök efter `TODO(TAB)` för det som ska fyllas i.
