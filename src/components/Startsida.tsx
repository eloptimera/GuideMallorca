import { Bokningsformular } from "@/components/Bokningsformular";
import { Sprakvaljare } from "@/components/Sprakvaljare";
import { Stadsslinga } from "@/components/Stadsslinga";
import { VanligaFragor, type Fraga } from "@/components/VanligaFragor";
import { FORETAG } from "@/lib/foretag";
import { AKTIVITETER, INLAGG } from "@/lib/innehall";
import { SPRAKKOD, TEXTER, type Sprak } from "@/lib/sprak";

// Hela startsidan på ett språk. Routerna /, /en och /es renderar den här med sitt språk.
// Ordning när man scrollar: Shoot for the Moon → erbjudandena (Stand Up History, film,
// museum) → rundvandringen med kartan → kommande aktiviteter → om Caroline → tv och
// dokumentär (Shoot for the Moon som produktionsbolag) → anteckningar
// (bloggen) → frågor → kontakt.
// Texterna ligger i src/lib/sprak.ts, aktiviteter och inlägg i src/lib/innehall.ts.
// Svaren på de vanliga frågorna fyller Caroline i. Lägg inte till FAQ-schema för Google förrän
// svaren är riktiga.

export function Startsida({ sprak }: { sprak: Sprak }) {
  const t = TEXTER[sprak];
  const fragor: Fraga[] = t.fragor.lista.map((fraga) => ({ fraga, svar: t.fragor.platshallare }));
  const locale = SPRAKKOD[sprak].html;
  const datumText = (iso: string, alt: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, alt);

  return (
    <>
      <Sprakvaljare sprak={sprak} />

      <header className="manen">
        <div className="manen__mane" aria-hidden="true" />
        <h1 className="manen__rubrik">Shoot for the Moon</h1>
        <a className="manen__ledtrad" href="#stand-up-history">
          <span>{t.hero.ledtrad}</span>
          <i aria-hidden="true" />
        </a>
      </header>

      <div className="erbjudanden">
        <div className="erbjudanden__intro">
          <p className="overrad">{t.erbjudanden.overrad}</p>
          <h2>{t.erbjudanden.rubrik}</h2>
        </div>
        {t.erbjudanden.lista.map((e, i) => (
          <section key={e.id} id={e.id} className="erbjudande" aria-labelledby={`${e.id}-rubrik`}>
            <div className="erbjudande__inre">
              <div className="erbjudande__namn">
                <span className="pelare__nummer">{String(i + 1).padStart(2, "0")}</span>
                <h3 id={`${e.id}-rubrik`}>{e.namn}</h3>
              </div>
              <div className="erbjudande__text">
                <p className="erbjudande__rubrik">{e.rubrik}</p>
                <p>{e.text}</p>
                <p className="erbjudande__etikett">{t.erbjudanden.temanRubrik}</p>
                <ul className="erbjudande__teman">
                  {e.teman.map((tema, j) => (
                    <li key={j}>{tema}</li>
                  ))}
                </ul>
                <a className="btn-base btn-outline erbjudande__knapp" href="#kontakt">
                  {t.erbjudanden.knapp}
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      <Stadsslinga sprak={sprak} />

      <section className="innehall aktiviteter" id="kommande" aria-labelledby="kommande-rubrik">
        <div className="innehall__inre">
          <p className="overrad">{t.aktiviteter.overrad}</p>
          <h2 id="kommande-rubrik">{t.aktiviteter.rubrik}</h2>
          <p className="ingress">{t.aktiviteter.ingress}</p>
          <ul className="aktiviteter__lista">
            {AKTIVITETER.map((a, i) => (
              <li key={i} className="aktivitet">
                <div className="aktivitet__datum">
                  {a.datum ? (
                    <>
                      <span className="aktivitet__dag">
                        {datumText(a.datum, { day: "numeric" })}
                      </span>
                      <span className="aktivitet__manad">
                        {datumText(a.datum, { month: "short" })}
                      </span>
                    </>
                  ) : (
                    <span className="aktivitet__snart">{t.aktiviteter.datumMeddelas}</span>
                  )}
                </div>
                <div className="aktivitet__text">
                  <p className="aktivitet__typ">
                    {t.aktiviteter.typer[a.typ]} · {a.plats[sprak]}
                    {a.exempel && <span className="exempel">{t.aktiviteter.exempel}</span>}
                  </p>
                  <h3>{a.titel[sprak]}</h3>
                  <p>{a.text[sprak]}</p>
                </div>
                <a className="btn-base btn-bla aktivitet__knapp" href="#kontakt">
                  {t.aktiviteter.anmal}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
            <ul className="om__roller">
              {t.om.roller.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <div className="om__text">
              {t.om.text.map((stycke) => (
                <p key={stycke}>{stycke}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="innehall praktiskt tv" id="tv" aria-labelledby="tv-rubrik">
        <div className="innehall__inre praktiskt__inre">
          <div>
            <p className="overrad">{t.tv.overrad}</p>
            <h2 id="tv-rubrik">{t.tv.rubrik}</h2>
            <p className="ingress tv__ingress">{t.tv.ingress}</p>
            <div className="tv__dokumentar">
              <p className="tv__etikett">{t.tv.dokumentarEtikett}</p>
              <h3>Nordic Noir: The Rise of Scandi Drama</h3>
              <p>{t.tv.dokumentarText}</p>
            </div>
          </div>
          <dl className="fakta">
            {t.tv.fakta.map((f) => (
              <div key={f.etikett}>
                <dt>{f.etikett}</dt>
                <dd>{f.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="innehall blogg" id="anteckningar" aria-labelledby="blogg-rubrik">
        <div className="innehall__inre">
          <p className="overrad">{t.blogg.overrad}</p>
          <h2 id="blogg-rubrik">{t.blogg.rubrik}</h2>
          <p className="ingress">{t.blogg.ingress}</p>
          <ul className="blogg__flode">
            {INLAGG.map((p) => (
              <li key={p.datum + p.bild.src} className="inlagg">
                <img
                  src={p.bild.src}
                  alt={p.bild.alt[sprak]}
                  width={800}
                  height={800}
                  loading="lazy"
                  decoding="async"
                />
                <div className="inlagg__text">
                  <time dateTime={p.datum}>
                    {datumText(p.datum, { day: "numeric", month: "long", year: "numeric" })}
                    {p.exempel && <span className="exempel">{t.blogg.exempel}</span>}
                  </time>
                  <p>{p.text[sprak]}</p>
                </div>
              </li>
            ))}
          </ul>
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

      <section className="innehall boka" id="kontakt" aria-labelledby="kontakt-rubrik">
        <div className="innehall__inre boka__inre">
          <div>
            <p className="overrad">{t.kontakt.overrad}</p>
            <h2 id="kontakt-rubrik">{t.kontakt.rubrik}</h2>
            <p className="ingress">{t.kontakt.ingress}</p>
            <div className="kontakt">
              <p className="kontakt__rubrik">{t.kontakt.direkt}</p>
              <a className="kontakt__rad" href={`mailto:${FORETAG.epost}`}>
                <span className="kontakt__etikett">{t.kontakt.epost}</span>
                {FORETAG.epost}
              </a>
              <a className="kontakt__rad" href={`tel:${FORETAG.telefonLank}`}>
                <span className="kontakt__etikett">{t.kontakt.telefon}</span>
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
              <p className="sidfot__namn">Shoot for the Moon</p>
              <p className="sidfot__text">{t.sidfot.text}</p>
              <a className="sidfot__knapp" href="#kontakt">
                {t.sidfot.kontakta} <span aria-hidden="true">→</span>
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
              <p className="sidfot__ort">Caroline Palmstierna</p>
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
