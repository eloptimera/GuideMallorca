import { createFileRoute } from "@tanstack/react-router";
import { Bokningsformular } from "@/components/Bokningsformular";
import { Stadsslinga } from "@/components/Stadsslinga";
import { FORETAG } from "@/lib/foretag";
import { sidhuvud } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    sidhuvud({
      titel: "Stadsvandringar i Palma med Caroline Palmstierna",
      beskrivning: FORETAG.beskrivning,
      sokvag: "/",
    }),
  component: Start,
});

// Texterna nedan bygger på underlaget om Caroline. Låt henne läsa och godkänna dem innan
// sajten publiceras på riktigt – särskilt avsnittet om salongskvällarna.
const PELARE = [
  {
    rubrik: "Berättelser, inte årtal",
    text: "Vandringen handlar mindre om byggnadsstilar och mer om människorna. Caroline knyter ihop Spaniens nutidshistoria, dagens lokalpolitik och anekdoterna som får staden att bli begriplig.",
  },
  {
    rubrik: "Kvinnorna bakom Mallorca",
    text: "Många turer har ett tydligt fokus på kvinnorna i öns historia – de kända och de bortglömda – och på hur de har format Mallorca.",
  },
  {
    rubrik: "Bakom fasaderna",
    text: "Promenaden går genom Palmas historiska gator, in på innergårdar och förbi kyrkor och arkitektur som de flesta besökare missar.",
  },
] as const;

function Start() {
  return (
    <>
      <Stadsslinga />

      <section className="innehall om" id="om-caroline" aria-labelledby="om-rubrik">
        <div className="innehall__inre om__inre">
          <p className="overrad">Din guide</p>
          <h2 id="om-rubrik">Caroline Palmstierna</h2>
          <p className="ingress">Journalist och Spanienexpert, bosatt på Mallorca.</p>
          <div className="om__text">
            <p>
              Caroline är svensk journalist med djup förankring i det spanska och mallorcanska
              samhället. I Palmas kulturliv leder hon boksamtal, håller föreläsningar och samarbetar
              med nätverk som SWEA Mallorca.
            </p>
            <p>
              Hon delar med sig av spansk historia, lokalpolitik, kultur och det genuina
              mallorcanska hantverket – och är den som kan förklara varför staden ser ut som den
              gör.
            </p>
          </div>
        </div>
      </section>

      <section
        className="innehall vandringar"
        id="stadsvandringar"
        aria-labelledby="vandring-rubrik"
      >
        <div className="innehall__inre">
          <p className="overrad">Stadsvandringarna</p>
          <h2 id="vandring-rubrik">Historia, nutid och politik – till fots</h2>
          <ol className="pelare">
            {PELARE.map((p, i) => (
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
            <p className="overrad">Praktiskt</p>
            <h2 id="praktiskt-rubrik">Så går det till</h2>
          </div>
          <dl className="fakta">
            <div>
              <dt>Längd</dt>
              <dd>Cirka två timmar, i lugnt promenadtempo.</dd>
            </div>
            <div>
              <dt>Var</dt>
              <dd>Palmas historiska kvarter, gränder och innergårdar.</dd>
            </div>
            <div>
              <dt>Avslutning</dt>
              <dd>
                Ofta en salongskväll i kvarnkvarteret Es Jonquet, med förfriskningar, lokalt
                tilltugg och samtal i en personlig miljö.
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="innehall boka" id="boka" aria-labelledby="boka-rubrik">
        <div className="innehall__inre boka__inre">
          <div>
            <p className="overrad">Boka</p>
            <h2 id="boka-rubrik">Boka en stadsvandring</h2>
            <p className="ingress">
              Berätta när ni vill gå och hur många ni är, så återkommer Caroline med förslag.
            </p>
          </div>
          <Bokningsformular />
        </div>
      </section>

      <footer className="sidfot">
        <p>{FORETAG.namn} · Stadsvandringar i Palma med Caroline Palmstierna</p>
        <p className="sidfot__kalla">
          Kartdata © OpenStreetMap-bidragsgivare · OpenMapTiles · OpenFreeMap
        </p>
      </footer>
    </>
  );
}
