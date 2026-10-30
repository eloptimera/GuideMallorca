import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import cormorantUrl from "@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Analytics } from "@vercel/analytics/react";
import { FORETAG, VERIFIERING } from "@/lib/foretag";
import { SPRAKKOD, sprakFor } from "@/lib/sprak";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-8xl">404</h1>
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
      { name: "theme-color", content: "#0593c6" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      // Bevisar för Google och Bing att sajten är vår (miljövariabler i Vercel).
      ...(VERIFIERING.google
        ? [{ name: "google-site-verification", content: VERIFIERING.google }]
        : []),
      ...(VERIFIERING.bing ? [{ name: "msvalidate.01", content: VERIFIERING.bing }] : []),
    ],
    links: [
      // Typsnitten förladdas så att texten inte byter typsnitt och knuffar layouten.
      {
        rel: "preload",
        href: cormorantUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.ico?v=2", sizes: "16x16 32x32 48x48" },
      { rel: "icon", type: "image/png", href: "/icon-192.png?v=2", sizes: "192x192" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png?v=2" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  const sokvag = useRouterState({ select: (s) => s.location.pathname });
  return (
    <html lang={SPRAKKOD[sprakFor(sokvag)].html}>
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
      <main id="innehall">
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </main>
      {/* Cookiefri besöksstatistik. Slås på under Analytics i Vercel. */}
      <Analytics />
    </QueryClientProvider>
  );
}
