/**
 * Loggan Shoot for the Moon, satt i text så att den är skarp i alla storlekar.
 * Varianten är den nattblå: krämvit text, "for the" och linjen i brons.
 * `som="h1"` på första vyn; i sidfoten är den bara en bild av namnet.
 */
export function Logga({
  som: Tagg = "div",
  storlek = "stor",
}: {
  som?: "h1" | "div";
  storlek?: "stor" | "liten";
}) {
  return (
    <Tagg className={`logga logga--${storlek}`} aria-label="Shoot for the Moon">
      <span className="logga__ord" aria-hidden="true">
        Shoot
      </span>
      <span className="logga__mitt" aria-hidden="true">
        for the
      </span>
      <span className="logga__ord" aria-hidden="true">
        Moon
      </span>
      <span className="logga__linje" aria-hidden="true" />
      <span className="logga__under" aria-hidden="true">
        History <i>|</i> People <i>|</i> Places
      </span>
      <span className="logga__under" aria-hidden="true">
        Spain &amp; Beyond
      </span>
    </Tagg>
  );
}
