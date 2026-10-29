import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { hittaLandningssida } from "@/lib/landningssidor";

/**
 * Länk till en landningssida som kanske inte finns än (t.ex. /lokal-seo).
 *
 * - Finns sidan i LANDNINGSSIDOR blir det en länk dit – automatiskt, utan att sidan som
 *   länkar behöver ändras.
 * - Annars länkas `reserv` (en befintlig sida) om den är satt.
 * - Annars visas bara texten – eller ingenting med `dold` (för fristående "Läs mer"-länkar).
 *   Vi länkar aldrig till en sida som ger 404.
 */
export function FramtidaLank({
  till,
  reserv,
  className = "",
  dold = false,
  children,
}: {
  till: string;
  reserv?: string;
  className?: string;
  dold?: boolean;
  children: ReactNode;
}) {
  const mal = hittaLandningssida(till) ? till : reserv;
  if (!mal) return dold ? null : <>{children}</>;
  return (
    <Link to={mal} className={className}>
      {children}
    </Link>
  );
}
