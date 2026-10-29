import { Plus } from "lucide-react";
import type { Fraga } from "@/lib/priser";

/**
 * Vanliga frågor som inbyggda <details>-element: svaren finns i HTML:en från start, så
 * sökmotorer och AI-assistenter kan läsa dem, och det behövs ingen JavaScript.
 * Lägg faqSchema() med samma frågor i sidans head().
 */
export function VanligaFragor({ fragor }: { fragor: readonly Fraga[] }) {
  return (
    <div className="border-t border-ink/20">
      {fragor.map((f) => (
        <details key={f.fraga} className="group border-b border-ink/20">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 [&::-webkit-details-marker]:hidden">
            <h3 className="text-xl leading-snug text-ink sm:text-[1.4rem]">{f.fraga}</h3>
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-guld text-guld-mork transition-transform duration-300 group-open:rotate-45">
              <Plus className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </span>
          </summary>
          <p className="max-w-3xl pb-6 text-base leading-relaxed text-ink/80">{f.svar}</p>
        </details>
      ))}
    </div>
  );
}
