// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Sajtens publika adress, används i canonical-länkar, sitemap, delningsbilder och strukturerad
// data. På Vercel används projektets produktionsadress även i förhandsversioner, så att Google
// bara indexerar en adress. Byt DOMAN när en egen domän kopplas. SAJT_URL överstyr vid behov.
const DOMAN = process.env["VERCEL_PROJECT_PRODUCTION_URL"]
  ? `https://${process.env["VERCEL_PROJECT_PRODUCTION_URL"]}`
  : "https://guidemallorca-dun.vercel.app";
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
    },
  },
});
