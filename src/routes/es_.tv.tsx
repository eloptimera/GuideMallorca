import { createFileRoute } from "@tanstack/react-router";
import { Tvsida, tvHuvud } from "@/components/Tvsida";

export const Route = createFileRoute("/es_/tv")({
  head: () => tvHuvud("es"),
  component: () => <Tvsida sprak="es" />,
});
