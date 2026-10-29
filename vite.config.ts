// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Sajtens publika adress, används i canonical-länkar, sitemap, delningsbilder och strukturerad
// data. Byggen på Vercel pekar alltid på den riktiga domänen – även förhandsversioner och
// vercel.app-adressen – så att Google bara indexerar en adress. SAJT_URL överstyr vid behov.
// Vercel skickar treatlymarketing.se vidare till www – canonical måste peka på samma adress.
const DOMAN = "https://www.treatlymarketing.se";
const sajtUrl =
  process.env["SAJT_URL"] ?? (process.env["VERCEL"] ? DOMAN : "http://localhost:3000");

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      __SAJT_URL__: JSON.stringify(sajtUrl.replace(/\/$/, "")),
      // Verifieringskoder för Google Search Console och Bing Webmaster Tools.
      // Sätts som miljövariabler i Vercel – se README.
      __VERIFIERING__: JSON.stringify({
        google: process.env["GOOGLE_SITE_VERIFICATION"] ?? "",
        bing: process.env["BING_SITE_VERIFICATION"] ?? "",
      }),
      // Spårverktyg som kräver samtycke. Tomt = avstängt och ingen cookiebanner. Se README.
      __SPARVERKTYG__: JSON.stringify({
        metaPixel: process.env["META_PIXEL_ID"] ?? "",
        clarity: process.env["CLARITY_ID"] ?? "",
      }),
    },
  },
});
