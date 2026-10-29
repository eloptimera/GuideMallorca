// Händelser till Vercel Analytics (cookiefri, ingen personuppgift skickas).
//
// Själva konverteringen – en skickad bokning – räknas som besök på /tack. Klick på
// bokningsknapparna skickas som händelsen "boka_klick" med vilken sida och vilken knapp, så
// att vi ser vilka knappar som leder till bokningar. Egna händelser visas i Vercel först på
// Pro-planen; på Hobby ignoreras de utan att något går sönder.
//
// Skicka aldrig namn, e-post, telefon eller fritext från formulär hit.
import { track } from "@vercel/analytics";

type Data = Record<string, string | number>;

// Max två egenskaper per händelse – det är vad Pro-planen sparar.
function skicka(namn: string, data: Data) {
  try {
    track(namn, data);
  } catch {
    // Statistik får aldrig stoppa ett klick.
  }
}

export function bokaKlick(sida: string, plats: string) {
  skicka("boka_klick", { sida, plats });
}

/** En skickad bokning och vilka tjänster den gällde – aldrig vad besökaren skrev. */
export function bokningSkickad(tjanster: readonly string[]) {
  skicka("bokning_skickad", {
    tjanster: tjanster.join(",") || "ingen vald",
    antal: tjanster.length,
  });
}

/** Ett avklarat steg i bokningsformuläret, så att vi ser var besökare hoppar av. */
export function bokningSteg(steg: string) {
  skicka("bokning_steg", { steg });
}

/** Vilken tjänst besökaren fällde ut under "Det här krävs för att lyckas digitalt". */
export function tjanstOppnad(tjanst: string) {
  skicka("tjanst_oppnad", { tjanst });
}

export function projektKlick(projekt: string) {
  skicka("projekt_klick", { projekt });
}

export function mejlKlick(sida: string) {
  skicka("mejl_klick", { sida });
}
