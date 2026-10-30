// Gemensam SEO-hjälp: metadata per sida och strukturerad data (schema.org).
// Varje route anropar sidhuvud() i sin head() – då blir titel, beskrivning, canonical,
// delningsbild och strukturerad data likadana överallt.
import { absolut, FORETAG, SAJT_URL } from "@/lib/foretag";
import { SPRAK, SPRAKKOD, TEXTER, sprakSokvag, type Sprak } from "@/lib/sprak";

/** Standardbilden när en länk delas. Sidor med egen bild skickar `bild` till sidhuvud(). */
// ?v= tvingar meddelandeappar och sociala medier att hämta bilden på nytt. Höj vid nästa byte.
export const DELNINGSBILD = { src: "/og.jpg?v=3", bredd: 1200, hojd: 630 } as const;

type Schema = Record<string, unknown>;

/** JSON-LD som går säkert att lägga i en <script>-tagg. */
export function jsonLd(schema: Schema) {
  return {
    type: "application/ld+json",
    children: JSON.stringify(schema).replace(/</g, "\\u003c"),
  };
}

/** Metadata för startsidan på ett språk, med hreflang-länkar till de andra språken. */
export function sidhuvud(sprak: Sprak) {
  const t = TEXTER[sprak].meta;
  const fullTitel = `${t.titel} | ${FORETAG.namn}`;
  const url = absolut(sprakSokvag(sprak));
  const bild = absolut(DELNINGSBILD.src);
  return {
    meta: [
      { title: fullTitel },
      { name: "description", content: t.beskrivning },
      { property: "og:title", content: fullTitel },
      { property: "og:description", content: t.beskrivning },
      { property: "og:url", content: url },
      { property: "og:locale", content: SPRAKKOD[sprak].locale },
      ...SPRAK.filter((s) => s !== sprak).map((s) => ({
        property: "og:locale:alternate",
        content: SPRAKKOD[s].locale,
      })),
      { property: "og:image", content: bild },
      { name: "twitter:image", content: bild },
      { property: "og:image:type", content: "image/jpeg" },
      { property: "og:image:width", content: String(DELNINGSBILD.bredd) },
      { property: "og:image:height", content: String(DELNINGSBILD.hojd) },
      { property: "og:image:alt", content: t.bildAlt },
    ],
    links: [
      { rel: "canonical", href: url },
      ...SPRAK.map((s) => ({
        rel: "alternate",
        hrefLang: SPRAKKOD[s].html,
        href: absolut(sprakSokvag(s)),
      })),
      { rel: "alternate", hrefLang: "x-default", href: absolut("/") },
    ],
    scripts: [jsonLd(grundSchema(sprak))],
  };
}

/** Webbplatsen – ligger på alla sidor via roten. */
export function grundSchema(sprak: Sprak = "sv"): Schema {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SAJT_URL}/#webbplats`,
    name: FORETAG.namn,
    description: TEXTER[sprak].meta.beskrivning,
    url: absolut(sprakSokvag(sprak)),
    inLanguage: SPRAKKOD[sprak].html,
    about: { "@type": "Place", name: "Mallorca" },
    author: {
      "@type": "Person",
      name: "Caroline Palmstierna",
      jobTitle: "Journalist, TV-konsult och föreläsare",
      email: FORETAG.epost,
      telephone: FORETAG.telefonLank,
    },
  };
}
