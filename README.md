# Guide Mallorca – webbplats

En guide till Palma de Mallorca. Byggd med TanStack Start, React och Tailwind (samma stomme som
TMAB). Körs på Vercel.

```sh
bun install
bun run dev
```

## Var saker finns

| Fil                                 | Innehåll                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| `src/routes/index.tsx`              | Startsidan: drönarflygningen och den svarta sidan innanför     |
| `src/components/Dronarflygning.tsx` | Scenen för flygningen (bild, canvas, rubrik, scroll-ledtråd)    |
| `src/lib/dronarflygning.ts`         | Kameran: zoom, övertoning mellan bilderna, dyket in i entrén    |
| `public/flight/`                    | Översiktsbilden (bild 2) och närbilden av katedralen (bild 1)   |
| `src/lib/foretag.ts`                | Sajtens namn och beskrivning                                   |
| `src/lib/seo.ts`                    | Metadata och strukturerad data för varje sida                  |
| `src/lib/sidor.ts`                  | Sidlistan för `sitemap.xml`                                    |

## Drönarflygningen

- Flygningens längd styrs av `height` på `.flight` i `src/styles.css` (620vh). Mer höjd ger en
  lugnare flygning.
- Byter du bilderna måste portalens koordinater i `src/lib/dronarflygning.ts` mätas om
  (`PORTAL_OVERSIKT`, `PORTAL_NARBILD`, `DORR_NARBILD`, `MATCH`).
- Närbilden är 1672 px bred. En högupplöst närbild av entrén gör sista biten in skarpare.

## Adress och SEO

- Canonical, sitemap och schema använder Vercels produktionsadress (`VERCEL_PROJECT_PRODUCTION_URL`).
  Byt `DOMAN` i `vite.config.ts` när en egen domän kopplas. `SAJT_URL` överstyr vid behov.
- `GOOGLE_SITE_VERIFICATION` och `BING_SITE_VERIFICATION` kan sättas som miljövariabler i Vercel.
