import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Fyrscen } from "@/components/Fyrscen";
import { Mark } from "@/components/Heading";

/** Sajtens enda primära nästa steg. Används i header, på alla sidor och i avslutningsrutan. */
export const BOKA_TEXT = "Boka gratis genomgång";

type Val = { tjanst?: string; paket?: string };

export function BokaKnapp({
  variant = "dark",
  className = "",
  children = BOKA_TEXT,
  onClick,
  ...val
}: Val & {
  variant?: "dark" | "white";
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      to="/kontakt"
      search={{
        ...(val.tjanst ? { tjanst: val.tjanst } : {}),
        ...(val.paket ? { paket: val.paket } : {}),
      }}
      onClick={onClick}
      className={`btn-base ${variant === "white" ? "btn-white" : "btn-dark"} ${className}`}
    >
      {children}
    </Link>
  );
}

/** Standardrubriken i avslutningsrutan och fyrscenen. */
export function BokaRubrik() {
  return (
    <>
      Redo att <Mark>synas</Mark>?
    </>
  );
}

export const BOKA_PANEL_TEXT =
  "20–25 minuter där vi går igenom er digitala närvaro. Ni får ett skräddarsytt förslag efteråt – helt utan kostnad.";

/** Bokningsknappen och prislänken i avslutningsrutan och fyrscenen. */
export function BokaKnappar({
  onBoka,
  prislank = { href: "/priser", text: "Se priser" },
  ...val
}: Val & {
  onBoka?: () => void;
  /** Den andra knappen – som standard /priser, t.ex. ett ankare (#priser) på en prissida. */
  prislank?: { href: string; text: string };
}) {
  return (
    <div className="mt-9 flex flex-wrap gap-3">
      <BokaKnapp variant="white" {...(onBoka ? { onClick: onBoka } : {})} {...val} />
      {prislank.href.startsWith("#") ? (
        <a href={prislank.href} className="btn-base btn-outline-white">
          {prislank.text}
        </a>
      ) : (
        <Link to={prislank.href} className="btn-base btn-outline-white">
          {prislank.text}
        </Link>
      )}
    </div>
  );
}

/**
 * Avslutningen längst ner på sidorna: fyrscenen (samma som på startsidan) med sidans egen
 * rubrik, text och knappar. Fyrscen importerar härifrån – cirkeln är ofarlig eftersom båda
 * bara används när sidan ritas.
 */
export function BokaPanel(props: Parameters<typeof Fyrscen>[0]) {
  return <Fyrscen {...props} />;
}
