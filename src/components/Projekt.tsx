import { ArrowUpRight, Check } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { BILDER, PROJEKT, type Bild } from "@/lib/projekt";
import { projektKlick } from "@/lib/sparning";

/** Tidigare projekt som kort – på startsidan och på /hemsida-foretag. Bara verkliga projekt. */
export function ProjektLista({ className = "" }: { className?: string }) {
  return (
    <ul className={`grid gap-4 md:grid-cols-3 ${className}`}>
      {PROJEKT.map((p, i) => (
        <li key={p.url} className="h-full">
          <Reveal delay={i * 80} className="h-full">
            <a
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => projektKlick(p.namn)}
              className="skylt group flex h-full flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative isolate grid aspect-[16/10] place-items-center overflow-hidden bg-[#14100b]">
                <span
                  aria-hidden="true"
                  className="absolute top-[18%] left-[16%] -z-10 size-[58%] rounded-full opacity-35 blur-2xl transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `radial-gradient(circle, ${p.farger[0]} 0%, transparent 70%)`,
                  }}
                />
                <span
                  aria-hidden="true"
                  className="absolute right-[12%] bottom-[8%] -z-10 size-[54%] rounded-full opacity-35 blur-2xl transition-transform duration-500 group-hover:scale-110"
                  style={{
                    backgroundImage: `radial-gradient(circle, ${p.farger[1]} 0%, transparent 70%)`,
                  }}
                />
                <span className="px-4 text-center font-display text-[clamp(1.75rem,2.7vw,2.6rem)] tracking-[0.04em] text-elfenben uppercase">
                  {p.namn}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <p className="text-xs font-bold tracking-[0.14em] text-guld-mork uppercase">
                  {p.kategori}
                </p>
                <p className="mt-3 leading-relaxed text-muted-foreground">{p.text}</p>
                {p.gjorde && (
                  <>
                    <p className="mt-5 text-sm font-bold text-ink">Det här gjorde vi</p>
                    <ul className="mt-2 space-y-1.5 text-sm leading-snug text-ink/80">
                      {p.gjorde.map((g) => (
                        <li key={g} className="flex gap-2">
                          <Check
                            className="mt-0.5 size-4 shrink-0 text-guld-mork"
                            strokeWidth={3}
                            aria-hidden="true"
                          />
                          {g}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <span className="mt-auto flex items-center justify-between gap-3 pt-6 font-bold text-ink">
                  {p.doman}
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-white transition-colors group-hover:bg-sun group-hover:text-ink">
                    <ArrowUpRight className="size-5" aria-hidden="true" />
                  </span>
                </span>
                <span className="sr-only"> (öppnas i ny flik)</span>
              </div>
            </a>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}

/** Marknadsföringsbilder vi tagit fram – på startsidan och på sidan om marknadsföringsbilder. */
export function BildGalleri({
  bilder = BILDER,
  className = "",
}: {
  bilder?: readonly Bild[];
  className?: string;
}) {
  return (
    <ul className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${className}`}>
      {bilder.map((b, i) => (
        <li key={b.src}>
          <Reveal delay={i * 70}>
            <figure>
              <div className="overflow-hidden bg-tint">
                <img
                  src={b.src}
                  alt={b.alt}
                  width={b.bredd}
                  height={b.hojd}
                  loading="lazy"
                  decoding="async"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-700 hover:scale-[1.04]"
                />
              </div>
              <figcaption className="mt-3 text-xs font-bold tracking-[0.14em] text-ink/70 uppercase">
                {b.etikett}
              </figcaption>
            </figure>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
