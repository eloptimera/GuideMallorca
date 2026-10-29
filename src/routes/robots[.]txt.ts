import { createFileRoute } from "@tanstack/react-router";
import { absolut } from "@/lib/foretag";
import { textSvar } from "@/lib/sidor";

// Alla sökmotorer och AI-tjänster får läsa hela sajten. AI-robotarna står med namn så att det
// syns att de är välkomna – både de som hämtar källor till svar och de som samlar träningsdata.
const AI_ROBOTAR = [
  "OAI-SearchBot", // ChatGPT:s sökfunktion
  "ChatGPT-User", // när en ChatGPT-användare ber om en sida
  "GPTBot", // OpenAI, träningsdata
  "PerplexityBot",
  "ClaudeBot",
  "Claude-SearchBot",
  "Google-Extended", // Gemini – påverkar inte Google Sök
  "Applebot-Extended",
  "Bingbot",
] as const;

const ROBOTS = [
  ...AI_ROBOTAR.flatMap((r) => [`User-agent: ${r}`, "Allow: /", ""]),
  "User-agent: *",
  "Allow: /",
  "",
  `Sitemap: ${absolut("/sitemap.xml")}`,
  "",
].join("\n");

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () => textSvar(ROBOTS, "text/plain"),
    },
  },
});
