// Enda källan till sajtens uppgifter. Metadata, strukturerad data, robots.txt och sitemap
// läser härifrån.
export const FORETAG: {
  /** Namnet som syns på sajten och i sökresultaten. */
  namn: string;
  /** Kort form. */
  kortnamn: string;
  /** En mening om vad sajten är – används i metadata och strukturerad data. */
  beskrivning: string;
  /** Platsen guiden handlar om. */
  ort: string;
} = {
  namn: "Guide Mallorca",
  kortnamn: "Guide Mallorca",
  beskrivning:
    "Guidade stadsvandringar i Palma de Mallorca med journalisten och Spanienexperten Caroline Palmstierna – historia, nutid och politik bortom turiststråken.",
  ort: "Palma de Mallorca",
};

declare const __SAJT_URL__: string;
declare const __VERIFIERING__: { google: string; bing: string };

/** Verifieringskoder för Search Console och Bing Webmaster Tools (tomma om de inte är satta). */
export const VERIFIERING = __VERIFIERING__;

/** Sajtens publika adress utan avslutande snedstreck, t.ex. https://exempel.se */
export const SAJT_URL: string = __SAJT_URL__;

/** Gör en sökväg (/palma) till en absolut adress (https://…/palma). */
export function absolut(sokvag: string): string {
  return `${SAJT_URL}${sokvag === "/" ? "/" : sokvag}`;
}
