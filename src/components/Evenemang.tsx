import { useEffect, useMemo, useState, type FormEvent } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { skickaBokning } from "@/lib/bokning";
import { EVENEMANG_TEXTER } from "@/lib/evenemangtexter";
import { kommande, type Aktivitet } from "@/lib/innehall";
import { SPRAKKOD, TEXTER, type Sprak } from "@/lib/sprak";

// Kalendern med kommande evenemang och rutan som öppnas när man väljer ett evenemang.
// Varje evenemang har en egen länk (#evenemang-<id>) så att Caroline kan dela just den kvällen.
// Anmälan skickas som mejl till Caroline via samma väg som kontaktformuläret (lib/bokning.ts).

const PREFIX = "#evenemang-";

/** Delat tillstånd: vilket evenemang som är öppet, synkat med adressens #. */
export function useValtEvenemang() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const lasHash = () => {
      const h = window.location.hash;
      setId(h.startsWith(PREFIX) ? decodeURIComponent(h.slice(PREFIX.length)) : null);
    };
    lasHash();
    window.addEventListener("hashchange", lasHash);
    return () => window.removeEventListener("hashchange", lasHash);
  }, []);

  const oppna = (nytt: string) => {
    history.replaceState(null, "", `${PREFIX}${nytt}`);
    setId(nytt);
  };
  const stang = () => {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    setId(null);
  };
  return { id, oppna, stang };
}

function datumDel(sprak: Sprak, iso: string, alt: Intl.DateTimeFormatOptions) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString(SPRAKKOD[sprak].html, alt);
}

function Exempel({ text }: { text: string }) {
  return <span className="exempel">{text}</span>;
}

/* ---------- Kalendern ---------- */

export function Kalender({ sprak, oppna }: { sprak: Sprak; oppna: (id: string) => void }) {
  const t = EVENEMANG_TEXTER[sprak].kalender;
  const typer = TEXTER[sprak].aktiviteter.typer;
  const lista = useMemo(() => kommande(), []);
  const locale = SPRAKKOD[sprak].html;

  // Börja på månaden för nästa evenemang (eller den här månaden om inget finns).
  const start = lista[0]?.datum ?? new Date().toISOString().slice(0, 10);
  const [manad, setManad] = useState(() => {
    const [a, m] = start.split("-").map(Number);
    return { ar: a!, man: m! - 1 };
  });

  const manadsNamn = new Date(manad.ar, manad.man, 1).toLocaleDateString(locale, {
    month: "long",
    year: "numeric",
  });
  const iManaden = lista.filter((a) => {
    const [ar, m] = a.datum.split("-").map(Number);
    return ar === manad.ar && m! - 1 === manad.man;
  });
  const perDag = new Map<number, Aktivitet[]>();
  for (const a of iManaden) {
    const dag = Number(a.datum.slice(8, 10));
    perDag.set(dag, [...(perDag.get(dag) ?? []), a]);
  }

  // Måndag först. Veckodagarnas namn i besökarens språk.
  const forstaVeckodag = (new Date(manad.ar, manad.man, 1).getDay() + 6) % 7;
  const dagar = new Date(manad.ar, manad.man + 1, 0).getDate();
  const veckodagar = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" }),
  );
  const idag = new Date();
  const arIdag = (d: number) =>
    idag.getFullYear() === manad.ar && idag.getMonth() === manad.man && idag.getDate() === d;

  const flytta = (steg: number) =>
    setManad(({ ar, man }) => {
      const n = new Date(ar, man + steg, 1);
      return { ar: n.getFullYear(), man: n.getMonth() };
    });

  return (
    <section className="innehall kalender" id="kommande" aria-labelledby="kalender-rubrik">
      <div className="innehall__inre">
        <p className="overrad">{t.overrad}</p>
        <h2 id="kalender-rubrik">{t.rubrik}</h2>
        <p className="ingress">{t.ingress}</p>
        {lista.some((a) => a.exempel) && <p className="kalender__notis">{t.exempelNotis}</p>}

        <div className="kalender__inre">
          <div className="kalender__man">
            <div className="kalender__huvud">
              <button type="button" onClick={() => flytta(-1)} aria-label={t.forra}>
                <ChevronLeft aria-hidden="true" />
              </button>
              <p aria-live="polite">{manadsNamn}</p>
              <button type="button" onClick={() => flytta(1)} aria-label={t.nasta}>
                <ChevronRight aria-hidden="true" />
              </button>
            </div>
            <div className="kalender__rutnat" role="grid" aria-label={manadsNamn}>
              {veckodagar.map((v) => (
                <span key={v} className="kalender__veckodag" role="columnheader">
                  {v}
                </span>
              ))}
              {Array.from({ length: forstaVeckodag }, (_, i) => (
                <span key={`tom-${i}`} aria-hidden="true" />
              ))}
              {Array.from({ length: dagar }, (_, i) => {
                const dag = i + 1;
                const ev = perDag.get(dag);
                if (!ev) {
                  return (
                    <span
                      key={dag}
                      className={
                        arIdag(dag) ? "kalender__dag kalender__dag--idag" : "kalender__dag"
                      }
                    >
                      {dag}
                    </span>
                  );
                }
                return (
                  <button
                    key={dag}
                    type="button"
                    className="kalender__dag kalender__dag--evenemang"
                    onClick={() => oppna(ev[0]!.id)}
                    aria-label={`${dag} ${manadsNamn}: ${ev.map((e) => e.titel[sprak]).join(", ")}`}
                  >
                    {dag}
                  </button>
                );
              })}
            </div>
          </div>

          <ul className="kalender__lista">
            {iManaden.length === 0 && <li className="kalender__tom">{t.ingaIManaden}</li>}
            {iManaden.map((a) => (
              <li key={a.id}>
                <button type="button" className="evenemang" onClick={() => oppna(a.id)}>
                  <span className="evenemang__datum">
                    <span className="evenemang__dag">
                      {datumDel(sprak, a.datum, { day: "numeric" })}
                    </span>
                    <span className="evenemang__manad">
                      {datumDel(sprak, a.datum, { month: "short" })}
                    </span>
                  </span>
                  <span className="evenemang__text">
                    <span className="evenemang__typ">
                      {typer[a.typ]} · {datumDel(sprak, a.datum, { weekday: "long" })} {a.tid}
                      {a.exempel && <Exempel text={t.exempel} />}
                    </span>
                    <span className="evenemang__titel">{a.titel[sprak]}</span>
                    <span className="evenemang__ingress">{a.ingress[sprak]}</span>
                    <span className="evenemang__fot">
                      <span
                        className={
                          a.platserKvar === 0
                            ? "evenemang__platser evenemang__platser--slut"
                            : "evenemang__platser"
                        }
                      >
                        {a.platserKvar === 0 ? t.fullbokat : t.platserKvar(a.platserKvar)}
                      </span>
                      <span className="evenemang__las">
                        {t.lasMer} <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ---------- Evenemangsrutan med anmälan ---------- */

export function Evenemangsruta({
  sprak,
  id,
  stang,
}: {
  sprak: Sprak;
  id: string | null;
  stang: () => void;
}) {
  const a = id ? kommande("0000-00-00").find((x) => x.id === id) : undefined;
  return (
    <Dialog.Root open={!!a} onOpenChange={(o) => !o && stang()}>
      <Dialog.Portal>
        <Dialog.Overlay className="ruta__bakgrund" />
        {a && <RutaInnehall key={a.id} sprak={sprak} a={a} />}
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function RutaInnehall({ sprak, a }: { sprak: Sprak; a: Aktivitet }) {
  const t = EVENEMANG_TEXTER[sprak];
  const typer = TEXTER[sprak].aktiviteter.typer;
  const slut = a.platserKvar === 0;
  const maxPlatser = slut ? 6 : Math.min(6, a.platserKvar);
  const datumLang = datumDel(sprak, a.datum, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const [svar, setSvar] = useState({
    namn: "",
    epost: "",
    telefon: "",
    antal: "1",
    meddelande: "",
    falla: "",
  });
  const [lage, setLage] = useState<"redo" | "skickar" | "klart" | "utkast" | "fel">("redo");
  const [kopierad, setKopierad] = useState(false);
  const satt = (k: keyof typeof svar) => (e: { target: { value: string } }) =>
    setSvar((s) => ({ ...s, [k]: e.target.value }));

  async function skicka(e: FormEvent) {
    e.preventDefault();
    setLage("skickar");
    // Utkast: exempel-evenemang skickar ingenting, så att man kan prova hela flödet.
    if (a.exempel) {
      await new Promise((r) => setTimeout(r, 500));
      setLage("utkast");
      return;
    }
    try {
      // Mejlet till Caroline skrivs alltid på svenska, oavsett besökarens språk.
      const evenemang = `${a.titel.sv} – ${datumDel("sv", a.datum, { weekday: "long", day: "numeric", month: "long" })} kl. ${a.tid}${slut ? " (VÄNTELISTA)" : ""}${a.exempel ? " [EXEMPEL-EVENEMANG]" : ""}`;
      await skickaBokning({
        data: {
          namn: svar.namn,
          epost: svar.epost,
          telefon: svar.telefon,
          datum: a.datum,
          antal: svar.antal,
          meddelande: svar.meddelande,
          falla: svar.falla,
          sprak,
          evenemang,
        },
      });
      setLage("klart");
    } catch {
      setLage("fel");
    }
  }

  async function kopiera() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setKopierad(true);
      setTimeout(() => setKopierad(false), 2000);
    } catch {
      /* urklipp kan vara blockerat – inget att göra */
    }
  }

  return (
    <Dialog.Content className="ruta" aria-describedby={`ruta-ingress-${a.id}`}>
      <div className="ruta__bild">
        <img src={a.bild.src} alt={a.bild.alt[sprak]} width={800} height={600} />
        {a.exempel && <Exempel text={t.kalender.exempel} />}
      </div>
      <Dialog.Close className="ruta__stang" aria-label={t.ruta.stang}>
        <X aria-hidden="true" />
      </Dialog.Close>

      <div className="ruta__inre">
        <p className="evenemang__typ">{typer[a.typ]}</p>
        <Dialog.Title className="ruta__titel">{a.titel[sprak]}</Dialog.Title>
        <p className="ruta__ingress" id={`ruta-ingress-${a.id}`}>
          {a.ingress[sprak]}
        </p>

        <dl className="ruta__fakta">
          <div>
            <dt>{t.ruta.datum}</dt>
            <dd>{datumLang}</dd>
          </div>
          <div>
            <dt>{t.ruta.tid}</dt>
            <dd>
              {a.tid} · {a.langd[sprak]}
            </dd>
          </div>
          <div>
            <dt>{t.ruta.plats}</dt>
            <dd>{a.plats[sprak]}</dd>
          </div>
          <div>
            <dt>{t.ruta.pris}</dt>
            <dd>{a.pris[sprak]}</dd>
          </div>
          <div>
            <dt>{t.ruta.sprak}</dt>
            <dd>{a.sprak[sprak]}</dd>
          </div>
          <div>
            <dt>{t.ruta.platser}</dt>
            <dd className={slut ? "ruta__slut" : undefined}>
              {slut ? t.kalender.fullbokat : t.kalender.platserKvar(a.platserKvar)}
            </dd>
          </div>
        </dl>

        <p className="ruta__text">{a.text[sprak]}</p>

        <button type="button" className="ruta__dela" onClick={kopiera}>
          {kopierad ? t.ruta.kopierad : t.ruta.delaLank}
        </button>

        <div className="ruta__anmalan">
          {lage === "klart" || lage === "utkast" ? (
            <div role="status">
              <h3>{t.ruta.tackRubrik}</h3>
              <p>{t.ruta.tackText}</p>
              {lage === "utkast" && <p className="kalender__notis">{t.ruta.utkastSkickat}</p>}
            </div>
          ) : (
            <form className="bokning" onSubmit={skicka}>
              <h3>{slut ? t.ruta.vantelista : t.ruta.anmalRubrik}</h3>
              <p className="ruta__anmalingress">
                {slut ? t.ruta.fullbokatText : t.ruta.anmalIngress}
              </p>
              <div className="bokning__rad">
                <label>
                  <span>{t.ruta.namn}</span>
                  <input required autoComplete="name" value={svar.namn} onChange={satt("namn")} />
                </label>
                <label>
                  <span>{t.ruta.epost}</span>
                  <input
                    required
                    type="email"
                    autoComplete="email"
                    value={svar.epost}
                    onChange={satt("epost")}
                  />
                </label>
              </div>
              <div className="bokning__rad">
                <label>
                  <span>
                    {t.ruta.telefon} <em>{t.ruta.valfritt}</em>
                  </span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={svar.telefon}
                    onChange={satt("telefon")}
                  />
                </label>
                <label>
                  <span>{t.ruta.antal}</span>
                  <select value={svar.antal} onChange={satt("antal")}>
                    {Array.from({ length: maxPlatser }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        {i + 1}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                <span>
                  {t.ruta.meddelande} <em>{t.ruta.valfritt}</em>
                </span>
                <textarea rows={2} value={svar.meddelande} onChange={satt("meddelande")} />
              </label>
              <input
                className="bokning__falla"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={svar.falla}
                onChange={satt("falla")}
              />
              <div className="bokning__fot">
                <button type="submit" className="btn-base btn-bla" disabled={lage === "skickar"}>
                  {lage === "skickar" ? t.ruta.skickar : slut ? t.ruta.vantelista : t.ruta.skicka}
                </button>
                {lage === "fel" && (
                  <p className="bokning__fel" role="alert">
                    {t.ruta.fel}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </Dialog.Content>
  );
}
