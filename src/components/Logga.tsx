/**
 * Loggan Shoot for the Moon, transparent: vit text, "for the" och linjen i ljus
 * brons-kräm, direkt på toningen. Satt i text så att den är skarp i alla storlekar.
 * Samma loggan ligger som favicon (public/favicon.ico och apple-touch-icon.png).
 */
export function Logga({ storlek = "liten" }: { storlek?: "liten" | "mellan" }) {
  return (
    <span className={`logga logga--${storlek}`} role="img" aria-label="Shoot for the Moon">
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
      <span className="logga__under logga__under--andra" aria-hidden="true">
        Spain &amp; Beyond
      </span>
    </span>
  );
}
