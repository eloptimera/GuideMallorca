/**
 * Riktig skärmbild av ett projekt i en webbläsarram, med mobilversionen ovanpå.
 * Bilderna är 1200×750 (dator) och 390×844 (mobil) – se `skarmbild` i projekt.ts.
 */
export function Skarmbild({
  dator,
  mobil,
  doman,
  alt,
  prioriterad = false,
}: {
  dator: string;
  mobil: string;
  doman: string;
  /** Vad bilden visar, t.ex. "Startsidan för Martinssons Billackering". */
  alt: string;
  /** Sätt på bilden högst upp på sidan, så att den laddas först (bättre LCP). */
  prioriterad?: boolean;
}) {
  const laddning = prioriterad
    ? ({ loading: "eager", fetchPriority: "high" } as const)
    : ({ loading: "lazy" } as const);

  return (
    <div className="relative pr-[12%] pb-[10%]">
      <div className="kortskugga overflow-hidden rounded-2xl border-2 border-line bg-white">
        <div
          className="flex items-center gap-2 border-b border-line px-4 py-2.5"
          aria-hidden="true"
        >
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="size-2.5 rounded-full bg-line" />
          <span className="ml-3 truncate rounded-full bg-tint px-3 py-0.5 text-xs text-muted-foreground">
            {doman}
          </span>
        </div>
        <img
          src={dator}
          alt={`${alt} på dator`}
          width={1200}
          height={750}
          decoding="async"
          {...laddning}
          className="block aspect-[16/10] w-full object-cover object-top"
        />
      </div>
      <div className="absolute right-0 bottom-0 w-[24%] overflow-hidden rounded-[1.1rem] border-[3px] border-ink bg-ink shadow-[0_18px_40px_-18px_rgba(16,17,20,0.55)]">
        <img
          src={mobil}
          alt={`${alt} på mobil`}
          width={390}
          height={844}
          decoding="async"
          loading="lazy"
          className="block aspect-[390/844] w-full rounded-[0.85rem] object-cover object-top"
        />
      </div>
    </div>
  );
}
