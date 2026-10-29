import { Check } from "lucide-react";
import { LOFTEN } from "@/lib/priser";

/** Fyra löften i rad: bindningstid, omtag, ägande och svarstid. */
export function Loften({ kompakt = false }: { kompakt?: boolean }) {
  return (
    <ul className={`grid gap-3 ${kompakt ? "" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
      {LOFTEN.map((l) => (
        <li key={l.titel} className="skylt-liten flex gap-3 p-5">
          <span className="grid size-7 shrink-0 place-items-center rounded-full text-guld-mork border border-guld">
            <Check className="size-4" strokeWidth={3} aria-hidden="true" />
          </span>
          <span>
            <span className="block font-bold text-ink">{l.titel}</span>
            <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
              {l.text}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
