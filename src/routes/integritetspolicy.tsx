import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/Heading";
import { FORETAG } from "@/lib/foretag";
import { AKTIVA_VERKTYG, BEHOVER_SAMTYCKE, KATEGORIER, oppnaInstallningar } from "@/lib/samtycke";
import { sidhuvud } from "@/lib/seo";

export const Route = createFileRoute("/integritetspolicy")({
  head: () =>
    sidhuvud({
      titel: "Integritetspolicy",
      beskrivning: `Så behandlar ${FORETAG.namn} (${FORETAG.juridisktNamn}) dina personuppgifter när du bokar en genomgång eller kontaktar oss.`,
      sokvag: "/integritetspolicy",
    }),
  component: Integritetspolicy,
});

function Sektion({
  titel,
  id,
  children,
}: {
  titel: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-28">
      <h2 className="text-2xl text-ink">{titel}</h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Integritetspolicy() {
  return (
    <>
      <PageHero
        eyebrow="Integritetspolicy"
        title="Så hanterar vi dina personuppgifter"
        intro="Här beskriver vi vilka personuppgifter vi samlar in via den här webbplatsen, varför, och vilka rättigheter du har enligt dataskyddsförordningen (GDPR)."
      />
      <article className="container-page max-w-3xl pt-4 pb-24">
        <Sektion titel="Personuppgiftsansvarig">
          <p>
            {FORETAG.juridisktNamn}
            {FORETAG.orgnr && `, org.nr ${FORETAG.orgnr}`}
            {FORETAG.adress && `, ${FORETAG.adress}`}, som driver {FORETAG.namn}, är
            personuppgiftsansvarig för behandlingen. Du når oss via{" "}
            <Link className="font-bold text-ink underline decoration-guld" to="/kontakt">
              kontaktformuläret
            </Link>
            {FORETAG.epost && ` eller på ${FORETAG.epost}`}
            {FORETAG.telefon && ` eller ${FORETAG.telefon}`}.
          </p>
        </Sektion>

        <Sektion titel="Vilka uppgifter vi samlar in">
          <p>Vi samlar bara in det du själv skriver i bokningsformuläret:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>
              <strong className="font-medium text-foreground">Bokningsformuläret:</strong> namn,
              företag, e-post, telefonnummer, er hemsida, vilka tjänster eller paket ni är
              intresserade av och ditt meddelande.
            </li>
          </ul>
          <p>
            Om du ringer eller mejlar oss direkt behandlar vi de uppgifter du lämnar där på samma
            sätt.
          </p>
        </Sektion>

        <Sektion titel="Varför vi behandlar uppgifterna">
          <p>
            Vi använder uppgifterna för att svara på din fråga och ta fram en offert. Rättslig grund
            är att det behövs för att vidta åtgärder på din begäran innan ett avtal ingås, och
            därefter för att fullgöra avtalet. Om du blir kund sparar vi även underlag som vi är
            skyldiga att bevara enligt bokföringslagen.
          </p>
          <p>Vi säljer inte dina uppgifter och skickar inte nyhetsbrev utan att du bett om det.</p>
        </Sektion>

        <Sektion titel="Hur länge vi sparar dem">
          <p>
            Vi sparar en förfrågan så länge den är aktuell. Blir det ingen affär raderar vi den när
            vi inte längre har anledning att spara den. Uppgifter som ingår i bokföringen sparas i
            den tid lagen kräver.
          </p>
        </Sektion>

        <Sektion titel="Vem som får ta del av uppgifterna">
          <p>
            Uppgifterna hanteras av oss och av de tjänsteleverantörer vi använder för att driva
            webbplatsen och ta emot förfrågningar, som behandlar uppgifterna för vår räkning.
            Förfrågningar från bokningsformuläret skickas till oss som mejl via en e-posttjänst.
            Webbplatsen driftas hos en hostingleverantör som kan se teknisk trafikdata som
            IP-adress. Utöver det lämnar vi bara ut uppgifter om lag kräver det.
          </p>
        </Sektion>

        <Sektion titel="Cookies och statistik" id="cookies">
          <p>
            Vi använder Vercel Web Analytics för besöksstatistik. Den sätter inga cookies och sparar
            inga uppgifter som kan identifiera dig. Vi ser bara sammanställda siffror, till exempel
            hur många som besökt en sida och vilka knappar som klickats på. Rättslig grund är vårt
            berättigade intresse av att förstå hur webbplatsen används och göra den bättre.
          </p>
          {BEHOVER_SAMTYCKE ? (
            <>
              <p>Om du säger ja i vår cookieruta använder vi också:</p>
              <ul className="list-disc space-y-3 pl-6">
                {AKTIVA_VERKTYG.map((v) => (
                  <li key={v.id}>
                    <strong className="font-medium text-foreground">{v.namn}</strong> (
                    {KATEGORIER[v.kategori].namn.toLowerCase()}, {v.leverantor}): {v.syfte} Cookies
                    sparas i {v.lagring.toLowerCase()}.
                  </li>
                ))}
              </ul>
              <p>
                Rättslig grund är ditt samtycke. Inget av verktygen startar innan du sagt ja.
                Leverantörerna kan föra över uppgifter till USA och är anslutna till EU–US Data
                Privacy Framework. Ditt val sparas i din webbläsare så att vi inte behöver fråga
                igen.
              </p>
              <p>
                Du kan ändra eller ta tillbaka ditt samtycke när som helst under{" "}
                <button
                  type="button"
                  onClick={oppnaInstallningar}
                  className="font-bold text-ink underline decoration-guld"
                >
                  Cookieinställningar
                </button>
                , som också finns längst ner på varje sida.
              </p>
            </>
          ) : (
            <p>
              Vi använder inga cookies för statistik eller marknadsföring. Ändrar vi det frågar vi
              om ditt samtycke först och uppdaterar den här sidan.
            </p>
          )}
        </Sektion>

        <Sektion titel="Dina rättigheter">
          <p>Du har rätt att:</p>
          <ul className="list-disc space-y-1 pl-6">
            <li>få veta vilka uppgifter vi har om dig och få en kopia,</li>
            <li>få felaktiga uppgifter rättade,</li>
            <li>begära att uppgifterna raderas eller att behandlingen begränsas,</li>
            <li>invända mot behandling som grundas på berättigat intresse.</li>
          </ul>
          <p>
            Kontakta oss så hjälper vi dig. Du har också rätt att klaga hos{" "}
            <a
              className="font-bold text-ink underline decoration-guld"
              href="https://www.imy.se"
              target="_blank"
              rel="noopener noreferrer"
            >
              Integritetsskyddsmyndigheten (IMY)
            </a>
            .
          </p>
        </Sektion>

        <p className="mt-14 text-sm text-muted-foreground">
          Har du frågor?{" "}
          <Link to="/kontakt" className="font-bold text-ink underline decoration-guld">
            Kontakta oss
          </Link>
          .
        </p>
      </article>
    </>
  );
}
