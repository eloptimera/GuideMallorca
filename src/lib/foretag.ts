// Enda källan till sajtens uppgifter. Metadata, strukturerad data, robots.txt och sitemap
// läser härifrån.
export const FORETAG: {
  /** Namnet som syns på sajten och i sökresultaten. */
  namn: string;
  /** Kort form. */
  kortnamn: string;
  /** En mening om vad sajten är – används i metadata och strukturerad data. */
  beskrivning: string;
  /** Var Caroline finns. */
  ort: string;
  /** Carolines kontaktuppgifter. */
  epost: string;
  telefon: string;
  /** Telefonnumret för tel:-länkar, utan mellanslag. */
  telefonLank: string;
} = {
  namn: "Shoot for the Moon",
  kortnamn: "Shoot for the Moon",
  beskrivning:
    "Caroline Palmstierna – journalist, TV-konsult och Spanienexpert – delar sin passion för Mallorcas och Spaniens historia genom Stand Up History, filmkvällar och föreläsningar.",
  ort: "Palma de Mallorca",
  epost: "caroline@shootforthemoon.se",
  telefon: "+46 70-726 87 78",
  telefonLank: "+46707268778",
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
