import { useEffect, useRef } from "react";
import { OVERSIKT, startaDronarflygning } from "@/lib/dronarflygning";

/**
 * Startsidans drönarflygning: en hög scrollsektion med en fast scen. Scrollen flyger kameran
 * från översiktsbilden in genom katedralens huvudentré. Själva motorn ligger i
 * src/lib/dronarflygning.ts.
 */
export function Dronarflygning() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return startaDronarflygning(ref.current);
  }, []);

  return (
    <section ref={ref} className="flight" aria-label="Flyg in över Palma mot katedralen La Seu">
      <div className="flight__stage">
        {/* Visas direkt (även utan JavaScript) innan canvasen har ritat. */}
        <img
          className="flight__poster"
          src={OVERSIKT.src}
          width={OVERSIKT.w}
          height={OVERSIKT.h}
          alt="Flygbild över Palma de Mallorca med katedralen La Seu vid vattnet"
          fetchPriority="high"
          decoding="async"
        />
        <canvas className="flight__canvas" aria-hidden="true" />
        <div className="flight__haze" aria-hidden="true" />
        <div className="flight__vignette" aria-hidden="true" />
        <div className="flight__black" aria-hidden="true" />

        <header className="flight__hero">
          <p className="flight__eyebrow">En guide till</p>
          <h1 className="flight__title">
            Palma <em>de</em> Mallorca
          </h1>
        </header>

        <div className="flight__cue" aria-hidden="true">
          <span>Scrolla för att flyga in</span>
          <i />
        </div>
      </div>
    </section>
  );
}
