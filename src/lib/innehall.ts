// Det som ändras ofta: kommande aktiviteter (skyltfönstret) och inläggen i flödet.
// Allt här är exempel tills Caroline har skickat riktigt innehåll – `exempel: true` visar en
// liten etikett på sajten så att ingen tar dem för riktiga datum eller inlägg.
// Tanken är att den här filen ersätts av ett CMS där Caroline själv lägger in aktiviteter
// och inlägg; komponenterna läser bara listorna nedan.
import type { Sprak } from "@/lib/sprak";

type PerSprak = Record<Sprak, string>;

export type Aktivitet = {
  /** ÅÅÅÅ-MM-DD. Saknas datum visas "Datum meddelas". */
  datum?: string;
  /** Vilket erbjudande aktiviteten hör till (id i texterna för erbjudandena). */
  typ: "stand-up-history" | "film" | "museum" | "rundvandring";
  titel: PerSprak;
  plats: PerSprak;
  text: PerSprak;
  exempel?: boolean;
};

export const AKTIVITETER: readonly Aktivitet[] = [
  {
    typ: "stand-up-history",
    titel: {
      sv: "Stand Up History – tema meddelas",
      en: "Stand Up History – theme to be announced",
      es: "Stand Up History – tema por anunciar",
    },
    plats: { sv: "Palma", en: "Palma", es: "Palma" },
    text: {
      sv: "En kväll där historien berättas som den borde: med humor, skvaller och allvar i samma andetag.",
      en: "An evening where history is told the way it should be: with humour, gossip and gravity in the same breath.",
      es: "Una velada en la que la historia se cuenta como debería: con humor, chismes y seriedad a la vez.",
    },
    exempel: true,
  },
  {
    typ: "film",
    titel: {
      sv: "Filmkväll med föreläsning",
      en: "Film night with a talk",
      es: "Noche de cine con charla",
    },
    plats: { sv: "Palma", en: "Palma", es: "Palma" },
    text: {
      sv: "Caroline sätter filmen i sitt sammanhang innan ljuset släcks – vad som hände, vem som bestämde och varför det spelar roll i dag.",
      en: "Caroline puts the film in context before the lights go down – what happened, who decided and why it matters today.",
      es: "Caroline sitúa la película en su contexto antes de que se apaguen las luces: qué pasó, quién decidió y por qué importa hoy.",
    },
    exempel: true,
  },
  {
    typ: "museum",
    titel: {
      sv: "Museivandring med föreläsning",
      en: "Museum walk with a talk",
      es: "Recorrido por un museo con charla",
    },
    plats: { sv: "Palma", en: "Palma", es: "Palma" },
    text: {
      sv: "Ett museum, ett tema och berättelserna som inte står på skyltarna.",
      en: "One museum, one theme and the stories that aren't on the labels.",
      es: "Un museo, un tema y las historias que no aparecen en las cartelas.",
    },
    exempel: true,
  },
];

export type Inlagg = {
  /** ÅÅÅÅ-MM-DD */
  datum: string;
  bild: { src: string; alt: PerSprak };
  text: PerSprak;
  exempel?: boolean;
};

export const INLAGG: readonly Inlagg[] = [
  {
    datum: "2026-10-24",
    bild: {
      src: "/stopp/la-seu.webp",
      alt: {
        sv: "Katedralen La Seu i Palma",
        en: "La Seu cathedral in Palma",
        es: "La Seu, la catedral de Palma",
      },
    },
    text: {
      sv: "Morgonljuset över La Seu. Här börjar nästan varje berättelse om Palma – och nästan ingen av dem handlar om katedralen.",
      en: "Morning light over La Seu. Almost every story about Palma starts here – and almost none of them are about the cathedral.",
      es: "Luz de mañana sobre La Seu. Casi todas las historias de Palma empiezan aquí, y casi ninguna trata de la catedral.",
    },
    exempel: true,
  },
  {
    datum: "2026-10-17",
    bild: {
      src: "/stopp/mercat-olivar.webp",
      alt: { sv: "Mercat de l'Olivar", en: "Mercat de l'Olivar", es: "Mercat de l'Olivar" },
    },
    text: {
      sv: "Lördag på Olivar. Vill man förstå Mallorca ska man börja vid fiskdisken.",
      en: "Saturday at the Olivar market. If you want to understand Mallorca, start at the fish counter.",
      es: "Sábado en el Olivar. Si quieres entender Mallorca, empieza por la pescadería.",
    },
    exempel: true,
  },
  {
    datum: "2026-10-09",
    bild: {
      src: "/stopp/sa-llotja.webp",
      alt: { sv: "Sa Llotja i Palma", en: "Sa Llotja in Palma", es: "Sa Llotja en Palma" },
    },
    text: {
      sv: "Sa Llotja – byggd av köpmän som ville visa att de var lika mäktiga som kyrkan. Det syns fortfarande.",
      en: "Sa Llotja – built by merchants who wanted to show they were as powerful as the Church. It still shows.",
      es: "Sa Llotja, construida por mercaderes que querían demostrar que eran tan poderosos como la Iglesia. Todavía se nota.",
    },
    exempel: true,
  },
];
