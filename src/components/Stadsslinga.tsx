import { useEffect, useRef } from "react";
import { KAPITEL } from "@/lib/slinga/kapitel";
import { startaSlinga } from "@/lib/slinga/karta";

/**
 * Startsidans scrollsektion: kartan över gamla stan, pluppen och linjen, och kapitlen som tonar
 * fram vid varje stopp. Motorn ligger i src/lib/slinga/.
 */
export function Stadsslinga() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return startaSlinga(ref.current);
  }, []);

  return (
    <section ref={ref} className="slinga" aria-label="En promenad genom Palmas gamla stad">
      <div className="slinga__scen">
        <div className="slinga__karta" aria-hidden="true" />
        <canvas className="slinga__spar" aria-hidden="true" />
        <div className="slinga__ton" aria-hidden="true" />

        <header className="slinga__hero">
          <p className="slinga__overrad">Stadsvandringar i Palma</p>
          <h1 className="slinga__rubrik">
            Palma, bortom
            <br />
            turiststråken
          </h1>
          <p className="slinga__underrad">med Caroline Palmstierna</p>
        </header>

        <ol className="slinga__kapitellista">
          {KAPITEL.map((k, i) => (
            <li
              key={k.rubrik}
              className="slinga__kapitel"
              style={{ opacity: 0, visibility: "hidden" }}
            >
              <span className="slinga__nummer">{String(i + 1).padStart(2, "0")}</span>
              <h2>{k.rubrik}</h2>
              <p>{k.text}</p>
            </li>
          ))}
        </ol>

        <div className="slinga__ledtrad" aria-hidden="true">
          <span>Scrolla för att gå</span>
          <i />
        </div>
      </div>
    </section>
  );
}
