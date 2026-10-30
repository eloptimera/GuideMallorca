// Alla indexerbara sidor – används av sitemap.xml. Lägg till nya sidor här.

/** `andrad` (ÅÅÅÅ-MM-DD) anges bara där vi vet när innehållet senast ändrades. */
export const SIDOR: readonly { sokvag: string; namn: string; andrad?: string }[] = [
  { sokvag: "/", namn: "Startsida" },
  { sokvag: "/en", namn: "Startsida (engelska)" },
  { sokvag: "/es", namn: "Startsida (spanska)" },
  { sokvag: "/tv", namn: "TV och dokumentär" },
  { sokvag: "/en/tv", namn: "TV och dokumentär (engelska)" },
  { sokvag: "/es/tv", namn: "TV och dokumentär (spanska)" },
  { sokvag: "/integritet", namn: "Integritetspolicy" },
  { sokvag: "/privacy", namn: "Integritetspolicy (engelska)" },
  { sokvag: "/privacidad", namn: "Integritetspolicy (spanska)" },
];

export function textSvar(text: string, typ: string): Response {
  return new Response(text, {
    headers: {
      "Content-Type": `${typ}; charset=utf-8`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
