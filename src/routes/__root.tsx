import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import bodoniUrl from "@fontsource-variable/bodoni-moda/files/bodoni-moda-latin-wght-normal.woff2?url";
import dmSansUrl from "@fontsource-variable/dm-sans/files/dm-sans-latin-wght-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Header } from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import { Samtycke } from "@/components/Samtycke";
import { Footer } from "@/components/Footer";
import { FORETAG, VERIFIERING } from "@/lib/foretag";
import { grundSchema, jsonLd } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-8xl text-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Sidan finns inte</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Sidan du letar efter finns inte eller har flyttats.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-base btn-dark">
            Till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Sidan kunde inte laddas
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Något gick fel hos oss. Prova att ladda om sidan eller gå till startsidan.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-base btn-dark"
          >
            Försök igen
          </button>
          <a href="/" className="btn-base btn-outline">
            Till startsidan
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Standardvärden – varje sida sätter egna via sidhuvud() i src/lib/seo.ts.
      { title: FORETAG.namn },
      { name: "description", content: FORETAG.beskrivning },
      { property: "og:site_name", content: FORETAG.namn },
      { name: "theme-color", content: "#ebeae6" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "sv_SE" },
      { name: "twitter:card", content: "summary_large_image" },
      // Bevisar för Google och Bing att sajten är vår (miljövariabler i Vercel).
      ...(VERIFIERING.google
        ? [{ name: "google-site-verification", content: VERIFIERING.google }]
        : []),
      ...(VERIFIERING.bing ? [{ name: "msvalidate.01", content: VERIFIERING.bing }] : []),
    ],
    links: [
      // Typsnitten förladdas så att texten inte byter typsnitt och knuffar layouten.
      { rel: "preload", href: bodoniUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      { rel: "preload", href: dmSansUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Ikoner: .ico med "Tab" i 16 (ritad pixel för pixel), 32 och 48 px – webbläsaren väljer
      // storlek efter skärmen. Ingen SVG-favicon: den skulle vinna och bli suddig i 16 px.
      // 96 px för Google (kräver en multipel av 48 px), apple-touch-icon för hemskärmen och
      // manifestet för Android.
      // ?v= tvingar webbläsare och Google att hämta ikonen på nytt. Höj den vid nästa byte.
      { rel: "icon", href: "/favicon.ico?v=tab2", sizes: "16x16 32x32 48x48" },
      { rel: "icon", href: "/favicon-96x96.png?v=tab2", type: "image/png", sizes: "96x96" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
    scripts: [jsonLd(grundSchema())],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="sv">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="innehall" className="flex-1 overflow-x-clip">
          {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
          <Outlet />
        </main>
        <Footer />
      </div>
      {/* Cookiefri besöksstatistik. Slås på under Analytics i Vercel. */}
      <Analytics />
      {/* Cookiebanner – visas bara när Meta-pixeln eller Clarity är påslagna. */}
      <Samtycke />
    </QueryClientProvider>
  );
}
