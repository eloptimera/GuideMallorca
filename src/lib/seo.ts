// Gemensam SEO-hjälp: metadata per sida och strukturerad data (schema.org).
// Varje route anropar sidhuvud() i sin head() – då blir titel, beskrivning, canonical,
// delningsbild och strukturerad data likadana överallt.
import { absolut, FORETAG, SAJT_URL } from "@/lib/foretag";

/** Standardbilden när en länk delas. Sidor med egen bild skickar `bild` till sidhuvud(). */
export const DELNINGSBILD = { src: "/og.jpg", bredd: 1200, hojd: 630 } as const;

type Schema = Record<string, unknown>;

/** JSON-LD som går säkert att lägga i en <script>-tagg. */
export function jsonLd(schema: Schema) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema).replace(/</g, "\\u003c"),
  };
}

export function sidhuvud({
  titel,
  beskrivning,
  sokvag,
  schema = [],
  bild,
}: {
  /** Titel utan sajtnamn – det läggs till automatiskt. */
  titel: string;
  beskrivning: string;
  sokvag: string;
  schema?: readonly Schema[];
  /** Egen delningsbild (1200 × 630) med alt-text. Utelämnad = standardbilden. */
  bild?: { src: string; alt: string };
}) {
  const fullTitel = titel === FORETAG.namn ? titel : `${titel} | ${FORETAG.namn}`;
  const url = absolut(sokvag);
  return {
    meta: [
      { title: fullTitel },
      { name: "description", content: beskrivning },
      { property: "og:title", content: fullTitel },
      { property: "og:description", content: beskrivning },
      { property: "og:url", content: url },
      { property: "og:image", content: absolut(bild?.src ?? DELNINGSBILD.src) },
      { property: "og:image:width", content: String(DELNINGSBILD.bredd) },
      { property: "og:image:height", content: String(DELNINGSBILD.hojd) },
      {
        property: "og:image:alt",
        content: bild?.alt ?? "Flygbild över Palma de Mallorca med katedralen La Seu",
      },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: schema.map(jsonLd),
  };
}

/** Webbplatsen – ligger på alla sidor via roten. */
export function grundSchema(): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SAJT_URL}/#webbplats`,
    name: FORETAG.namn,
    description: FORETAG.beskrivning,
    url: absolut("/"),
    inLanguage: "sv-SE",
    about: { "@type": "City", name: FORETAG.ort },
  };
}
