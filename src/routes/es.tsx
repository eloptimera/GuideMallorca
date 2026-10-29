import { createFileRoute } from "@tanstack/react-router";
import { Startsida } from "@/components/Startsida";
import { sidhuvud } from "@/lib/seo";

export const Route = createFileRoute("/es")({
  head: () => sidhuvud("es"),
  component: () => <Startsida sprak="es" />,
});
