import { createFileRoute } from "@tanstack/react-router";
import { Integritetssida, integritetHuvud } from "@/components/Integritetssida";

export const Route = createFileRoute("/integritet")({
  head: () => integritetHuvud("sv"),
  component: () => <Integritetssida sprak="sv" />,
});
