import { ArrowLeft, ArrowRight } from "lucide-react";
import { Toppmeny } from "@/components/Toppmeny";
import { absolut, FORETAG } from "@/lib/foretag";
import { SPRAK, SPRAKKOD, TEXTER, sprakSokvag, type Sprak } from "@/lib/sprak";

/** Adressen till tv-sidan på varje språk. */
export const TV_SOKVAG: Record<Sprak, string> = { sv: "/tv", en: "/en/tv", es: "/es/tv" };

/** Metadata för tv-sidan. */
export function tvHuvud(sprak: Sprak) {
  const t = TEXTER[sprak].tv;
  return {
    meta: [
      { title: `${t.rubrik} | Shoot for the Moon` },
      { name: "description", content: t.ingress },
      { property: "og:title", content: `${t.rubrik} | Shoot for the Moon` },
      { property: "og:description", content: t.ingress },
    ],
    links: [
      { rel: "canonical", href: absolut(TV_SOKVAG[sprak]) },
      ...SPRAK.map((s) => ({
        rel: "alternate",
        hrefLang: SPRAKKOD[s].html,
        href: absolut(TV_SOKVAG[s]),
      })),
    ],
  };
}

/**
 * Shoot for the Moon som produktionsbolag: tv, dokumentär och konsultuppdrag.
 * En egen sida, så att startsidan kan sälja kvällarna och den här kan tala till branschen.
 */
export function Tvsida({ sprak }: { sprak: Sprak }) {
  const t = TEXTER[sprak].tv;
  const hem = sprakSokvag(sprak);
  return (
    <>
      <Toppmeny sprak={sprak} bas={hem} sokvagFor={(s) => TV_SOKVAG[s]} frostad />
      <main className="tvsida">
        <section className="innehall praktiskt tv tvsida__hero" aria-labelledby="tv-rubrik">
          <div className="innehall__inre tv__inre">
            <div className="tv__text">
              <p className="overrad">{t.overrad}</p>
              <h1 id="tv-rubrik">{t.rubrik}</h1>
              <p className="ingress tv__ingress">{t.ingress}</p>
            </div>
            <div className="tv__mer">
              <div className="tv__dokumentar">
                <p className="tv__etikett">{t.dokumentarEtikett}</p>
                <h2>Nordic Noir: The Rise of Scandi Drama</h2>
                <p>{t.dokumentarText}</p>
              </div>
              <dl className="fakta">
                {t.fakta.map((f) => (
                  <div key={f.etikett}>
                    <dt>{f.etikett}</dt>
                    <dd>{f.text}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="innehall tvsida__kontakt" aria-labelledby="tv-kontakt">
          <div className="innehall__inre">
            <h2 id="tv-kontakt">{t.uppdragRubrik}</h2>
            <p className="ingress">{t.uppdragText}</p>
            <div className="tvsida__knappar">
              <a className="btn-base btn-bla" href={`mailto:${FORETAG.epost}`}>
                {FORETAG.epost} <ArrowRight aria-hidden="true" />
              </a>
              <a className="btn-base btn-outline" href={hem}>
                <ArrowLeft aria-hidden="true" /> {t.tillbaka}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
