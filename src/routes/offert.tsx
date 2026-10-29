import { createFileRoute, redirect } from "@tanstack/react-router";

// Den gamla offertsidan är ersatt av bokningsformuläret på /kontakt.
// Permanent omdirigering så att gamla länkar och sökresultat hamnar rätt.
export const Route = createFileRoute("/offert")({
  beforeLoad: () => {
    throw redirect({ to: "/kontakt", statusCode: 301 });
  },
});
