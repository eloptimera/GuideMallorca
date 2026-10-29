import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type Kort = { titel: string; text: string; ikon: LucideIcon };

/** Museiskylt (.skylt i styles.css) med ikon, rubrik och text – används på landningssidorna. */
export function KortVy({ k, children }: { k: Kort; children?: ReactNode }) {
  return (
    <div className="skylt kort-skylt flex h-full flex-col p-7">
      <k.ikon className="size-5 text-guld" strokeWidth={1.5} aria-hidden="true" />
      <h3 className="mt-4 text-[min(1.45rem,11.5cqi)] leading-tight text-ink">{k.titel}</h3>
      <p className="mt-2 flex-1 leading-relaxed text-muted-foreground">{k.text}</p>
      {children}
    </div>
  );
}
