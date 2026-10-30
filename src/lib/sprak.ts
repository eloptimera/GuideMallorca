// Sajtens tre språk och alla texter som syns på sidan. Stoppens texter ligger i
// src/lib/slinga/stopp.ts, aktiviteterna och inläggen i src/lib/innehall.ts.
// Svenska är originalet; engelska och spanska är översättningar – låt gärna Caroline läsa dem
// innan sajten används skarpt.
//
// Ordet "guide" används medvetet inte någonstans på sajten.

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

export type Erbjudande = {
  /** Ankare på sidan, t.ex. #stand-up-history */
  id: "stand-up-history" | "film" | "museum";
  namn: string;
  rubrik: string;
  text: string;
  teman: readonly string[];
};

type Texter = {
  meta: { titel: string; beskrivning: string; bildAlt: string };
  hero: {
    meny: readonly [string, string][];
    rubrik: [string, string];
    ingress: string;
    knappAktiviteter: string;
    knappKontakt: string;
    kortRubrik: string;
    egenskaper: readonly string[];
  };
  erbjudanden: {
    overrad: string;
    rubrik: string;
    temanRubrik: string;
    knapp: string;
    lista: readonly Erbjudande[];
  };
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
  aktiviteter: {
    overrad: string;
    rubrik: string;
    ingress: string;
    datumMeddelas: string;
    anmal: string;
    exempel: string;
    typer: Record<"stand-up-history" | "film" | "museum" | "rundvandring", string>;
  };
  om: {
    overrad: string;
    ingress: string;
    roller: readonly string[];
    text: readonly string[];
    bildAlt: string;
  };
  tv: {
    overrad: string;
    rubrik: string;
    ingress: string;
    fakta: readonly { etikett: string; text: string }[];
    dokumentarEtikett: string;
    dokumentarText: string;
  };
  blogg: { overrad: string; rubrik: string; ingress: string; exempel: string };
  fragor: {
    overrad: string;
    rubrik: string;
    lista: readonly string[];
    platshallare: string;
  };
  kontakt: {
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
    kontakta: string;
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
    titel: "Stand Up History, film och föreläsningar med Caroline Palmstierna",
    beskrivning:
      "Shoot for the Moon – Caroline Palmstierna, journalist, TV-konsult och Spanienexpert, delar sin passion för Mallorcas och Spaniens historia genom Stand Up History, filmkvällar och föreläsningar.",
    bildAlt: "Shoot for the Moon – Caroline Palmstierna på Mallorca",
  },
  hero: {
    meny: [
      ["#stand-up-history", "Stand Up History"],
      ["#film", "Film"],
      ["#museum", "Museum"],
      ["#om-caroline", "Om Caroline"],
    ],
    rubrik: ["Historia som", "man minns"],
    ingress:
      "Stand Up History, filmkvällar och föreläsningar om Mallorca och Spanien – med journalisten och Spanienexperten Caroline Palmstierna.",
    knappAktiviteter: "Se vad som är på gång",
    knappKontakt: "Hör av dig",
    kortRubrik: "På gång",
    egenskaper: [
      "Stand Up History med olika teman",
      "Filmvisningar med föreläsning",
      "Museivandringar med föreläsning",
      "Journalist och TV-konsult",
      "Bosatt på Mallorca",
    ],
  },
  erbjudanden: {
    overrad: "Det här gör jag",
    rubrik: "Tre sätt att uppleva historien",
    temanRubrik: "Teman",
    knapp: "Anmäl intresse",
    lista: [
      {
        id: "stand-up-history",
        namn: "Stand Up History",
        rubrik: "Historia med publik, humor och allvar",
        text: "Kvällar där Spaniens och Mallorcas historia berättas som den borde – med skvaller, skandaler och sammanhang. Varje session har ett eget tema.",
        teman: ["Teman meddelas"],
      },
      {
        id: "film",
        namn: "Film & föreläsning",
        rubrik: "Se filmen – förstå historien bakom",
        text: "Filmvisningar där Caroline föreläser innan filmen börjar: vad som verkligen hände, vem som bestämde och varför det fortfarande spelar roll.",
        teman: ["Filmer meddelas"],
      },
      {
        id: "museum",
        namn: "Museivandringar",
        rubrik: "Museet, med berättelserna som inte står på skyltarna",
        text: "Föreläsningar på plats i Palmas museer. Ett tema, några utvalda föremål och historierna som får dem att leva.",
        teman: ["Museer meddelas"],
      },
    ],
  },
  slinga: {
    etikett: "Rundvandringens väg genom Palma",
    overrad: "Ca två timmar till fots",
    rubrik: ["Rundvandring", "i Palma"],
    med: "med Caroline Palmstierna",
    stopp: (nr, av) => `Stopp ${nr} av ${av}`,
    slutEtikett: "Ca 2 timmar",
    boka: "Anmäl intresse",
    ledtrad: "Scrolla för att följa vägen",
  },
  aktiviteter: {
    overrad: "På gång",
    rubrik: "Kommande aktiviteter",
    ingress: "Det här händer framöver. Anmäl intresse så hör Caroline av sig med detaljer.",
    datumMeddelas: "Datum meddelas",
    anmal: "Anmäl intresse",
    exempel: "Exempel",
    typer: {
      "stand-up-history": "Stand Up History",
      film: "Film & föreläsning",
      museum: "Museivandring",
      rundvandring: "Rundvandring",
    },
  },
  om: {
    overrad: "Om Caroline",
    ingress: "Journalist, TV-konsult, historieälskare och Spanienexpert – bosatt på Mallorca.",
    roller: ["Journalist", "TV-konsult", "Historieälskare", "Spanienexpert"],
    text: [
      "Caroline har arbetat med tv och journalistik i hela sitt yrkesliv – på MTV, STRIX och CNN, som redaktör för Stina Dabrowskis intervjuprogram, hos dokumentärfilmaren Folke Rydén och som programledare och journalist i Spanien.",
      "I dag bor hon på Mallorca, där hon leder boksamtal, håller föreläsningar och samarbetar med nätverk som SWEA Mallorca.",
      "Genom Shoot for the Moon delar hon sin passion för Spaniens historia, politik och kultur med alla som är nyfikna – och är den som kan förklara varför saker är som de är.",
    ],
    bildAlt: "Caroline Palmstierna, leende med en blombukett",
  },
  tv: {
    overrad: "Shoot for the Moon",
    rubrik: "TV och dokumentär",
    ingress:
      "Shoot for the Moon är också Carolines oberoende produktionsbolag. Bolaget utvecklar och producerar tv-serier och dokumentärer, och är konsult åt skandinaviska tv-producenter och internationella distributörer som söker samproduktioner inom drama och dokumentär.",
    fakta: [
      {
        etikett: "Erfarenhet",
        text: "Omkring tio år av att utveckla, finansiera, sälja och lansera svenska och danska tv-serier.",
      },
      {
        etikett: "Filmlance International",
        text: "Som försäljningschef ansvarade Caroline för den internationella lanseringen och finansieringen av Bron, Arne Dahl och Morden i Sandhamn.",
      },
      {
        etikett: "Uppdragsgivare",
        text: "Skandinaviska tv-bolag och produktionsbolag samt internationella produktions- och distributionsbolag i Belgien, Nederländerna, Storbritannien och Island.",
      },
    ],
    dokumentarEtikett: "Dokumentär",
    dokumentarText:
      "Om hur skandinavisk tv-dramatik erövrade världen – med bland andra Sofia Helin, Sidse Babett Knudsen, Krister Henriksson och Sofie Gråböl. Shoot for the Moon står för produktion, utveckling, finansiering och världsförsäljning.",
  },
  blogg: {
    overrad: "Från Mallorca",
    rubrik: "Anteckningar",
    ingress: "Bilder, upptäckter och tankar från vardagen på ön.",
    exempel: "Exempel",
  },
  fragor: {
    overrad: "Vanliga frågor",
    rubrik: "Bra att veta",
    lista: [
      "Vilket språk sker föreläsningarna på?",
      "Hur anmäler och betalar man?",
      "Kan man boka en kväll för sin förening eller sitt företag?",
      "Är lokalerna tillgänglighetsanpassade?",
      "Vad gäller vid avbokning?",
    ],
    platshallare: "Caroline får fylla i",
  },
  kontakt: {
    overrad: "Kontakt",
    rubrik: "Hör av dig",
    ingress:
      "Berätta vad du är intresserad av, när och hur många ni är, så återkommer Caroline med förslag.",
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
      "Vad är du intresserad av – Stand Up History, film, museum eller rundvandring? Är ni ett sällskap, en förening eller ett företag?",
    skicka: "Skicka förfrågan",
    skickar: "Skickar…",
    fel: "Förfrågan kunde inte skickas just nu. Försök igen om en stund.",
    tackRubrik: "Tack, förfrågan är skickad.",
    tackText: "Caroline återkommer till dig via e-post så snart hon kan.",
  },
  sidfot: {
    text: "Stand Up History, filmkvällar och föreläsningar om Mallorca och Spanien.",
    kontakta: "Hör av dig",
    sidor: "Sidor",
    lankar: [
      ["#stand-up-history", "Stand Up History"],
      ["#film", "Film & föreläsning"],
      ["#museum", "Museivandringar"],
      ["#rundvandring", "Rundvandring"],
      ["#kommande", "Kommande aktiviteter"],
      ["#om-caroline", "Om Caroline"],
      ["#tv", "TV och dokumentär"],
      ["#anteckningar", "Anteckningar"],
      ["#kontakt", "Kontakt"],
    ],
    kontakt: "Kontakt",
    kartdata: "Kartdata © OpenStreetMap-bidragsgivare",
    byggd: "Hemsidan är byggd och administrerad av",
  },
  sprakval: "Välj språk",
};

const EN: Texter = {
  meta: {
    titel: "Stand Up History, film and talks with Caroline Palmstierna",
    beskrivning:
      "Shoot for the Moon – Caroline Palmstierna, journalist, TV consultant and Spain expert, shares her passion for the history of Mallorca and Spain through Stand Up History, film nights and talks.",
    bildAlt: "Shoot for the Moon – Caroline Palmstierna in Mallorca",
  },
  hero: {
    meny: [
      ["#stand-up-history", "Stand Up History"],
      ["#film", "Film"],
      ["#museum", "Museum"],
      ["#om-caroline", "About Caroline"],
    ],
    rubrik: ["History you", "remember"],
    ingress:
      "Stand Up History, film nights and talks about Mallorca and Spain – with journalist and Spain expert Caroline Palmstierna.",
    knappAktiviteter: "See what's coming up",
    knappKontakt: "Get in touch",
    kortRubrik: "Coming up",
    egenskaper: [
      "Stand Up History on different themes",
      "Film screenings with a talk",
      "Museum walks with a talk",
      "Journalist and TV consultant",
      "Based in Mallorca",
    ],
  },
  erbjudanden: {
    overrad: "What I do",
    rubrik: "Three ways to experience history",
    temanRubrik: "Themes",
    knapp: "Register interest",
    lista: [
      {
        id: "stand-up-history",
        namn: "Stand Up History",
        rubrik: "History with an audience, humour and gravity",
        text: "Evenings where the history of Spain and Mallorca is told the way it should be – with gossip, scandal and context. Every session has its own theme.",
        teman: ["Themes to be announced"],
      },
      {
        id: "film",
        namn: "Film & talk",
        rubrik: "See the film – understand the history behind it",
        text: "Film screenings where Caroline gives a talk before the film starts: what really happened, who decided and why it still matters.",
        teman: ["Films to be announced"],
      },
      {
        id: "museum",
        namn: "Museum walks",
        rubrik: "The museum, with the stories that aren't on the labels",
        text: "Talks on site in Palma's museums. One theme, a few chosen objects and the stories that bring them to life.",
        teman: ["Museums to be announced"],
      },
    ],
  },
  slinga: {
    etikett: "The walking route through Palma",
    overrad: "About two hours on foot",
    rubrik: ["A walk", "through Palma"],
    med: "with Caroline Palmstierna",
    stopp: (nr, av) => `Stop ${nr} of ${av}`,
    slutEtikett: "About 2 hours",
    boka: "Register interest",
    ledtrad: "Scroll to follow the route",
  },
  aktiviteter: {
    overrad: "Coming up",
    rubrik: "Upcoming events",
    ingress:
      "Here's what's coming. Register your interest and Caroline will get back to you with details.",
    datumMeddelas: "Date to be announced",
    anmal: "Register interest",
    exempel: "Example",
    typer: {
      "stand-up-history": "Stand Up History",
      film: "Film & talk",
      museum: "Museum walk",
      rundvandring: "Walk",
    },
  },
  om: {
    overrad: "About Caroline",
    ingress: "Journalist, TV consultant, history lover and Spain expert – based in Mallorca.",
    roller: ["Journalist", "TV consultant", "History lover", "Spain expert"],
    text: [
      "Caroline has worked in television and journalism throughout her career – at MTV, STRIX and CNN, as editor of Stina Dabrowski's interview programmes, with documentary maker Folke Rydén, and as a TV host and journalist in Spain.",
      "Today she lives in Mallorca, where she hosts book talks, gives lectures and works with networks such as SWEA Mallorca.",
      "Through Shoot for the Moon she shares her passion for Spanish history, politics and culture with anyone who is curious – and she is the one who can explain why things are the way they are.",
    ],
    bildAlt: "Caroline Palmstierna, smiling with a bouquet of flowers",
  },
  tv: {
    overrad: "Shoot for the Moon",
    rubrik: "TV and documentary",
    ingress:
      "Shoot for the Moon is also Caroline's independent production company. It develops and produces TV series and documentaries, and consults for Scandinavian TV producers and international distributors looking for drama and documentary co-productions.",
    fakta: [
      {
        etikett: "Experience",
        text: "Around ten years of developing, financing, selling and launching Swedish and Danish TV series.",
      },
      {
        etikett: "Filmlance International",
        text: "As Director of Sales, Caroline handled the international launch and financing of The Bridge, Arne Dahl and Murder in Sandhamn.",
      },
      {
        etikett: "Clients",
        text: "Scandinavian broadcasters and production companies, and international production and distribution companies in Belgium, the Netherlands, Great Britain and Iceland.",
      },
    ],
    dokumentarEtikett: "Documentary",
    dokumentarText:
      "How Scandinavian TV drama conquered the world – featuring Sofia Helin, Sidse Babett Knudsen, Krister Henriksson and Sofie Gråböl, among others. Shoot for the Moon handles production, development, financing and worldwide sales.",
  },
  blogg: {
    overrad: "From Mallorca",
    rubrik: "Notes",
    ingress: "Pictures, discoveries and thoughts from everyday life on the island.",
    exempel: "Example",
  },
  fragor: {
    overrad: "Frequently asked questions",
    rubrik: "Good to know",
    lista: [
      "Which language are the talks in?",
      "How do I register and pay?",
      "Can I book an evening for my association or company?",
      "Are the venues accessible?",
      "What is the cancellation policy?",
    ],
    platshallare: "Caroline will fill this in",
  },
  kontakt: {
    overrad: "Contact",
    rubrik: "Get in touch",
    ingress:
      "Tell us what you're interested in, when and how many you are, and Caroline will get back to you.",
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
      "What are you interested in – Stand Up History, film, museum or a walk? Are you a group, an association or a company?",
    skicka: "Send request",
    skickar: "Sending…",
    fel: "Your request could not be sent right now. Please try again in a moment.",
    tackRubrik: "Thank you, your request has been sent.",
    tackText: "Caroline will reply by email as soon as she can.",
  },
  sidfot: {
    text: "Stand Up History, film nights and talks about Mallorca and Spain.",
    kontakta: "Get in touch",
    sidor: "Pages",
    lankar: [
      ["#stand-up-history", "Stand Up History"],
      ["#film", "Film & talk"],
      ["#museum", "Museum walks"],
      ["#rundvandring", "Walk"],
      ["#kommande", "Upcoming events"],
      ["#om-caroline", "About Caroline"],
      ["#tv", "TV and documentary"],
      ["#anteckningar", "Notes"],
      ["#kontakt", "Contact"],
    ],
    kontakt: "Contact",
    kartdata: "Map data © OpenStreetMap contributors",
    byggd: "Website built and managed by",
  },
  sprakval: "Choose language",
};

const ES: Texter = {
  meta: {
    titel: "Stand Up History, cine y charlas con Caroline Palmstierna",
    beskrivning:
      "Shoot for the Moon: Caroline Palmstierna, periodista, consultora de televisión y experta en España, comparte su pasión por la historia de Mallorca y España con Stand Up History, noches de cine y charlas.",
    bildAlt: "Shoot for the Moon: Caroline Palmstierna en Mallorca",
  },
  hero: {
    meny: [
      ["#stand-up-history", "Stand Up History"],
      ["#film", "Cine"],
      ["#museum", "Museo"],
      ["#om-caroline", "Sobre Caroline"],
    ],
    rubrik: ["Historia que", "se recuerda"],
    ingress:
      "Stand Up History, noches de cine y charlas sobre Mallorca y España, con la periodista y experta en España Caroline Palmstierna.",
    knappAktiviteter: "Ver lo que viene",
    knappKontakt: "Escríbenos",
    kortRubrik: "Próximamente",
    egenskaper: [
      "Stand Up History con distintos temas",
      "Proyecciones con charla",
      "Recorridos por museos con charla",
      "Periodista y consultora de TV",
      "Afincada en Mallorca",
    ],
  },
  erbjudanden: {
    overrad: "Lo que hago",
    rubrik: "Tres maneras de vivir la historia",
    temanRubrik: "Temas",
    knapp: "Me interesa",
    lista: [
      {
        id: "stand-up-history",
        namn: "Stand Up History",
        rubrik: "Historia con público, humor y seriedad",
        text: "Veladas en las que la historia de España y de Mallorca se cuenta como debería: con chismes, escándalos y contexto. Cada sesión tiene su propio tema.",
        teman: ["Temas por anunciar"],
      },
      {
        id: "film",
        namn: "Cine y charla",
        rubrik: "Ver la película y entender la historia que hay detrás",
        text: "Proyecciones en las que Caroline da una charla antes de la película: qué pasó de verdad, quién decidió y por qué sigue importando.",
        teman: ["Películas por anunciar"],
      },
      {
        id: "museum",
        namn: "Recorridos por museos",
        rubrik: "El museo, con las historias que no están en las cartelas",
        text: "Charlas en los museos de Palma. Un tema, unas cuantas piezas escogidas y las historias que les dan vida.",
        teman: ["Museos por anunciar"],
      },
    ],
  },
  slinga: {
    etikett: "El recorrido a pie por Palma",
    overrad: "Unas dos horas a pie",
    rubrik: ["Un paseo", "por Palma"],
    med: "con Caroline Palmstierna",
    stopp: (nr, av) => `Parada ${nr} de ${av}`,
    slutEtikett: "Unas 2 horas",
    boka: "Me interesa",
    ledtrad: "Desplázate para seguir el recorrido",
  },
  aktiviteter: {
    overrad: "Próximamente",
    rubrik: "Próximas actividades",
    ingress: "Esto es lo que viene. Dinos que te interesa y Caroline te enviará los detalles.",
    datumMeddelas: "Fecha por anunciar",
    anmal: "Me interesa",
    exempel: "Ejemplo",
    typer: {
      "stand-up-history": "Stand Up History",
      film: "Cine y charla",
      museum: "Recorrido por un museo",
      rundvandring: "Paseo",
    },
  },
  om: {
    overrad: "Sobre Caroline",
    ingress:
      "Periodista, consultora de televisión, apasionada de la historia y experta en España, afincada en Mallorca.",
    roller: ["Periodista", "Consultora de TV", "Apasionada de la historia", "Experta en España"],
    text: [
      "Caroline ha trabajado en televisión y periodismo durante toda su carrera: en MTV, STRIX y CNN, como editora de los programas de entrevistas de Stina Dabrowski, con el documentalista Folke Rydén y como presentadora y periodista en España.",
      "Hoy vive en Mallorca, donde modera presentaciones de libros, da conferencias y colabora con redes como SWEA Mallorca.",
      "Con Shoot for the Moon comparte su pasión por la historia, la política y la cultura de España con cualquiera que sienta curiosidad, y sabe explicar por qué las cosas son como son.",
    ],
    bildAlt: "Caroline Palmstierna, sonriente con un ramo de flores",
  },
  tv: {
    overrad: "Shoot for the Moon",
    rubrik: "Televisión y documental",
    ingress:
      "Shoot for the Moon es también la productora independiente de Caroline. Desarrolla y produce series y documentales, y asesora a productoras de televisión escandinavas y a distribuidores internacionales que buscan coproducciones de drama y documental.",
    fakta: [
      {
        etikett: "Experiencia",
        text: "Unos diez años desarrollando, financiando, vendiendo y lanzando series de televisión suecas y danesas.",
      },
      {
        etikett: "Filmlance International",
        text: "Como directora de ventas, Caroline se encargó del lanzamiento internacional y la financiación de El Puente, Arne Dahl y Los crímenes de Sandhamn.",
      },
      {
        etikett: "Clientes",
        text: "Cadenas y productoras escandinavas, y productoras y distribuidoras internacionales de Bélgica, los Países Bajos, Gran Bretaña e Islandia.",
      },
    ],
    dokumentarEtikett: "Documental",
    dokumentarText:
      "Cómo el drama televisivo escandinavo conquistó el mundo, con Sofia Helin, Sidse Babett Knudsen, Krister Henriksson y Sofie Gråböl, entre otros. Shoot for the Moon se encarga de la producción, el desarrollo, la financiación y las ventas internacionales.",
  },
  blogg: {
    overrad: "Desde Mallorca",
    rubrik: "Apuntes",
    ingress: "Imágenes, descubrimientos y reflexiones del día a día en la isla.",
    exempel: "Ejemplo",
  },
  fragor: {
    overrad: "Preguntas frecuentes",
    rubrik: "Conviene saber",
    lista: [
      "¿En qué idioma son las charlas?",
      "¿Cómo se inscribe uno y cómo se paga?",
      "¿Se puede reservar una velada para una asociación o empresa?",
      "¿Son accesibles los espacios?",
      "¿Cuál es la política de cancelación?",
    ],
    platshallare: "Caroline lo completará",
  },
  kontakt: {
    overrad: "Contacto",
    rubrik: "Escríbenos",
    ingress:
      "Cuéntanos qué te interesa, cuándo y cuántos sois, y Caroline te responderá con una propuesta.",
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
      "¿Qué te interesa: Stand Up History, cine, museo o un paseo? ¿Sois un grupo, una asociación o una empresa?",
    skicka: "Enviar solicitud",
    skickar: "Enviando…",
    fel: "No se ha podido enviar la solicitud. Inténtalo de nuevo en un momento.",
    tackRubrik: "Gracias, la solicitud se ha enviado.",
    tackText: "Caroline te responderá por correo lo antes posible.",
  },
  sidfot: {
    text: "Stand Up History, noches de cine y charlas sobre Mallorca y España.",
    kontakta: "Escríbenos",
    sidor: "Páginas",
    lankar: [
      ["#stand-up-history", "Stand Up History"],
      ["#film", "Cine y charla"],
      ["#museum", "Recorridos por museos"],
      ["#rundvandring", "Paseo"],
      ["#kommande", "Próximas actividades"],
      ["#om-caroline", "Sobre Caroline"],
      ["#tv", "Televisión y documental"],
      ["#anteckningar", "Apuntes"],
      ["#kontakt", "Contacto"],
    ],
    kontakt: "Contacto",
    kartdata: "Datos del mapa © colaboradores de OpenStreetMap",
    byggd: "Web creada y gestionada por",
  },
  sprakval: "Elige idioma",
};

export const TEXTER: Record<Sprak, Texter> = { sv: SV, en: EN, es: ES };
