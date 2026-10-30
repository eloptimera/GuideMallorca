import { createFileRoute } from "@tanstack/react-router";
import { Integritetssida, integritetHuvud } from "@/components/Integritetssida";

export const Route = createFileRoute("/privacy")({
  head: () => integritetHuvud("en"),
  component: () => <Integritetssida sprak="en" />,
});
