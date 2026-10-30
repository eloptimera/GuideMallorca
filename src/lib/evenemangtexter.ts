// Texterna för kalendern, evenemangsrutan med anmälan, bildgalleriet och citaten.
import type { Sprak } from "@/lib/sprak";

type EvenemangTexter = {
  kalender: {
    overrad: string;
    rubrik: string;
    ingress: string;
    exempelNotis: string;
    forra: string;
    nasta: string;
    ingaIManaden: string;
    ingaAvTypen: string;
    horAvDig: string;
    alla: string;
    filterEtikett: string;
    lasMer: string;
    platserKvar: (n: number) => string;
    fullbokat: string;
    exempel: string;
  };
  ruta: {
    datum: string;
    tid: string;
    langd: string;
    plats: string;
    pris: string;
    sprak: string;
    platser: string;
    anmalRubrik: string;
    anmalIngress: string;
    fullbokatText: string;
    antal: string;
    namn: string;
    epost: string;
    telefon: string;
    valfritt: string;
    meddelande: string;
    skicka: string;
    skickar: string;
    fel: string;
    tackRubrik: string;
    tackText: string;
    stang: string;
    delaLank: string;
    laggTill: string;
    appleOutlook: string;
    kopierad: string;
    vantelista: string;
    utkastSkickat: string;
  };
  galleri: { overrad: string; rubrik: string; ingress: string };
  citat: { overrad: string; rubrik: string; exempel: string };
};

const SV: EvenemangTexter = {
  kalender: {
    overrad: "Kalender",
    rubrik: "Kommande evenemang",
    ingress: "Välj ett evenemang för att läsa mer och skicka en bokningsförfrågan.",
    exempelNotis:
      "Utkast: evenemangen nedan är exempel och byts mot riktiga datum innan sajten lanseras.",
    forra: "Föregående månad",
    nasta: "Nästa månad",
    ingaIManaden: "Inga evenemang den här månaden.",
    ingaAvTypen: "Inga datum är satta för den här typen just nu.",
    horAvDig: "Hör av dig så meddelar jag dig när nästa kväll släpps.",
    alla: "Alla",
    filterEtikett: "Visa typ av evenemang",
    lasMer: "Läs mer och boka",
    platserKvar: (n) => (n === 1 ? "1 plats kvar" : `${n} platser kvar`),
    fullbokat: "Fullbokat",
    exempel: "Exempel",
  },
  ruta: {
    datum: "Datum",
    tid: "Tid",
    langd: "Längd",
    plats: "Plats",
    pris: "Pris",
    sprak: "Språk",
    platser: "Platser",
    anmalRubrik: "Skicka en bokningsförfrågan",
    anmalIngress:
      "Platsen är inte bokad förrän jag har bekräftat den. Du får min bekräftelse via e-post inom ett dygn, med adress, hur du betalar och vad som gäller om du behöver avboka.",
    fullbokatText:
      "Det här evenemanget är fullbokat. Skriv upp dig på väntelistan så hör jag av mig om en plats blir ledig.",
    antal: "Antal platser",
    namn: "Namn",
    epost: "E-post",
    telefon: "Telefon",
    valfritt: "(valfritt)",
    meddelande: "Meddelande",
    skicka: "Skicka bokningsförfrågan",
    skickar: "Skickar…",
    fel: "Anmälan kunde inte skickas just nu. Försök igen om en stund.",
    tackRubrik: "Tack, din bokningsförfrågan är skickad.",
    tackText:
      "Din plats är inte bokad ännu. Inom ett dygn får du min bekräftelse via e-post med adress och betalningsinformation. Hittar du inget mejl, titta i skräpposten.",
    stang: "Stäng",
    delaLank: "Kopiera länk",
    laggTill: "Lägg till i kalendern:",
    appleOutlook: "Apple/Outlook",
    kopierad: "Länken är kopierad",
    vantelista: "Skriv upp mig på väntelistan",
    utkastSkickat: "Utkast: det här är ett exempel-evenemang, så ingen anmälan skickades.",
  },
  galleri: {
    overrad: "Från tidigare kvällar",
    rubrik: "Så här kan en kväll se ut",
    ingress: "Små sällskap, nära berättande och samtal som fortsätter långt efteråt.",
  },
  citat: { overrad: "Publiken om kvällarna", rubrik: "Vad deltagarna säger", exempel: "Exempel" },
};

const EN: EvenemangTexter = {
  kalender: {
    overrad: "Calendar",
    rubrik: "Upcoming events",
    ingress: "Choose an event to read more and send a booking request.",
    exempelNotis:
      "Draft: the events below are examples and will be replaced with real dates before launch.",
    forra: "Previous month",
    nasta: "Next month",
    ingaIManaden: "No events this month.",
    ingaAvTypen: "No dates are set for this type right now.",
    horAvDig: "Get in touch and I'll let you know when the next evening is announced.",
    alla: "All",
    filterEtikett: "Show type of event",
    lasMer: "Read more and book",
    platserKvar: (n) => (n === 1 ? "1 seat left" : `${n} seats left`),
    fullbokat: "Sold out",
    exempel: "Example",
  },
  ruta: {
    datum: "Date",
    tid: "Time",
    langd: "Duration",
    plats: "Venue",
    pris: "Price",
    sprak: "Language",
    platser: "Seats",
    anmalRubrik: "Send a booking request",
    anmalIngress:
      "Your seat is not booked until I have confirmed it. You'll get my confirmation by email within 24 hours, with the address, how to pay and what applies if you need to cancel.",
    fullbokatText:
      "This event is sold out. Join the waiting list and I'll get in touch if a seat becomes available.",
    antal: "Number of seats",
    namn: "Name",
    epost: "Email",
    telefon: "Phone",
    valfritt: "(optional)",
    meddelande: "Message",
    skicka: "Send booking request",
    skickar: "Sending…",
    fel: "Your sign-up could not be sent right now. Please try again in a moment.",
    tackRubrik: "Thank you, your booking request has been sent.",
    tackText:
      "Your seat is not booked yet. Within 24 hours you'll get my confirmation by email with the address and payment details. If you can't find it, check your spam folder.",
    stang: "Close",
    delaLank: "Copy link",
    laggTill: "Add to calendar:",
    appleOutlook: "Apple/Outlook",
    kopierad: "Link copied",
    vantelista: "Put me on the waiting list",
    utkastSkickat: "Draft: this is an example event, so no sign-up was sent.",
  },
  galleri: {
    overrad: "From past evenings",
    rubrik: "What an evening can look like",
    ingress:
      "Small gatherings, close-up storytelling and conversations that go on long afterwards.",
  },
  citat: { overrad: "The audience on the evenings", rubrik: "What guests say", exempel: "Example" },
};

const ES: EvenemangTexter = {
  kalender: {
    overrad: "Calendario",
    rubrik: "Próximos eventos",
    ingress: "Elige un evento para leer más y enviar una solicitud de reserva.",
    exempelNotis:
      "Borrador: los eventos de abajo son ejemplos y se sustituirán por fechas reales antes del lanzamiento.",
    forra: "Mes anterior",
    nasta: "Mes siguiente",
    ingaIManaden: "No hay eventos este mes.",
    ingaAvTypen: "Ahora mismo no hay fechas para este tipo de evento.",
    horAvDig: "Escríbeme y te avisaré cuando se anuncie la próxima velada.",
    alla: "Todos",
    filterEtikett: "Mostrar tipo de evento",
    lasMer: "Leer más y reservar",
    platserKvar: (n) => (n === 1 ? "Queda 1 plaza" : `Quedan ${n} plazas`),
    fullbokat: "Completo",
    exempel: "Ejemplo",
  },
  ruta: {
    datum: "Fecha",
    tid: "Hora",
    langd: "Duración",
    plats: "Lugar",
    pris: "Precio",
    sprak: "Idioma",
    platser: "Plazas",
    anmalRubrik: "Envía una solicitud de reserva",
    anmalIngress:
      "Tu plaza no está reservada hasta que yo la confirme. Recibirás mi confirmación por correo en un plazo de 24 horas, con la dirección, cómo pagar y qué ocurre si necesitas cancelar.",
    fullbokatText:
      "Este evento está completo. Apúntate a la lista de espera y te avisaré si queda una plaza libre.",
    antal: "Número de plazas",
    namn: "Nombre",
    epost: "Correo electrónico",
    telefon: "Teléfono",
    valfritt: "(opcional)",
    meddelande: "Mensaje",
    skicka: "Enviar solicitud de reserva",
    skickar: "Enviando…",
    fel: "No se ha podido enviar la inscripción. Inténtalo de nuevo en un momento.",
    tackRubrik: "Gracias, tu solicitud de reserva se ha enviado.",
    tackText:
      "Tu plaza aún no está reservada. En un plazo de 24 horas recibirás mi confirmación por correo con la dirección y los datos de pago. Si no la encuentras, revisa la carpeta de spam.",
    stang: "Cerrar",
    delaLank: "Copiar enlace",
    laggTill: "Añadir al calendario:",
    appleOutlook: "Apple/Outlook",
    kopierad: "Enlace copiado",
    vantelista: "Apuntarme a la lista de espera",
    utkastSkickat:
      "Borrador: este es un evento de ejemplo, así que no se ha enviado ninguna inscripción.",
  },
  galleri: {
    overrad: "De veladas anteriores",
    rubrik: "Así puede ser una velada",
    ingress: "Grupos pequeños, relatos cercanos y conversaciones que siguen mucho después.",
  },
  citat: { overrad: "El público opina", rubrik: "Lo que dicen los asistentes", exempel: "Ejemplo" },
};

export const EVENEMANG_TEXTER: Record<Sprak, EvenemangTexter> = { sv: SV, en: EN, es: ES };
