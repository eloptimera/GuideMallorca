// Sajtens tre språk och alla texter som syns på sidan. Stoppens texter ligger i
// src/lib/slinga/stopp.ts. Svenska är originalet; engelska och spanska är översättningar –
// låt gärna Caroline läsa dem innan sajten används skarpt.

export const SPRAK = ["sv", "en", "es"] as const;
export type Sprak = (typeof SPRAK)[number];

/** Sökväg till startsidan på ett visst språk. */
export const sprakSokvag = (s: Sprak) => (s === "sv" ? "/" : `/${s}`);

/** För <html lang>, og:locale och hreflang. */
export const SPRAKKOD: Record<Sprak, { html: string; locale: string; namn: string }> = {
  sv: { html: "sv", locale: "sv_SE", namn: "Svenska" },
  en: { html: "en", locale: "en_GB", namn: "English" },
  es: { html: "es", locale: "es_ES", namn: "Español" },
};

/** Språket för en sökväg (/en → en, /es → es, allt annat → sv). */
export function sprakFor(sokvag: string): Sprak {
  const forsta = sokvag.split("/")[1];
  return forsta === "en" || forsta === "es" ? forsta : "sv";
}

type Texter = {
  meta: { titel: string; beskrivning: string; bildAlt: string };
  slinga: {
    etikett: string;
    overrad: string;
    rubrik: [string, string];
    med: string;
    stopp: (nr: number, av: number) => string;
    slutEtikett: string;
    boka: string;
    ledtrad: string;
  };
  om: {
    overrad: string;
    ingress: string;
    text: [string, string];
    bildAlt: string;
  };
  vandringar: {
    overrad: string;
    rubrik: string;
    pelare: readonly { rubrik: string; text: string }[];
  };
  praktiskt: {
    overrad: string;
    rubrik: string;
    fakta: readonly { etikett: string; text: string }[];
  };
  fragor: {
    overrad: string;
    rubrik: string;
    lista: readonly string[];
    platshallare: string;
  };
  boka: {
    overrad: string;
    rubrik: string;
    ingress: string;
    direkt: string;
    epost: string;
    telefon: string;
  };
  formular: {
    namn: string;
    epost: string;
    telefon: string;
    valfritt: string;
    datum: string;
    valjDatum: string;
    rensaDatum: string;
    antal: string;
    meddelande: string;
    meddelandeHint: string;
    skicka: string;
    skickar: string;
    fel: string;
    tackRubrik: string;
    tackText: string;
  };
  sidfot: {
    text: string;
    boka: string;
    sidor: string;
    lankar: readonly [string, string][];
    kontakt: string;
    kartdata: string;
    byggd: string;
  };
  sprakval: string;
};

const SV: Texter = {
  meta: {
    titel: "Stadsvandringar i Palma med Caroline Palmstierna",
    beskrivning:
      "Guidade stadsvandringar i Palma de Mallorca med journalisten och Spanienexperten Caroline Palmstierna – historia, nutid och politik bortom turiststråken.",
    bildAlt:
      "Guidad rundvandring i Palma med Caroline Palmstierna – karta över rutten genom gamla stan",
  },
  slinga: {
    etikett: "Stadsvandringens rutt genom Palma",
    overrad: "Ca två timmar till fots",
    rubrik: ["Guidad rundvandring", "i Palma"],
    med: "med Caroline Palmstierna",
    stopp: (nr, av) => `Stopp ${nr} av ${av}`,
    slutEtikett: "Ca 2 timmar",
    boka: "Boka en vandring",
    ledtrad: "Scrolla för att gå rutten",
  },
  om: {
    overrad: "Din guide",
    ingress: "Journalist och Spanienexpert, bosatt på Mallorca.",
    text: [
      "Caroline är svensk journalist med djup förankring i det spanska och mallorcanska samhället. I Palmas kulturliv leder hon boksamtal, håller föreläsningar och samarbetar med nätverk som SWEA Mallorca.",
      "Hon delar med sig av spansk historia, lokalpolitik, kultur och det genuina mallorcanska hantverket – och är den som kan förklara varför staden ser ut som den gör.",
    ],
    bildAlt: "Caroline Palmstierna, leende med en blombukett",
  },
  vandringar: {
    overrad: "Stadsvandringarna",
    rubrik: "Historia, nutid och politik – till fots",
    pelare: [
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
    ],
  },
  praktiskt: {
    overrad: "Praktiskt",
    rubrik: "Så går det till",
    fakta: [
      { etikett: "Längd", text: "Cirka två timmar, i lugnt promenadtempo." },
      { etikett: "Var", text: "Palmas historiska kvarter, gränder och innergårdar." },
      {
        etikett: "Avslutning",
        text: "Ofta en salongskväll i kvarnkvarteret Es Jonquet, med förfriskningar, lokalt tilltugg och samtal i en personlig miljö.",
      },
    ],
  },
  fragor: {
    overrad: "Vanliga frågor",
    rubrik: "Bra att veta",
    lista: [
      "Vilket språk sker guidningen på?",
      "Hur bokar och betalar man?",
      "Vad händer vid dåligt väder?",
      "Är turen tillgänglighetsanpassad?",
      "Vad är avbokningsreglerna?",
    ],
    platshallare: "Caroline får fylla i",
  },
  boka: {
    overrad: "Boka",
    rubrik: "Boka en stadsvandring",
    ingress: "Berätta när ni vill gå och hur många ni är, så återkommer Caroline med förslag.",
    direkt: "Eller hör av dig direkt",
    epost: "E-post",
    telefon: "Telefon",
  },
  formular: {
    namn: "Namn",
    epost: "E-post",
    telefon: "Telefon",
    valfritt: "(valfritt)",
    datum: "Önskat datum",
    valjDatum: "Välj datum",
    rensaDatum: "Rensa datum",
    antal: "Antal personer",
    meddelande: "Meddelande",
    meddelandeHint:
      "Är ni ett sällskap, en förening eller ett företag? Något särskilt ni vill höra om?",
    skicka: "Skicka förfrågan",
    skickar: "Skickar…",
    fel: "Förfrågan kunde inte skickas just nu. Försök igen om en stund.",
    tackRubrik: "Tack, förfrågan är skickad.",
    tackText: "Caroline återkommer till dig via e-post så snart hon kan.",
  },
  sidfot: {
    text: "Guidade stadsvandringar i Palma – historia, nutid och politik bortom turiststråken.",
    boka: "Boka en vandring",
    sidor: "Sidor",
    lankar: [
      ["#", "Rutten"],
      ["#om-caroline", "Om Caroline"],
      ["#stadsvandringar", "Stadsvandringarna"],
      ["#praktiskt", "Praktiskt"],
      ["#fragor", "Vanliga frågor"],
      ["#boka", "Boka"],
    ],
    kontakt: "Kontakt",
    kartdata: "Kartdata © OpenStreetMap-bidragsgivare",
    byggd: "Hemsidan är byggd och administrerad av",
  },
  sprakval: "Välj språk",
};

const EN: Texter = {
  meta: {
    titel: "Guided walking tours of Palma with Caroline Palmstierna",
    beskrivning:
      "Guided walking tours of Palma de Mallorca with journalist and Spain expert Caroline Palmstierna – history, current affairs and politics beyond the tourist trail.",
    bildAlt:
      "Guided walking tour of Palma with Caroline Palmstierna – map of the route through the old town",
  },
  slinga: {
    etikett: "The walking route through Palma",
    overrad: "About two hours on foot",
    rubrik: ["Guided walking tour", "of Palma"],
    med: "with Caroline Palmstierna",
    stopp: (nr, av) => `Stop ${nr} of ${av}`,
    slutEtikett: "About 2 hours",
    boka: "Book a tour",
    ledtrad: "Scroll to walk the route",
  },
  om: {
    overrad: "Your guide",
    ingress: "Journalist and Spain expert, based in Mallorca.",
    text: [
      "Caroline is a Swedish journalist deeply rooted in Spanish and Mallorcan society. In Palma's cultural life she hosts book talks, gives lectures and works with networks such as SWEA Mallorca.",
      "She shares Spanish history, local politics, culture and genuine Mallorcan craftsmanship – and she is the one who can explain why the city looks the way it does.",
    ],
    bildAlt: "Caroline Palmstierna, smiling with a bouquet of flowers",
  },
  vandringar: {
    overrad: "The walking tours",
    rubrik: "History, today and politics – on foot",
    pelare: [
      {
        rubrik: "Stories, not dates",
        text: "The walk is less about architectural styles and more about people. Caroline weaves together Spain's recent history, today's local politics and the anecdotes that make the city make sense.",
      },
      {
        rubrik: "The women behind Mallorca",
        text: "Many tours focus on the women in the island's history – the famous and the forgotten – and on how they shaped Mallorca.",
      },
      {
        rubrik: "Behind the façades",
        text: "The walk winds through Palma's historic streets, into hidden courtyards and past churches and architecture that most visitors miss.",
      },
    ],
  },
  praktiskt: {
    overrad: "Practical information",
    rubrik: "How it works",
    fakta: [
      { etikett: "Duration", text: "About two hours, at an easy walking pace." },
      { etikett: "Where", text: "Palma's historic quarters, alleys and courtyards." },
      {
        etikett: "Finale",
        text: "Often a salon evening in the old windmill quarter of Es Jonquet, with refreshments, local bites and conversation in a personal setting.",
      },
    ],
  },
  fragor: {
    overrad: "Frequently asked questions",
    rubrik: "Good to know",
    lista: [
      "Which language is the tour in?",
      "How do I book and pay?",
      "What happens if the weather is bad?",
      "Is the tour accessible?",
      "What is the cancellation policy?",
    ],
    platshallare: "Caroline will fill this in",
  },
  boka: {
    overrad: "Book",
    rubrik: "Book a walking tour",
    ingress:
      "Tell us when you would like to go and how many you are, and Caroline will get back to you.",
    direkt: "Or get in touch directly",
    epost: "Email",
    telefon: "Phone",
  },
  formular: {
    namn: "Name",
    epost: "Email",
    telefon: "Phone",
    valfritt: "(optional)",
    datum: "Preferred date",
    valjDatum: "Choose a date",
    rensaDatum: "Clear date",
    antal: "Number of people",
    meddelande: "Message",
    meddelandeHint:
      "Are you a group, an association or a company? Anything in particular you would like to hear about?",
    skicka: "Send request",
    skickar: "Sending…",
    fel: "Your request could not be sent right now. Please try again in a moment.",
    tackRubrik: "Thank you, your request has been sent.",
    tackText: "Caroline will reply by email as soon as she can.",
  },
  sidfot: {
    text: "Guided walking tours of Palma – history, current affairs and politics beyond the tourist trail.",
    boka: "Book a tour",
    sidor: "Pages",
    lankar: [
      ["#", "The route"],
      ["#om-caroline", "About Caroline"],
      ["#stadsvandringar", "The walking tours"],
      ["#praktiskt", "Practical information"],
      ["#fragor", "FAQ"],
      ["#boka", "Book"],
    ],
    kontakt: "Contact",
    kartdata: "Map data © OpenStreetMap contributors",
    byggd: "Website built and managed by",
  },
  sprakval: "Choose language",
};

const ES: Texter = {
  meta: {
    titel: "Visitas guiadas a pie por Palma con Caroline Palmstierna",
    beskrivning:
      "Visitas guiadas a pie por Palma de Mallorca con la periodista y experta en España Caroline Palmstierna: historia, actualidad y política más allá de las rutas turísticas.",
    bildAlt:
      "Visita guiada por Palma con Caroline Palmstierna: mapa de la ruta por el casco antiguo",
  },
  slinga: {
    etikett: "La ruta de la visita por Palma",
    overrad: "Unas dos horas a pie",
    rubrik: ["Visita guiada", "por Palma"],
    med: "con Caroline Palmstierna",
    stopp: (nr, av) => `Parada ${nr} de ${av}`,
    slutEtikett: "Unas 2 horas",
    boka: "Reservar una visita",
    ledtrad: "Desplázate para recorrer la ruta",
  },
  om: {
    overrad: "Tu guía",
    ingress: "Periodista y experta en España, afincada en Mallorca.",
    text: [
      "Caroline es una periodista sueca profundamente arraigada en la sociedad española y mallorquina. En la vida cultural de Palma modera presentaciones de libros, da conferencias y colabora con redes como SWEA Mallorca.",
      "Comparte la historia de España, la política local, la cultura y la auténtica artesanía mallorquina, y sabe explicar por qué la ciudad es como es.",
    ],
    bildAlt: "Caroline Palmstierna, sonriente con un ramo de flores",
  },
  vandringar: {
    overrad: "Las visitas",
    rubrik: "Historia, actualidad y política, a pie",
    pelare: [
      {
        rubrik: "Historias, no fechas",
        text: "La visita trata menos de estilos arquitectónicos y más de personas. Caroline enlaza la historia reciente de España, la política local de hoy y las anécdotas que hacen comprensible la ciudad.",
      },
      {
        rubrik: "Las mujeres detrás de Mallorca",
        text: "Muchas visitas se centran en las mujeres de la historia de la isla, las conocidas y las olvidadas, y en cómo dieron forma a Mallorca.",
      },
      {
        rubrik: "Detrás de las fachadas",
        text: "El paseo recorre las calles históricas de Palma, entra en patios escondidos y pasa por iglesias y rincones que la mayoría de los visitantes no ve.",
      },
    ],
  },
  praktiskt: {
    overrad: "Información práctica",
    rubrik: "Cómo funciona",
    fakta: [
      { etikett: "Duración", text: "Unas dos horas, a paso tranquilo." },
      { etikett: "Dónde", text: "Los barrios históricos, callejones y patios de Palma." },
      {
        etikett: "Final",
        text: "A menudo una velada en el barrio de los molinos de Es Jonquet, con refrescos, picoteo local y conversación en un ambiente cercano.",
      },
    ],
  },
  fragor: {
    overrad: "Preguntas frecuentes",
    rubrik: "Conviene saber",
    lista: [
      "¿En qué idioma es la visita?",
      "¿Cómo se reserva y se paga?",
      "¿Qué pasa si hace mal tiempo?",
      "¿Es la visita accesible?",
      "¿Cuál es la política de cancelación?",
    ],
    platshallare: "Caroline lo completará",
  },
  boka: {
    overrad: "Reservar",
    rubrik: "Reserva una visita",
    ingress:
      "Cuéntanos cuándo queréis ir y cuántos sois, y Caroline te responderá con una propuesta.",
    direkt: "O contacta directamente",
    epost: "Correo",
    telefon: "Teléfono",
  },
  formular: {
    namn: "Nombre",
    epost: "Correo electrónico",
    telefon: "Teléfono",
    valfritt: "(opcional)",
    datum: "Fecha deseada",
    valjDatum: "Elige una fecha",
    rensaDatum: "Borrar fecha",
    antal: "Número de personas",
    meddelande: "Mensaje",
    meddelandeHint:
      "¿Sois un grupo, una asociación o una empresa? ¿Algo en particular que os gustaría conocer?",
    skicka: "Enviar solicitud",
    skickar: "Enviando…",
    fel: "No se ha podido enviar la solicitud. Inténtalo de nuevo en un momento.",
    tackRubrik: "Gracias, la solicitud se ha enviado.",
    tackText: "Caroline te responderá por correo lo antes posible.",
  },
  sidfot: {
    text: "Visitas guiadas a pie por Palma: historia, actualidad y política más allá de las rutas turísticas.",
    boka: "Reservar una visita",
    sidor: "Páginas",
    lankar: [
      ["#", "La ruta"],
      ["#om-caroline", "Sobre Caroline"],
      ["#stadsvandringar", "Las visitas"],
      ["#praktiskt", "Información práctica"],
      ["#fragor", "Preguntas frecuentes"],
      ["#boka", "Reservar"],
    ],
    kontakt: "Contacto",
    kartdata: "Datos del mapa © colaboradores de OpenStreetMap",
    byggd: "Web creada y gestionada por",
  },
  sprakval: "Elige idioma",
};

export const TEXTER: Record<Sprak, Texter> = { sv: SV, en: EN, es: ES };
