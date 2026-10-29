import { useEffect, useRef } from "react";
import { startaSlinga } from "@/lib/slinga/karta";
import { STOPP } from "@/lib/slinga/stopp";

/**
 * Startsidans scrollsektion: kartan, pluppen som går rutten och kortet vid varje stopp.
 * Motorn ligger i src/lib/slinga/, stoppen i src/lib/slinga/stopp.ts.
 */
export function Stadsslinga() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return startaSlinga(ref.current);
  }, []);

  return (
    <section ref={ref} className="slinga" aria-label="Stadsvandringens rutt genom Palma">
      <div className="slinga__scen">
        <div className="slinga__karta" aria-hidden="true" />
        <canvas className="slinga__spar" aria-hidden="true" />
        <div className="slinga__ton" aria-hidden="true" />

        <header className="slinga__hero">
          <p className="slinga__overrad">Ca två timmar till fots</p>
          <h1 className="slinga__rubrik">
            Guidad rundvandring <span className="slinga__radbryt">i Palma</span>
          </h1>
          <p className="slinga__underrad">
            <img
              className="slinga__avatar"
              src="/caroline-avatar.webp"
              alt=""
              width={240}
              height={240}
              decoding="async"
            />
            med Caroline Palmstierna
          </p>
        </header>

        <ol className="slinga__stopplista">
          {STOPP.map((s, i) => (
            <li
              key={s.namn}
              className={s.slut ? "slinga__kort slinga__kort--slut" : "slinga__kort"}
              style={{ opacity: 0, visibility: "hidden" }}
            >
              {s.bild && (
                <img
                  className="slinga__bild"
                  src={s.bild.src}
                  alt={s.bild.alt}
                  width={800}
                  height={600}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "low"}
                />
              )}
              <div className="slinga__korttext">
                <span className="slinga__nummer">
                  {s.slut ? "Ca 2 timmar" : `Stopp ${i + 1} av ${STOPP.length - 1}`}
                </span>
                <h2>{s.namn}</h2>
                <p>{s.text}</p>
                {s.slut && (
                  <a className="btn-base btn-bla slinga__knapp" href="#boka">
                    Boka en vandring
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="slinga__ledtrad" aria-hidden="true">
          <span>Scrolla för att gå rutten</span>
          <i />
        </div>
      </div>
    </section>
  );
}
