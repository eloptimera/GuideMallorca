import { createFileRoute } from "@tanstack/react-router";
import { Dronarflygning } from "@/components/Dronarflygning";
import { FORETAG } from "@/lib/foretag";
import { sidhuvud } from "@/lib/seo";
import { OVERSIKT, NARBILD } from "@/lib/dronarflygning";

export const Route = createFileRoute("/")({
  head: () => {
    const h = sidhuvud({
      titel: FORETAG.namn,
      beskrivning: FORETAG.beskrivning,
      sokvag: "/",
    });
    return {
      ...h,
      // Flygbilderna hämtas direkt så att första bildrutan syns utan väntan.
      links: [
        ...h.links,
        { rel: "preload", as: "image", href: OVERSIKT.src, fetchPriority: "high" },
        { rel: "preload", as: "image", href: NARBILD.src },
      ],
    };
  },
  component: Start,
});

function Start() {
  return (
    <>
      <Dronarflygning />
      {/* Sidan innanför huvudentrén. Svart tills vidare. */}
      <section className="inside" id="innanfor" aria-label="Innanför katedralen" />
    </>
  );
}
