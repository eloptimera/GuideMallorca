// Integritetspolicyn på tre språk. Visas på /integritet, /privacy och /privacidad.
// UTKAST: bolagets registrerade namn och postadress ska bekräftas av Caroline före lansering
// (se LANSERING.md). Lagringstiden (24 månader) är ett förslag som Caroline ska godkänna.
import type { Sprak } from "@/lib/sprak";

export const ORGNR = "556931-6606";
export const INSTAGRAM = "https://www.instagram.com/carolinepalmstierna";

export const INTEGRITET_SOKVAG: Record<Sprak, string> = {
  sv: "/integritet",
  en: "/privacy",
  es: "/privacidad",
};

type Avsnitt = { rubrik: string; text: readonly string[] };
type Policy = {
  titel: string;
  beskrivning: string;
  uppdaterad: string;
  ingress: string;
  avsnitt: readonly Avsnitt[];
  tillbaka: string;
  lank: string;
  samtycke: string;
};

const SV: Policy = {
  titel: "Integritetspolicy",
  beskrivning: "Hur Shoot for the Moon hanterar dina personuppgifter.",
  uppdaterad: "Senast uppdaterad 30 oktober 2026",
  ingress:
    "Jag värnar om din integritet. Här berättar jag vilka uppgifter jag samlar in när du anmäler dig till ett evenemang eller hör av dig, varför jag gör det och vilka rättigheter du har.",
  avsnitt: [
    {
      rubrik: "Vem ansvarar för dina uppgifter",
      text: [
        `Shoot for the Moon, organisationsnummer ${ORGNR}, är personuppgiftsansvarig. Du når mig på caroline@shootforthemoon.se eller +46 70-726 87 78.`,
      ],
    },
    {
      rubrik: "Vilka uppgifter jag samlar in",
      text: [
        "När du anmäler dig till ett evenemang eller skickar en förfrågan sparar jag det du själv fyller i: namn, e-postadress, telefonnummer om du anger det, antal platser, önskat datum och ditt meddelande.",
        "Jag samlar inte in fler uppgifter än jag behöver, och jag ber aldrig om personnummer eller betalkortsuppgifter via sajten.",
      ],
    },
    {
      rubrik: "Varför jag använder uppgifterna",
      text: [
        "För att hantera din anmälan eller förfrågan: bekräfta din plats, skicka adress och betalningsinformation, svara på dina frågor och meddela dig om något ändras.",
        "Den rättsliga grunden är att fullgöra det du har bett om (avtal) och mitt berättigade intresse av att kunna svara dig. Jag skickar inga nyhetsbrev eller annan marknadsföring utan att du uttryckligen har sagt ja.",
      ],
    },
    {
      rubrik: "Hur länge jag sparar uppgifterna",
      text: [
        "Jag sparar uppgifterna så länge det behövs för att hantera din anmälan eller förfrågan, och därefter högst 24 månader. Uppgifter som krävs för bokföring sparas så länge lagen kräver.",
      ],
    },
    {
      rubrik: "Vilka som får ta del av uppgifterna",
      text: [
        "Jag säljer aldrig dina uppgifter. För att sajten och formulären ska fungera anlitar jag tjänsteleverantörer som behandlar uppgifter för min räkning: Vercel (drift av sajten) och Resend (utskick av e-post). Leverantörerna kan behandla uppgifter utanför EU/EES, och då sker det med EU-kommissionens standardavtalsklausuler som skydd.",
      ],
    },
    {
      rubrik: "Cookies och besöksstatistik",
      text: [
        "Sajten använder inga cookies för spårning eller marknadsföring. Besöksstatistiken är cookiefri och anonym. Kartan hämtar kartbilder från OpenFreeMap, vilket innebär att din IP-adress skickas till dem när kartan visas.",
      ],
    },
    {
      rubrik: "Dina rättigheter",
      text: [
        "Du har rätt att få veta vilka uppgifter jag har om dig, att få dem rättade eller raderade, att begränsa eller invända mot behandlingen och att få ut dem i ett maskinläsbart format. Skriv till caroline@shootforthemoon.se så hjälper jag dig.",
        "Om du tycker att jag hanterar dina uppgifter fel kan du lämna klagomål till Integritetsskyddsmyndigheten (IMY), imy.se.",
      ],
    },
  ],
  tillbaka: "Till startsidan",
  lank: "Integritetspolicy",
  samtycke: "När du skickar formuläret hanteras dina uppgifter enligt min",
};

const EN: Policy = {
  titel: "Privacy policy",
  beskrivning: "How Shoot for the Moon handles your personal data.",
  uppdaterad: "Last updated 30 October 2026",
  ingress:
    "I care about your privacy. Here I explain what information I collect when you sign up for an event or get in touch, why I do it and what rights you have.",
  avsnitt: [
    {
      rubrik: "Who is responsible for your data",
      text: [
        `Shoot for the Moon, Swedish company registration number ${ORGNR}, is the data controller. You can reach me at caroline@shootforthemoon.se or +46 70-726 87 78.`,
      ],
    },
    {
      rubrik: "What I collect",
      text: [
        "When you sign up for an event or send an enquiry, I keep what you fill in yourself: your name, email address, phone number if you give it, number of seats, preferred date and your message.",
        "I don't collect more than I need, and I never ask for ID numbers or card details through the website.",
      ],
    },
    {
      rubrik: "Why I use it",
      text: [
        "To handle your sign-up or enquiry: confirm your seat, send the address and payment details, answer your questions and let you know if anything changes.",
        "The legal basis is carrying out what you have asked for (contract) and my legitimate interest in being able to reply to you. I never send newsletters or other marketing unless you have explicitly said yes.",
      ],
    },
    {
      rubrik: "How long I keep it",
      text: [
        "I keep your data for as long as needed to handle your sign-up or enquiry, and after that for no more than 24 months. Information required for accounting is kept for as long as the law requires.",
      ],
    },
    {
      rubrik: "Who receives it",
      text: [
        "I never sell your data. To run the website and the forms I use service providers that process data on my behalf: Vercel (website hosting) and Resend (sending email). They may process data outside the EU/EEA, in which case the European Commission's standard contractual clauses apply.",
      ],
    },
    {
      rubrik: "Cookies and visitor statistics",
      text: [
        "The website uses no tracking or marketing cookies. Visitor statistics are cookie-free and anonymous. The map loads map images from OpenFreeMap, which means your IP address is sent to them when the map is shown.",
      ],
    },
    {
      rubrik: "Your rights",
      text: [
        "You have the right to know what data I hold about you, to have it corrected or deleted, to restrict or object to its use, and to receive it in a machine-readable format. Write to caroline@shootforthemoon.se and I will help you.",
        "If you think I am handling your data incorrectly, you can complain to the Swedish Authority for Privacy Protection (IMY), imy.se.",
      ],
    },
  ],
  tillbaka: "Back to the homepage",
  lank: "Privacy policy",
  samtycke: "When you send the form, your data is handled according to my",
};

const ES: Policy = {
  titel: "Política de privacidad",
  beskrivning: "Cómo trata Shoot for the Moon tus datos personales.",
  uppdaterad: "Última actualización: 30 de octubre de 2026",
  ingress:
    "Me importa tu privacidad. Aquí explico qué datos recojo cuando te inscribes a un evento o me escribes, por qué lo hago y qué derechos tienes.",
  avsnitt: [
    {
      rubrik: "Quién es responsable de tus datos",
      text: [
        `Shoot for the Moon, con número de registro sueco ${ORGNR}, es la responsable del tratamiento. Puedes contactarme en caroline@shootforthemoon.se o en el +46 70-726 87 78.`,
      ],
    },
    {
      rubrik: "Qué datos recojo",
      text: [
        "Cuando te inscribes a un evento o envías una consulta, guardo lo que tú mismo rellenas: nombre, correo electrónico, teléfono si lo indicas, número de plazas, fecha deseada y tu mensaje.",
        "No recojo más datos de los necesarios y nunca pido documentos de identidad ni datos de tarjeta a través de la web.",
      ],
    },
    {
      rubrik: "Para qué los uso",
      text: [
        "Para gestionar tu inscripción o consulta: confirmar tu plaza, enviarte la dirección y los datos de pago, responder a tus preguntas y avisarte si algo cambia.",
        "La base legal es cumplir lo que me has pedido (contrato) y mi interés legítimo en poder responderte. Nunca envío boletines ni publicidad sin que hayas dado tu consentimiento expreso.",
      ],
    },
    {
      rubrik: "Cuánto tiempo los guardo",
      text: [
        "Guardo los datos el tiempo necesario para gestionar tu inscripción o consulta y, después, un máximo de 24 meses. Los datos necesarios para la contabilidad se guardan el tiempo que exige la ley.",
      ],
    },
    {
      rubrik: "Quién recibe los datos",
      text: [
        "Nunca vendo tus datos. Para que la web y los formularios funcionen utilizo proveedores que tratan datos por encargo mío: Vercel (alojamiento de la web) y Resend (envío de correos). Pueden tratar datos fuera de la UE/EEE, en cuyo caso se aplican las cláusulas contractuales tipo de la Comisión Europea.",
      ],
    },
    {
      rubrik: "Cookies y estadísticas de visitas",
      text: [
        "La web no utiliza cookies de seguimiento ni de publicidad. Las estadísticas de visitas son anónimas y sin cookies. El mapa carga imágenes de OpenFreeMap, por lo que tu dirección IP se envía a ese servicio cuando se muestra el mapa.",
      ],
    },
    {
      rubrik: "Tus derechos",
      text: [
        "Tienes derecho a saber qué datos tengo sobre ti, a que se corrijan o se supriman, a limitar u oponerte a su tratamiento y a recibirlos en un formato legible por máquina. Escríbeme a caroline@shootforthemoon.se y te ayudaré.",
        "Si crees que trato tus datos de forma incorrecta, puedes presentar una reclamación ante la autoridad sueca de protección de datos (IMY), imy.se, o ante la Agencia Española de Protección de Datos (AEPD), aepd.es.",
      ],
    },
  ],
  tillbaka: "Volver a la página de inicio",
  lank: "Política de privacidad",
  samtycke: "Al enviar el formulario, tus datos se tratan según mi",
};

export const INTEGRITET: Record<Sprak, Policy> = { sv: SV, en: EN, es: ES };
