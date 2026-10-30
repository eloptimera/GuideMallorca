import { createFileRoute } from "@tanstack/react-router";
import { Integritetssida, integritetHuvud } from "@/components/Integritetssida";

export const Route = createFileRoute("/privacidad")({
  head: () => integritetHuvud("es"),
  component: () => <Integritetssida sprak="es" />,
});
