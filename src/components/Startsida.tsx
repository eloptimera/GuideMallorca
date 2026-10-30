import { Bokningsformular } from "@/components/Bokningsformular";
import { Logga } from "@/components/Logga";
import { Toppmeny } from "@/components/Toppmeny";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { TV_SOKVAG } from "@/components/Tvsida";
import { Stadsslinga } from "@/components/Stadsslinga";
import { VanligaFragor, type Fraga } from "@/components/VanligaFragor";
import { FORETAG } from "@/lib/foretag";
import { INSTAGRAM, INTEGRITET, INTEGRITET_SOKVAG, ORGNR } from "@/lib/integritet";
import {
  Evenemangsruta,
  Kalender,
  Rundvandringsruta,
  minnsOppnare,
  useValtEvenemang,
  type Typfilter,
} from "@/components/Evenemang";
import { useState } from "react";
import { EVENEMANG_TEXTER } from "@/lib/evenemangtexter";
import { CITAT, kommande } from "@/lib/innehall";
import { SPRAKKOD, TEXTER, type Sprak } from "@/lib/sprak";

// Hela startsidan på ett språk. Routerna /, /en och /es renderar den här med sitt språk.
// Ordning när man scrollar: första vyn → erbjudandena (Stand Up History, film, museum) →
// bilder från tidigare kvällar och citat → kalendern med kommande evenemang (varje evenemang
// öppnas i en ruta med anmälan) → rundvandringen med kartan → om Caroline → frågor → kontakt.
// TV och dokumentär har en egen sida (Tvsida.tsx, /tv).
// Texterna ligger i src/lib/sprak.ts, aktiviteter och inlägg i src/lib/innehall.ts.
// Svaren på de vanliga frågorna fyller Caroline i. Lägg inte till FAQ-schema för Google förrän
// svaren är riktiga.

/** Citattecken enligt varje språks praxis. */
const CITATTECKEN = { sv: ["”", "”"], en: ["“", "”"], es: ["«", "»"] } as const;

const GALLERI_ALT = {
  publik: {
    sv: "Publik i soffor och stolar lyssnar på Caroline",
    en: "An audience on sofas and chairs listening to Caroline",
    es: "Público en sofás y sillas escuchando a Caroline",
  },
  scen: {
    sv: "Caroline berättar inför publik",
    en: "Caroline speaking to an audience",
    es: "Caroline hablando ante el público",
  },
  buffe: {
    sv: "Caroline vid ett dukat bord med tilltugg",
    en: "Caroline by a table set with food",
    es: "Caroline junto a una mesa con picoteo",
  },
} as const;

export function Startsida({ sprak }: { sprak: Sprak }) {
  const t = TEXTER[sprak];
  const te = EVENEMANG_TEXTER[sprak];
  const { id: valtEvenemang, oppna, stang } = useValtEvenemang();
  const [typfilter, setTypfilter] = useState<Typfilter>(null);
  const [rundvandringOppen, setRundvandringOppen] = useState(false);
  const fragor: Fraga[] = t.fragor.lista.map((fraga) => ({ fraga, svar: t.fragor.platshallare }));
  const locale = SPRAKKOD[sprak].html;
  const datumText = (iso: string, alt: Intl.DateTimeFormatOptions) =>
    new Date(`${iso}T12:00:00`).toLocaleDateString(locale, alt);

  return (
    <>
      <Toppmeny sprak={sprak} />

      <header className="glas">
        {/* Bakgrunden: Carolines porträtt suddat till färg, med ett räfflat glas framför och
            samma porträtt skarpt ovanpå till höger. */}
        <div className="glas__bakgrund" aria-hidden="true">
          <img src="/caroline.webp" alt="" width={800} height={1000} decoding="async" />
        </div>
        <div className="glas__raffel" aria-hidden="true" />
        {/* Caroline, skarp, till höger. Tonar in i färgerna åt vänster och nedåt. */}
        <div className="glas__portratt" aria-hidden="true">
          <img
            src="/caroline.webp"
            alt=""
            width={800}
            height={1000}
            decoding="async"
            fetchPriority="high"
          />
        </div>

        <div className="glas__topp">
          <a className="glas__namn" href="#">
            <Logga />
          </a>
        </div>

        <aside className="glas__kort" aria-label={t.hero.kortRubrik}>
          <span className="glas__handtag" aria-hidden="true" />
          <p className="glas__kortrubrik">{t.hero.kortRubrik}</p>
          {kommande()
            .slice(0, 2)
            .map((a) => (
              <button
                key={a.id}
                type="button"
                className="glas__aktivitet"
                onClick={() => oppna(a.id)}
              >
                <span className="glas__typ">
                  <span>{t.aktiviteter.typer[a.typ]}</span>
                  <span>{a.exempel ? te.kalender.exempel : a.tid}</span>
                </span>
                <span className="glas__titel">{a.titel[sprak]}</span>
                <span className="glas__datum">
                  {datumText(a.datum, { weekday: "short", day: "numeric", month: "long" })} ·{" "}
                  {a.tid}
                </span>
              </button>
            ))}
        </aside>

        <div className="glas__text">
          <h1>
            {t.hero.rubrik[0]} <span className="glas__radbryt">{t.hero.rubrik[1]}</span>
          </h1>
          <p>{t.hero.ingress}</p>
          <div className="glas__knappar">
            <a className="glas__knapp glas__knapp--ljus" href="#kommande">
              {t.hero.knappAktiviteter} <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="glas__knapp" href="#kontakt">
              {t.hero.knappKontakt} <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
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
                <a
                  className="btn-base btn-outline erbjudande__knapp"
                  href="#kommande"
                  onClick={() => setTypfilter(e.id)}
                >
                  {t.erbjudanden.knapp}
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      <section className="innehall galleri" aria-labelledby="galleri-rubrik">
        <div className="innehall__inre">
          <p className="overrad">{te.galleri.overrad}</p>
          <h2 id="galleri-rubrik">{te.galleri.rubrik}</h2>
          <p className="ingress">{te.galleri.ingress}</p>
          <div className="galleri__bilder">
            <img
              className="galleri__stor"
              src="/evenemang/publik-salong.webp"
              alt={GALLERI_ALT.publik[sprak]}
              width={1400}
              height={1050}
              loading="lazy"
              decoding="async"
            />
            <img
              src="/evenemang/caroline-pa-scen.webp"
              alt={GALLERI_ALT.scen[sprak]}
              width={768}
              height={1024}
              loading="lazy"
              decoding="async"
            />
            <img
              src="/evenemang/salong-buffe.webp"
              alt={GALLERI_ALT.buffe[sprak]}
              width={768}
              height={1024}
              loading="lazy"
              decoding="async"
            />
          </div>

          <div className="citat" aria-labelledby="citat-rubrik">
            <p className="overrad">{te.citat.overrad}</p>
            <h3 id="citat-rubrik" className="citat__rubrik">
              {te.citat.rubrik}
            </h3>
            <ul className="citat__lista">
              {CITAT.map((c) => (
                <li key={c.namn}>
                  <figure>
                    {c.exempel && <span className="exempel">{te.citat.exempel}</span>}
                    <blockquote>
                      {CITATTECKEN[sprak][0]}
                      {c.text[sprak]}
                      {CITATTECKEN[sprak][1]}
                    </blockquote>
                    <figcaption>
                      {c.namn} · {c.sammanhang[sprak]}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Kalender sprak={sprak} oppna={oppna} filter={typfilter} setFilter={setTypfilter} />

      <Stadsslinga
        sprak={sprak}
        onForfragan={() => {
          minnsOppnare();
          setRundvandringOppen(true);
        }}
      />

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
            <div className="om__text">
              {t.om.text.map((stycke) => (
                <p key={stycke}>{stycke}</p>
              ))}
            </div>
            <a className="om__instagram" href={INSTAGRAM} target="_blank" rel="noopener">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4.2" />
                <circle cx="17.4" cy="6.6" r="1" />
              </svg>
              {t.om.instagram}
            </a>
            <a className="om__tvlank" href={TV_SOKVAG[sprak]}>
              {t.tv.lank} <ArrowRight aria-hidden="true" />
            </a>
          </div>
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
              <Logga storlek="mellan" />
              <p className="sidfot__text">{t.sidfot.text}</p>
              <a className="sidfot__knapp" href="#kontakt">
                {t.sidfot.kontakta} <ArrowRight aria-hidden="true" />
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
              <a href={INSTAGRAM} target="_blank" rel="noopener">
                Instagram
              </a>
              <p className="sidfot__ort">{FORETAG.ort}</p>
            </div>
          </div>
          <div className="sidfot__botten">
            <p>
              © {new Date().getFullYear()} {FORETAG.namn} · {t.sidfot.orgnr} {ORGNR} ·{" "}
              <a href={INTEGRITET_SOKVAG[sprak]}>{INTEGRITET[sprak].lank}</a> · {t.sidfot.kartdata}
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

      <Evenemangsruta sprak={sprak} id={valtEvenemang} stang={stang} />
      <Rundvandringsruta sprak={sprak} oppen={rundvandringOppen} setOppen={setRundvandringOppen} />
    </>
  );
}
