// Bokningsformuläret skickas hit och vidare som mejl via Resend (https://resend.com).
//
// Kräver två miljövariabler i Vercel (Settings → Environment Variables):
//   RESEND_API_KEY  – API-nyckel från Resend
//   KONTAKT_TILL    – adressen som ska ta emot bokningarna (flera separeras med komma)
// Valfritt:
//   KONTAKT_FRAN    – avsändare, t.ex. "Guide Mallorca <hej@er-doman.se>" när domänen är
//                     verifierad i Resend. Utan den används Resends testavsändare, som bara
//                     kan skicka till adressen Resend-kontot är registrerat på.
import { createServerFn } from "@tanstack/react-start";

export type Bokning = {
  namn: string;
  epost: string;
  telefon: string;
  /** Önskat datum eller period, fritt formulerat. */
  datum: string;
  /** Antal personer, som text så att "ca 6" fungerar. */
  antal: string;
  meddelande: string;
  /** Dolt fält som bara robotar fyller i. */
  falla: string;
};

export const skickaBokning = createServerFn({ method: "POST" })
  .validator((data: Bokning) => data)
  .handler(async ({ data }) => {
    // Dynamisk import: koden laddas bara på servern och följer aldrig med till webbläsaren.
    const { hanteraBokning } = await import("@/lib/bokning.server");
    return hanteraBokning(data);
  });
