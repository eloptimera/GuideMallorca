import { createFileRoute, redirect } from "@tanstack/react-router";

// Sammanslagen med /hemsida-foretag (samma sökavsikt – två sidor konkurrerade om samma sökningar).
export const Route = createFileRoute("/webbyra")({
  beforeLoad: () => {
    throw redirect({ href: "/hemsida-foretag", statusCode: 301 });
  },
});
