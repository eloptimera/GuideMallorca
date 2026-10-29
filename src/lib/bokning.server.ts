// Serverdelen av bokningsformuläret: kontroll av indata och utskick via Resend.
// Laddas bara på servern (se bokning.ts), så zod och nycklar når aldrig webbläsaren.
import { z } from "zod";

const BokningSchema = z.object({
  /** Företag, namn eller båda – besökaren skriver fritt. */
  namn: z.string().trim().min(1).max(200),
  epost: z.string().trim().email().max(200),
  telefon: z.string().trim().max(40),
  webbplats: z.string().trim().max(200),
  tjanster: z.array(z.string().max(60)).max(10),
  // Längsta nivånamnet är "Extern marknadsavdelning" (24 tecken).
  paket: z.string().max(40),
  meddelande: z.string().trim().max(3000),
  /** Dolt fält som bara robotar fyller i. */
  falla: z.string().max(500),
});

export async function hanteraBokning(indata: unknown): Promise<{ ok: true }> {
  const data = BokningSchema.parse(indata);
  // Robot: låtsas att allt gick bra men skicka ingenting.
  if (data.falla) return { ok: true as const };

  const nyckel = process.env["RESEND_API_KEY"];
  const till = process.env["KONTAKT_TILL"];
  if (!nyckel || !till) {
    console.error("Bokning: RESEND_API_KEY eller KONTAKT_TILL saknas – inget mejl skickades.");
    throw new Error("Formuläret är inte kopplat till någon mottagare ännu.");
  }

  const rader = [
    `Företag/namn: ${data.namn}`,
    `E-post: ${data.epost}`,
    data.telefon && `Telefon: ${data.telefon}`,
    data.webbplats && `Webbplats: ${data.webbplats}`,
    data.paket && `Intresserad av: ${data.paket}`,
    data.tjanster.length > 0 && `Vill ha hjälp med: ${data.tjanster.join(", ")}`,
    data.meddelande && `\nMeddelande:\n${data.meddelande}`,
  ].filter(Boolean);

  const svar = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${nyckel}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env["KONTAKT_FRAN"] ?? "Webbplatsen <onboarding@resend.dev>",
      to: till.split(",").map((a) => a.trim()),
      reply_to: data.epost,
      subject: `Ny bokning av gratis genomgång – ${data.namn}`,
      text: rader.join("\n"),
    }),
  });

  if (!svar.ok) {
    console.error("Bokning: Resend svarade", svar.status, await svar.text());
    throw new Error("Mejlet kunde inte skickas.");
  }
  return { ok: true as const };
}
