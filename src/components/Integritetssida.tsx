import { Logga } from "@/components/Logga";
import { Sprakvaljare } from "@/components/Sprakvaljare";
import { absolut } from "@/lib/foretag";
import { INTEGRITET, INTEGRITET_SOKVAG } from "@/lib/integritet";
import { SPRAK, SPRAKKOD, sprakSokvag, type Sprak } from "@/lib/sprak";

/** Metadata för integritetspolicyn på ett språk. */
export function integritetHuvud(sprak: Sprak) {
  const t = INTEGRITET[sprak];
  return {
    meta: [
      { title: `${t.titel} | Shoot for the Moon` },
      { name: "description", content: t.beskrivning },
    ],
    links: [
      { rel: "canonical", href: absolut(INTEGRITET_SOKVAG[sprak]) },
      ...SPRAK.map((s) => ({
        rel: "alternate",
        hrefLang: SPRAKKOD[s].html,
        href: absolut(INTEGRITET_SOKVAG[s]),
      })),
    ],
  };
}

export function Integritetssida({ sprak }: { sprak: Sprak }) {
  const t = INTEGRITET[sprak];
  return (
    <>
      <Sprakvaljare sprak={sprak} sokvagFor={(s) => INTEGRITET_SOKVAG[s]} />
      <header className="policy__topp">
        <a href={sprakSokvag(sprak)} aria-label={t.tillbaka}>
          <Logga />
        </a>
      </header>
      <article className="innehall policy">
        <div className="policy__inre">
          <p className="overrad">{t.uppdaterad}</p>
          <h1>{t.titel}</h1>
          <p className="ingress">{t.ingress}</p>
          {t.avsnitt.map((a) => (
            <section key={a.rubrik}>
              <h2>{a.rubrik}</h2>
              {a.text.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </section>
          ))}
          <a className="btn-base btn-bla policy__tillbaka" href={sprakSokvag(sprak)}>
            ← {t.tillbaka}
          </a>
        </div>
      </article>
    </>
  );
}
