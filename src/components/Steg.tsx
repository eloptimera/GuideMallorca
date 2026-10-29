export type Steg = { titel: string; text: string };

/** Fyra eller fem steg får två kolumner på mellanstora skärmar och en rad på breda. */
const KOLUMNER: Record<number, string> = {
  4: "md:grid-cols-2 xl:grid-cols-4",
  5: "md:grid-cols-2 xl:grid-cols-5",
};

/**
 * Numrerade steg som väggtext: siffran i en tunn förgylld ring, ingen ruta runt. `rad` lägger
 * dem bredvid varandra på bredare skärmar, med en guldlinje mellan ringarna (.steg-rad).
 */
export function Stegliste({ steg, rad = false }: { steg: readonly Steg[]; rad?: boolean }) {
  return (
    <ol
      className={
        rad ? `steg-rad grid gap-8 ${KOLUMNER[steg.length] ?? "md:grid-cols-3"}` : "space-y-6"
      }
    >
      {steg.map((s, i) => (
        <li key={s.titel} className={`flex gap-5 ${rad ? "md:flex-col md:gap-5" : ""}`}>
          <span className="steg-ring grid size-11 shrink-0 place-items-center rounded-full border border-guld bg-background font-display text-xl text-guld-mork italic">
            {i + 1}
          </span>
          <span>
            <span className="block font-display text-xl leading-tight text-ink">{s.titel}</span>
            <span className="mt-1 block leading-relaxed text-muted-foreground">{s.text}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
