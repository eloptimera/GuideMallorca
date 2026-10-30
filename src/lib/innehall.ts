// Det som ändras ofta: evenemangen i kalendern och citaten.
// ALLT HÄR ÄR EXEMPEL tills Caroline har skickat riktigt innehåll – `exempel: true` visar en
// etikett på sajten så att ingen tar dem för riktiga datum eller citat.
// Checklistan för vad som ska bytas inför lansering ligger i LANSERING.md.
// Tanken är att den här filen ersätts av ett CMS där Caroline själv lägger in aktiviteter
// och inlägg; komponenterna läser bara listorna nedan.
import type { Sprak } from "@/lib/sprak";

type PerSprak = Record<Sprak, string>;

export type Aktivitet = {
  /** Unikt, används i länken (#evenemang-<id>). */
  id: string;
  /** ÅÅÅÅ-MM-DD */
  datum: string;
  /** Starttid, t.ex. "19:00". */
  tid: string;
  /** Ungefärlig längd, t.ex. "ca 2 timmar". */
  langd: PerSprak;
  /** Vilket erbjudande aktiviteten hör till (id i texterna för erbjudandena). */
  typ: "stand-up-history" | "film" | "museum" | "rundvandring";
  titel: PerSprak;
  /** En mening som syns i listan. */
  ingress: PerSprak;
  /** Längre beskrivning i evenemangsrutan. */
  text: PerSprak;
  /** Lokalens namn och stad. Exakt adress skickas i bekräftelsen. */
  plats: PerSprak;
  pris: PerSprak;
  /** Språket kvällen hålls på. */
  sprak: PerSprak;
  platser: number;
  platserKvar: number;
  bild: { src: string; alt: PerSprak };
  exempel?: boolean;
};

const KVALL = {
  scen: {
    src: "/evenemang/caroline-pa-scen.webp",
    alt: {
      sv: "Caroline berättar inför publik i en salong",
      en: "Caroline speaking to an audience in a salon",
      es: "Caroline hablando ante el público en un salón",
    },
  },
  publik: {
    src: "/evenemang/publik-salong.webp",
    alt: {
      sv: "Publik i soffor och stolar lyssnar på Caroline",
      en: "An audience on sofas and chairs listening to Caroline",
      es: "Público en sofás y sillas escuchando a Caroline",
    },
  },
  buffe: {
    src: "/evenemang/salong-buffe.webp",
    alt: {
      sv: "Caroline vid ett dukat bord med tilltugg",
      en: "Caroline by a table set with food",
      es: "Caroline junto a una mesa con picoteo",
    },
  },
} as const;

// Exakt adress skickas i bekräftelsen (står i anmälningstexten).
const PALMA_SALONG = { sv: "Salong i Palma", en: "Salon in Palma", es: "Salón en Palma" };

/**
 * EXEMPEL – alla evenemang nedan är påhittade för utkastet. Byt mot Carolines riktiga
 * evenemang innan sajten går live (se LANSERING.md).
 */
export const AKTIVITETER: readonly Aktivitet[] = [
  {
    id: "kvinnorna-som-formade-mallorca",
    datum: "2026-11-19",
    tid: "19:00",
    langd: { sv: "ca 2 timmar", en: "about 2 hours", es: "unas 2 horas" },
    typ: "stand-up-history",
    titel: {
      sv: "Kvinnorna som formade Mallorca",
      en: "The women who shaped Mallorca",
      es: "Las mujeres que dieron forma a Mallorca",
    },
    ingress: {
      sv: "Drottningar, helgon och rebeller. De kvinnor historieböckerna glömde.",
      en: "Queens, saints and rebels. The women the history books forgot.",
      es: "Reinas, santas y rebeldes: las mujeres que olvidaron los libros de historia.",
    },
    text: {
      sv: "En Stand Up History-kväll om kvinnorna bakom öns historia, från de kända till de helt bortglömda. Caroline berättar med humor och allvar, och kvällen avslutas med ett glas vin och lokalt tilltugg.",
      en: "A Stand Up History evening about the women behind the island's history, from the famous to the completely forgotten. Caroline tells it with humour and gravity, and the evening ends with a glass of wine and local bites.",
      es: "Una velada de Stand Up History sobre las mujeres detrás de la historia de la isla, de las famosas a las completamente olvidadas. Caroline la cuenta con humor y seriedad, y la noche termina con una copa de vino y picoteo local.",
    },
    plats: PALMA_SALONG,
    pris: {
      sv: "35 € inkl. vin och tilltugg",
      en: "€35 incl. wine and bites",
      es: "35 € con vino y picoteo",
    },
    sprak: { sv: "Svenska", en: "Swedish", es: "Sueco" },
    platser: 30,
    platserKvar: 8,
    bild: KVALL.scen,
    exempel: true,
  },
  {
    id: "film-goya-och-krigen",
    datum: "2026-11-27",
    tid: "18:30",
    langd: { sv: "ca 3 timmar", en: "about 3 hours", es: "unas 3 horas" },
    typ: "film",
    titel: {
      sv: "Filmkväll: Spanien under 1900-talet",
      en: "Film night: Spain in the 20th century",
      es: "Noche de cine: España en el siglo XX",
    },
    ingress: {
      sv: "En kort föreläsning sätter filmen i sitt sammanhang innan ljuset släcks.",
      en: "A short talk puts the film in context before the lights go down.",
      es: "Una breve charla sitúa la película en su contexto antes de que se apaguen las luces.",
    },
    text: {
      sv: "Caroline föreläser i 30 minuter om perioden filmen skildrar: vad som hände, vem som bestämde och varför det fortfarande spelar roll. Därefter visas filmen, och efteråt finns tid för samtal.",
      en: "Caroline gives a 30-minute talk on the period the film portrays: what happened, who decided and why it still matters. Then the film is shown, with time for conversation afterwards.",
      es: "Caroline da una charla de 30 minutos sobre la época que retrata la película: qué pasó, quién decidió y por qué sigue importando. Después se proyecta la película y hay tiempo para conversar.",
    },
    plats: { sv: "Biograf i Palma", en: "Cinema in Palma", es: "Cine en Palma" },
    pris: { sv: "20 €", en: "€20", es: "20 €" },
    sprak: { sv: "Svenska", en: "Swedish", es: "Sueco" },
    platser: 60,
    platserKvar: 41,
    bild: KVALL.publik,
    exempel: true,
  },
  {
    id: "museivandring-es-baluard",
    datum: "2026-12-05",
    tid: "11:00",
    langd: { sv: "ca 90 minuter", en: "about 90 minutes", es: "unos 90 minutos" },
    typ: "museum",
    titel: {
      sv: "Museivandring: Konsten och makten",
      en: "Museum walk: Art and power",
      es: "Recorrido por el museo: El arte y el poder",
    },
    ingress: {
      sv: "Ett museum, ett tema och berättelserna som inte står på skyltarna.",
      en: "One museum, one theme and the stories that aren't on the labels.",
      es: "Un museo, un tema y las historias que no aparecen en las cartelas.",
    },
    text: {
      sv: "En föreläsning på plats i ett av Palmas museer, kring ett handfull utvalda verk och vad de säger om makten på ön. Museets entré ingår inte.",
      en: "A talk on site in one of Palma's museums, around a handful of chosen works and what they say about power on the island. Museum admission is not included.",
      es: "Una charla en uno de los museos de Palma, en torno a unas pocas obras escogidas y lo que dicen sobre el poder en la isla. La entrada al museo no está incluida.",
    },
    plats: { sv: "Museum i Palma", en: "Museum in Palma", es: "Museo en Palma" },
    pris: { sv: "25 €", en: "€25", es: "25 €" },
    sprak: { sv: "Svenska", en: "Swedish", es: "Sueco" },
    platser: 15,
    platserKvar: 0,
    bild: KVALL.scen,
    exempel: true,
  },
  {
    id: "stand-up-history-inkvisitionen",
    datum: "2026-12-10",
    tid: "19:00",
    langd: { sv: "ca 2 timmar", en: "about 2 hours", es: "unas 2 horas" },
    typ: "stand-up-history",
    titel: {
      sv: "Inkvisitionen: skvaller, makt och rädsla",
      en: "The Inquisition: gossip, power and fear",
      es: "La Inquisición: chismes, poder y miedo",
    },
    ingress: {
      sv: "Hur grannar blev angivare, och vad det säger om oss i dag.",
      en: "How neighbours became informers, and what it says about us today.",
      es: "Cómo los vecinos se convirtieron en delatores, y qué dice eso de nosotros hoy.",
    },
    text: {
      sv: "En Stand Up History-kväll om inkvisitionen på Mallorca. Mörkt ämne, men berättat med värme och humor. Kvällen avslutas med mingel.",
      en: "A Stand Up History evening about the Inquisition in Mallorca. A dark subject, told with warmth and humour. The evening ends with drinks.",
      es: "Una velada de Stand Up History sobre la Inquisición en Mallorca. Un tema oscuro, contado con calidez y humor. La noche termina con una copa.",
    },
    plats: PALMA_SALONG,
    pris: {
      sv: "35 € inkl. vin och tilltugg",
      en: "€35 incl. wine and bites",
      es: "35 € con vino y picoteo",
    },
    sprak: { sv: "Engelska", en: "English", es: "Inglés" },
    platser: 30,
    platserKvar: 22,
    bild: KVALL.buffe,
    exempel: true,
  },
  {
    id: "jul-pa-mallorca",
    datum: "2027-01-14",
    tid: "19:00",
    langd: { sv: "ca 2 timmar", en: "about 2 hours", es: "unas 2 horas" },
    typ: "stand-up-history",
    titel: {
      sv: "Från Kungarnas dag till karneval",
      en: "From Epiphany to carnival",
      es: "De Reyes al carnaval",
    },
    ingress: {
      sv: "Varför Mallorca firar som det gör, och historien bakom traditionerna.",
      en: "Why Mallorca celebrates the way it does, and the history behind the traditions.",
      es: "Por qué Mallorca celebra como celebra: las tradiciones y la historia detrás.",
    },
    text: {
      sv: "Ett lättsamt avstamp på det nya året om öns högtider, från Kungarnas dag till Sant Antoni och karnevalen.",
      en: "A light-hearted start to the new year about the island's festivities, from Epiphany to Sant Antoni and carnival.",
      es: "Un comienzo de año desenfadado sobre las fiestas de la isla, de Reyes a Sant Antoni y el carnaval.",
    },
    plats: PALMA_SALONG,
    pris: {
      sv: "35 € inkl. vin och tilltugg",
      en: "€35 incl. wine and bites",
      es: "35 € con vino y picoteo",
    },
    sprak: { sv: "Svenska", en: "Swedish", es: "Sueco" },
    platser: 30,
    platserKvar: 30,
    bild: KVALL.publik,
    exempel: true,
  },
];

/** Kommande evenemang (från i dag), sorterade på datum. */
export function kommande(idag: string = new Date().toISOString().slice(0, 10)): Aktivitet[] {
  return [...AKTIVITETER]
    .filter((a) => a.datum >= idag)
    .sort((a, b) => a.datum.localeCompare(b.datum));
}

export type Citat = { text: PerSprak; namn: string; sammanhang: PerSprak; exempel?: boolean };

/** EXEMPEL – påhittade citat. Byt mot riktiga omdömen (med personens tillåtelse) före lansering. */
export const CITAT: readonly Citat[] = [
  {
    text: {
      sv: "Jag har bott på Mallorca i tolv år och trodde att jag kunde öns historia. Efter en kväll med Caroline vet jag att jag inte gjorde det.",
      en: "I've lived in Mallorca for twelve years and thought I knew the island's history. After one evening with Caroline I know I didn't.",
      es: "Llevo doce años viviendo en Mallorca y creía conocer su historia. Después de una velada con Caroline sé que no era así.",
    },
    namn: "Anna L.",
    sammanhang: { sv: "Stand Up History", en: "Stand Up History", es: "Stand Up History" },
    exempel: true,
  },
  {
    text: {
      sv: "Roligaste föreläsningen jag varit på. Vi skrattade hela kvällen och gick hem klokare.",
      en: "The funniest talk I've ever been to. We laughed all evening and went home wiser.",
      es: "La charla más divertida a la que he ido. Nos reímos toda la noche y volvimos a casa sabiendo más.",
    },
    namn: "Peter S.",
    sammanhang: { sv: "Filmkväll", en: "Film night", es: "Noche de cine" },
    exempel: true,
  },
  {
    text: {
      sv: "Vi bokade Caroline till vår förening och medlemmarna pratar fortfarande om det.",
      en: "We booked Caroline for our association and the members are still talking about it.",
      es: "Contratamos a Caroline para nuestra asociación y los socios todavía hablan de ello.",
    },
    namn: "Karin B.",
    sammanhang: { sv: "Föreningskväll", en: "Association evening", es: "Velada de asociación" },
    exempel: true,
  },
];
