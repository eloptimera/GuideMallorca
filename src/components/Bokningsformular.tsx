import { useState, type FormEvent } from "react";
import { skickaBokning, type Bokning } from "@/lib/bokning";

const TOMT: Bokning = {
  namn: "",
  epost: "",
  telefon: "",
  datum: "",
  antal: "",
  meddelande: "",
  falla: "",
};

/** Bokningsförfrågan för en stadsvandring. Skickas som mejl till Caroline (se lib/bokning.ts). */
export function Bokningsformular() {
  const [svar, setSvar] = useState<Bokning>(TOMT);
  const [lage, setLage] = useState<"redo" | "skickar" | "klart" | "fel">("redo");

  const satt = (nyckel: keyof Bokning) => (e: { target: { value: string } }) =>
    setSvar((s) => ({ ...s, [nyckel]: e.target.value }));

  async function skicka(e: FormEvent) {
    e.preventDefault();
    setLage("skickar");
    try {
      await skickaBokning({ data: svar });
      setLage("klart");
      setSvar(TOMT);
    } catch {
      setLage("fel");
    }
  }

  if (lage === "klart") {
    return (
      <div className="bokning__klart" role="status">
        <h3>Tack, förfrågan är skickad.</h3>
        <p>Caroline återkommer till dig via e-post så snart hon kan.</p>
      </div>
    );
  }

  return (
    <form className="bokning" onSubmit={skicka} noValidate={false}>
      <div className="bokning__rad">
        <label>
          <span>Namn</span>
          <input required autoComplete="name" value={svar.namn} onChange={satt("namn")} />
        </label>
        <label>
          <span>E-post</span>
          <input
            required
            type="email"
            autoComplete="email"
            value={svar.epost}
            onChange={satt("epost")}
          />
        </label>
      </div>
      <div className="bokning__rad bokning__rad--tre">
        <label>
          <span>
            Telefon <em>(valfritt)</em>
          </span>
          <input type="tel" autoComplete="tel" value={svar.telefon} onChange={satt("telefon")} />
        </label>
        <label>
          <span>Önskat datum</span>
          <input placeholder="t.ex. mitten av maj" value={svar.datum} onChange={satt("datum")} />
        </label>
        <label>
          <span>Antal personer</span>
          <input inputMode="numeric" value={svar.antal} onChange={satt("antal")} />
        </label>
      </div>
      <label>
        <span>
          Meddelande <em>(valfritt)</em>
        </span>
        <textarea
          rows={4}
          placeholder="Är ni ett sällskap, en förening eller ett företag? Något särskilt ni vill höra om?"
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
      <div className="bokning__fot">
        <button type="submit" className="btn-base btn-bla" disabled={lage === "skickar"}>
          {lage === "skickar" ? "Skickar…" : "Skicka förfrågan"}
        </button>
        {lage === "fel" && (
          <p className="bokning__fel" role="alert">
            Förfrågan kunde inte skickas just nu. Försök igen om en stund.
          </p>
        )}
      </div>
    </form>
  );
}
