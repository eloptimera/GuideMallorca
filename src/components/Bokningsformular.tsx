import { useState, type FormEvent } from "react";
import { Datumvaljare } from "@/components/Datumvaljare";
import { skickaBokning, type Bokning } from "@/lib/bokning";
import { INTEGRITET, INTEGRITET_SOKVAG } from "@/lib/integritet";
import { TEXTER, type Sprak } from "@/lib/sprak";

/** Raden om integritetspolicyn som står vid varje formulär. */
export function Samtycke({ sprak }: { sprak: Sprak }) {
  const t = INTEGRITET[sprak];
  return (
    <p className="bokning__samtycke">
      {t.samtycke} <a href={INTEGRITET_SOKVAG[sprak]}>{t.lank.toLowerCase()}</a>.
    </p>
  );
}

const TOMT: Omit<Bokning, "sprak"> = {
  namn: "",
  epost: "",
  telefon: "",
  datum: "",
  antal: "",
  meddelande: "",
  falla: "",
};

/**
 * Formuläret som skickas som mejl till Caroline (se lib/bokning.ts).
 * `variant="kontakt"`: allmän fråga, bara namn, e-post och meddelande.
 * `variant="rundvandring"`: förfrågan om rundvandring, med telefon, datum och antal personer.
 */
export function Bokningsformular({
  sprak,
  variant = "kontakt",
}: {
  sprak: Sprak;
  variant?: "kontakt" | "rundvandring";
}) {
  const rundvandring = variant === "rundvandring";
  const t = TEXTER[sprak].formular;
  const [svar, setSvar] = useState(TOMT);
  const [lage, setLage] = useState<"redo" | "skickar" | "klart" | "fel">("redo");

  const satt = (nyckel: keyof typeof TOMT) => (e: { target: { value: string } }) =>
    setSvar((s) => ({ ...s, [nyckel]: e.target.value }));

  async function skicka(e: FormEvent) {
    e.preventDefault();
    setLage("skickar");
    try {
      await skickaBokning({
        data: { ...svar, sprak, evenemang: rundvandring ? "Rundvandring i Palma (förfrågan)" : "" },
      });
      setLage("klart");
      setSvar(TOMT);
    } catch {
      setLage("fel");
    }
  }

  if (lage === "klart") {
    return (
      <div className="bokning__klart" role="status">
        <h3>{t.tackRubrik}</h3>
        <p>{t.tackText}</p>
      </div>
    );
  }

  return (
    <form className="bokning" onSubmit={skicka} noValidate={false}>
      <div className="bokning__rad">
        <label>
          <span>{t.namn}</span>
          <input required autoComplete="name" value={svar.namn} onChange={satt("namn")} />
        </label>
        <label>
          <span>{t.epost}</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={svar.epost}
            onChange={satt("epost")}
          />
        </label>
      </div>
      {rundvandring && (
        <div className="bokning__rad bokning__rad--tre">
          <label>
            <span>
              {t.telefon} <em>{t.valfritt}</em>
            </span>
            <input type="tel" autoComplete="tel" value={svar.telefon} onChange={satt("telefon")} />
          </label>
          <div className="bokning__falt">
            <label htmlFor="bokning-datum">{t.datum}</label>
            <Datumvaljare
              id="bokning-datum"
              sprak={sprak}
              onChange={(datum) => setSvar((s) => ({ ...s, datum }))}
            />
          </div>
          <label>
            <span>{t.antal}</span>
            <input inputMode="numeric" value={svar.antal} onChange={satt("antal")} />
          </label>
        </div>
      )}
      <label>
        <span>
          {t.meddelande} {rundvandring && <em>{t.valfritt}</em>}
        </span>
        <textarea
          rows={4}
          required={!rundvandring}
          placeholder={rundvandring ? t.meddelandeHintRundvandring : t.meddelandeHint}
          value={svar.meddelande}
          onChange={satt("meddelande")}
        />
      </label>
      {/* Fälla för robotar – dold för människor och skärmläsare. */}
      <input
        className="bokning__falla"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        value={svar.falla}
        onChange={satt("falla")}
      />
      <Samtycke sprak={sprak} />
      <div className="bokning__fot">
        <button type="submit" className="btn-base btn-bla" disabled={lage === "skickar"}>
          {lage === "skickar" ? t.skickar : t.skicka}
        </button>
        {lage === "fel" && (
          <p className="bokning__fel" role="alert">
            {t.fel}
          </p>
        )}
      </div>
    </form>
  );
}
