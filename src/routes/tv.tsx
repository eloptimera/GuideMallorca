import { createFileRoute } from "@tanstack/react-router";
import { Tvsida, tvHuvud } from "@/components/Tvsida";

export const Route = createFileRoute("/tv")({
  head: () => tvHuvud("sv"),
  component: () => <Tvsida sprak="sv" />,
});
