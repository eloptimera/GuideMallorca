import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Sprakvaljare } from "@/components/Sprakvaljare";
import { TEXTER, type Sprak } from "@/lib/sprak";

/**
 * Menyn som ligger kvar överst när man scrollar. Genomskinlig över första vyn, frostad vit när
 * man har scrollat. Språkvalet ligger i menyn. På mobil (och smala skärmar) blir länkarna en
 * meny bakom ☰-knappen.
 */
export function Toppmeny({
  sprak,
  bas = "",
  sokvagFor,
  frostad = false,
}: {
  sprak: Sprak;
  /** Läggs före ankarlänkarna, t.ex. "/en" på en undersida så att länkarna leder till startsidan. */
  bas?: string;
  /** Vart språkflaggorna leder (standard: startsidan på varje språk). */
  sokvagFor?: (s: Sprak) => string;
  /** Alltid frostad bakgrund (på undersidor utan färgstark första vy). */
  frostad?: boolean;
}) {
  const t = TEXTER[sprak];
  const [scrollad, setScrollad] = useState(false);
  const [oppen, setOppen] = useState(false);

  useEffect(() => {
    const kolla = () => setScrollad(window.scrollY > window.innerHeight * 0.6);
    kolla();
    window.addEventListener("scroll", kolla, { passive: true });
    return () => window.removeEventListener("scroll", kolla);
  }, []);

  // Stäng mobilmenyn med Esc.
  useEffect(() => {
    if (!oppen) return;
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOppen(false);
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [oppen]);

  return (
    <header
      className="toppmeny"
      data-scrollad={scrollad || oppen || frostad ? "" : undefined}
      data-oppen={oppen ? "" : undefined}
    >
      <div className="toppmeny__rad">
        <a className="toppmeny__namn" href={bas || "#"} onClick={() => setOppen(false)}>
          Shoot for the Moon
        </a>
        <nav className="toppmeny__lankar" aria-label={t.sidfot.sidor}>
          {t.hero.meny.map(([href, namn]) => (
            <a key={href} href={bas + href}>
              {namn}
            </a>
          ))}
        </nav>
        <div className="toppmeny__hoger">
          <Sprakvaljare sprak={sprak} inbyggd sokvagFor={sokvagFor} />
          <button
            type="button"
            className="toppmeny__knapp"
            aria-expanded={oppen}
            aria-controls="mobilmeny"
            aria-label={oppen ? t.hero.stangMeny : t.hero.oppnaMeny}
            onClick={() => setOppen((o) => !o)}
          >
            {oppen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </div>
      <nav id="mobilmeny" className="toppmeny__mobil" aria-label={t.sidfot.sidor} hidden={!oppen}>
        {t.hero.meny.map(([href, namn]) => (
          <a key={href} href={bas + href} onClick={() => setOppen(false)}>
            {namn}
          </a>
        ))}
      </nav>
    </header>
  );
}
