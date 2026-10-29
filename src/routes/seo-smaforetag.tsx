import { createFileRoute, redirect } from "@tanstack/react-router";

// Sammanslagen med /seo-byra (samma sökavsikt – två sidor konkurrerade om samma sökningar).
// Checklistan för småföretag finns som guide: /guider/seo-for-smaforetag.
export const Route = createFileRoute("/seo-smaforetag")({
  beforeLoad: () => {
    throw redirect({ href: "/seo-byra", statusCode: 301 });
  },
});
