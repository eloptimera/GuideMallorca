import { Bokningsformular } from "@/components/Bokningsformular";
import { Sprakvaljare } from "@/components/Sprakvaljare";
import { Stadsslinga } from "@/components/Stadsslinga";
import { VanligaFragor, type Fraga } from "@/components/VanligaFragor";
import { FORETAG } from "@/lib/foretag";
import { TEXTER, type Sprak } from "@/lib/sprak";

// Hela startsidan på ett språk. Routerna /, /en och /es renderar den här med sitt språk.
// Texterna ligger i src/lib/sprak.ts (stoppen i src/lib/slinga/stopp.ts).
// Svaren på de vanliga frågorna fyller Caroline i. Lägg inte till FAQ-schema för Google förrän
// svaren är riktiga.

export function Startsida({ sprak }: { sprak: Sprak }) {
  const t = TEXTER[sprak];
  const fragor: Fraga[] = t.fragor.lista.map((fraga) => ({ fraga, svar: t.fragor.platshallare }));
  return (
    <>
      <Sprakvaljare sprak={sprak} />
      <Stadsslinga sprak={sprak} />

      <section className="innehall om" id="om-caroline" aria-labelledby="om-rubrik">
        <div className="innehall__inre om__inre">
          <figure className="om__bild">
            <img
              src="/caroline.webp"
              alt={t.om.bildAlt}
              width={800}
              height={1000}
              loading="lazy"
              decoding="async"
            />
          </figure>
          <div>
            <p className="overrad">{t.om.overrad}</p>
            <h2 id="om-rubrik">Caroline Palmstierna</h2>
            <p className="ingress">{t.om.ingress}</p>
            <div className="om__text">
              <p>{t.om.text[0]}</p>
              <p>{t.om.text[1]}</p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="innehall vandringar"
        id="stadsvandringar"
        aria-labelledby="vandring-rubrik"
      >
        <div className="innehall__inre">
          <p className="overrad">{t.vandringar.overrad}</p>
          <h2 id="vandring-rubrik">{t.vandringar.rubrik}</h2>
          <ol className="pelare">
            {t.vandringar.pelare.map((p, i) => (
              <li key={p.rubrik}>
                <span className="pelare__nummer">{String(i + 1).padStart(2, "0")}</span>
                <h3>{p.rubrik}</h3>
                <p>{p.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="innehall praktiskt" id="praktiskt" aria-labelledby="praktiskt-rubrik">
        <div className="innehall__inre praktiskt__inre">
          <div>
            <p className="overrad">{t.praktiskt.overrad}</p>
            <h2 id="praktiskt-rubrik">{t.praktiskt.rubrik}</h2>
          </div>
          <dl className="fakta">
            {t.praktiskt.fakta.map((f) => (
              <div key={f.etikett}>
                <dt>{f.etikett}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="innehall fragor" id="fragor" aria-labelledby="fragor-rubrik">
        <div className="innehall__inre fragor__inre">
          <div>
            <p className="overrad">{t.fragor.overrad}</p>
            <h2 id="fragor-rubrik">{t.fragor.rubrik}</h2>
          </div>
          <VanligaFragor fragor={fragor} />
        </div>
      </section>

      <section className="innehall boka" id="boka" aria-labelledby="boka-rubrik">
        <div className="innehall__inre boka__inre">
          <div>
            <p className="overrad">{t.boka.overrad}</p>
            <h2 id="boka-rubrik">{t.boka.rubrik}</h2>
            <p className="ingress">{t.boka.ingress}</p>
            <div className="kontakt">
              <p className="kontakt__rubrik">{t.boka.direkt}</p>
              <a className="kontakt__rad" href={`mailto:${FORETAG.epost}`}>
                <span className="kontakt__etikett">{t.boka.epost}</span>
                {FORETAG.epost}
              </a>
              <a className="kontakt__rad" href={`tel:${FORETAG.telefonLank}`}>
                <span className="kontakt__etikett">{t.boka.telefon}</span>
                {FORETAG.telefon}
              </a>
            </div>
          </div>
          <Bokningsformular sprak={sprak} />
        </div>
      </section>

      <footer className="sidfot">
        <div className="sidfot__kort">
          <div className="sidfot__topp">
            <div className="sidfot__presentation">
              <p className="sidfot__namn">Caroline Palmstierna</p>
              <p className="sidfot__text">{t.sidfot.text}</p>
              <a className="sidfot__knapp" href="#boka">
                {t.sidfot.boka} <span aria-hidden="true">→</span>
              </a>
            </div>
            <nav className="sidfot__kolumn" aria-label={t.sidfot.sidor}>
              <p className="sidfot__etikett">{t.sidfot.sidor}</p>
              {t.sidfot.lankar.map(([href, namn]) => (
                <a key={href} href={href}>
                  {namn}
                </a>
              ))}
            </nav>
            <div className="sidfot__kolumn">
              <p className="sidfot__etikett">{t.sidfot.kontakt}</p>
              <a href={`mailto:${FORETAG.epost}`}>{FORETAG.epost}</a>
              <a href={`tel:${FORETAG.telefonLank}`}>{FORETAG.telefon}</a>
              <p className="sidfot__ort">{FORETAG.ort}</p>
            </div>
          </div>
          <div className="sidfot__botten">
            <p>
              © {new Date().getFullYear()} {FORETAG.namn} · {t.sidfot.kartdata}
            </p>
            <a
              className="sidfot__tab"
              href="https://www.treatlymarketing.se"
              target="_blank"
              rel="noopener"
            >
              <span>{t.sidfot.byggd}</span>
              <img src="/tab-marketing.png" alt="Tab" width={108} height={72} loading="lazy" />
              <span className="sidfot__tab-namn">Marketing</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
