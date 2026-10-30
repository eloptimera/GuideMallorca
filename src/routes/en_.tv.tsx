import { createFileRoute } from "@tanstack/react-router";
import { Tvsida, tvHuvud } from "@/components/Tvsida";

export const Route = createFileRoute("/en_/tv")({
  head: () => tvHuvud("en"),
  component: () => <Tvsida sprak="en" />,
});
