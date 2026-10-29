import { createFileRoute } from "@tanstack/react-router";
import { absolut } from "@/lib/foretag";
import { SIDOR, textSvar } from "@/lib/sidor";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        textSvar(
          [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
            ...SIDOR.map(
              (s) =>
                `  <url><loc>${absolut(s.sokvag)}</loc>${s.andrad ? `<lastmod>${s.andrad}</lastmod>` : ""}</url>`,
            ),
            "</urlset>",
            "",
          ].join("\n"),
          "application/xml",
        ),
    },
  },
});
