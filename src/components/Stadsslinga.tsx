import { useEffect, useRef } from "react";
import { startaSlinga } from "@/lib/slinga/karta";
import { STOPP } from "@/lib/slinga/stopp";
import { TEXTER, type Sprak } from "@/lib/sprak";

/**
 * Rundvandringens scrollsektion: kartan, pluppen som går rutten och kortet vid varje stopp.
 * Motorn ligger i src/lib/slinga/, stoppen i src/lib/slinga/stopp.ts.
 */
export function Stadsslinga({
  sprak,
  onForfragan,
}: {
  sprak: Sprak;
  /** Öppnar förfrågan om rundvandring (popup med datum och antal personer). */
  onForfragan: () => void;
}) {
  const t = TEXTER[sprak].slinga;
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return startaSlinga(ref.current);
  }, []);

  return (
    <section ref={ref} id="rundvandring" className="slinga" aria-label={t.etikett}>
      <div className="slinga__scen">
        <div className="slinga__karta" aria-hidden="true" />
        <canvas className="slinga__spar" aria-hidden="true" />
        <div className="slinga__ton" aria-hidden="true" />

        <header className="slinga__hero">
          <p className="slinga__overrad">{t.overrad}</p>
          <h2 className="slinga__rubrik">
            {t.rubrik[0]} <span className="slinga__radbryt">{t.rubrik[1]}</span>
          </h2>
          <p className="slinga__underrad">
            <img
              className="slinga__avatar"
              src="/caroline-avatar.webp"
              alt=""
              width={240}
              height={240}
              decoding="async"
            />
            {t.med}
          </p>
        </header>

        <ol className="slinga__stopplista">
          {STOPP.map((s, i) => (
            <li
              key={s.lat}
              className={s.slut ? "slinga__kort slinga__kort--slut" : "slinga__kort"}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {s.bild && (
                <img
                  className="slinga__bild"
                  src={s.bild.src}
                  alt={s.bild.alt[sprak]}
                  width={800}
                  height={600}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "low"}
                />
              )}
              <div className="slinga__korttext">
                <span className="slinga__nummer">
                  {s.slut ? t.slutEtikett : t.stopp(i + 1, STOPP.length - 1)}
                </span>
                <h3>{s.namn[sprak]}</h3>
                <p>{s.text[sprak]}</p>
                {s.slut && (
                  <button
                    type="button"
                    className="btn-base btn-bla slinga__knapp"
                    onClick={onForfragan}
                  >
                    {t.boka}
                  </button>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="slinga__ledtrad" aria-hidden="true">
          <span>{t.ledtrad}</span>
          <i />
        </div>
      </div>
    </section>
  );
}
