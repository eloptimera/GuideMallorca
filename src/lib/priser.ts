// Alla priser på sajten. Beloppen står bara här – prissidan, tjänstesidorna, strukturerad
// data och llms.txt läser härifrån. Alla priser är exkl. moms.
//
// Erbjudandet (beslutat 2026-10-22): fyra delar som köps var för sig – Studio, Annonser,
// Synlighet och Webb – plus toppaketet Extern marknadsavdelning. Ersätter Start/Growth/Premium.
//
// Interna kalkyler (timmar, timpris, verktygskostnad) publiceras aldrig på sajten.
//
// TODO(TAB): kontrollera att Higgsfield-planen tillåter kommersiell användning för kunders
// räkning innan "fri kommersiell användningsrätt" utlovas skarpt.
// TODO(TAB): kontrollera att TAB:s Vercel-plan är Pro (inte Hobby) innan kundsajter läggs i drift.

export const PRIS = {
  // Studio – engång
  bilder5: 1995,
  bilder10: 3495,
  bilder20: 5995,
  videor3: 3495,
  extraVideo: 995,
  studioSkraddarsytt: 9995,
  omtagPerBild: 195,
  // Studio – abonnemang
  studioS: 1795,
  studioM: 3495,
  studioL: 6495,
  // Annonser
  annonsUppsattning: 3995,
  annonser1: 2995,
  annonser2: 5995,
  annonserSkraddarsytt: 8995,
  // Synlighet
  foretagsprofil: 1995,
  grundoptimering: 5995,
  grundoptimeringStor: 9995,
  grundoptimeringLista: 3995,
  synlighetBas: 3995,
  synlighetMellan: 6995,
  synlighetHog: 9995,
  synlighetSkraddarsytt: 12995,
  // Webb – bygge
  landningssida: 4995,
  foretagshemsida: 6995,
  extraSida: 1995,
  webbSkraddarsytt: 14995,
  cms: 4995,
  /** Modernisering av en befintlig sajt – alltid offert, det här är offertens från-pris. */
  modernisering: 3995,
  // Webb – efter lansering
  klippkort2: 1995,
  klippkort5: 4495,
  essential: 495,
  total: 1295,
  extraTimme: 995,
  // Toppaket
  extern: 37995,
} as const;

/** Lägsta månadspris på sajten – "marknadsföring från …/mån". */
export const LAGSTA_MANADSPRIS = PRIS.studioS;
/** Lägsta pris för en ny hemsida. */
export const LAGSTA_HEMSIDA = PRIS.landningssida;

export const MOMS_TEXT = "Alla priser är exkl. moms.";

export const BINDNING_TEXT =
  "Ingen bindningstid. Månadstjänster löper till slutet av den period ni redan betalat för.";

export const STARTAVGIFT_TEXT = `Ingen startavgift. Två tjänster kräver ett engångsjobb innan det löpande arbetet kan börja: annonsuppsättning (${kr(PRIS.annonsUppsattning)}) före Annonser och grundoptimering (från ${kr(PRIS.grundoptimering)}) före Synlighet. Är det redan gjort hoppar vi över det.`;

export const SVARSTID_TEXT = "Vi svarar inom en arbetsdag.";

/** Omtag på bilder och video. */
export const GARANTI_TEXT = `Fel från vår sida gör vi alltid om utan kostnad. Vill ni ändra riktning ingår en omtagsrunda, därefter ${kr(PRIS.omtagPerBild)} per bild.`;

export const AGANDE_TEXT =
  "Ni äger konton, domän, texter och kod. För bilder och videor vi tar fram med AI får ni fri kommersiell användningsrätt.";

/** Domän i Total – samma text överallt där frågan kan uppstå. */
export const DOMAN_TEXT =
  "I Total ingår en domän med vanlig ändelse, som .se, .nu eller .com. Väljer ni ett dyrare domännamn kan det tillkomma en kostnad – den stämmer vi av med er innan vi köper domänen.";

export const BETALNING_TEXT = "Faktura i förskott för varje period, 15 dagars betalningstid.";

export const RESULTAT_TEXT =
  "Placering på Google, omnämnanden i AI-svar och annonsresultat styrs av andra och kan inte garanteras.";

export const LOFTEN: readonly { titel: string; text: string }[] = [
  { titel: "Ingen bindningstid", text: BINDNING_TEXT.replace("Ingen bindningstid. ", "") },
  { titel: "Ingen startavgift", text: "Bara tydliga engångsjobb där det behövs." },
  { titel: "Ni äger det ni betalat för", text: AGANDE_TEXT },
  { titel: "Svar inom en arbetsdag", text: "På bokningar, frågor och ändringar." },
];

/** 2995 → "2 995 kr" (med hårt mellanslag så att beloppet aldrig bryts). */
export function kr(belopp: number): string {
  return `${String(belopp).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00a0")}\u00a0kr`;
}

/** En nivå med fast pris – löpande per månad eller ett engångsjobb. */
export type Niva = {
  /** Används i bokningslänken (?paket=…). */
  id: string;
  namn: string;
  belopp: number;
  enhet: "mån" | "engång";
  fran?: boolean;
  ingar: readonly string[];
  /** Den nivå som lyfts fram visuellt. */
  utvald?: boolean;
};

/** En rad i en pristabell. `pris` är ett belopp i kronor, "Gratis" eller en kort text. */
export type Prisrad = {
  tjanst: string;
  pris: number | string;
  fran?: boolean;
  /** Kort förklaring under raden. */
  not?: string;
  /** Slug för tjänsten raden hör till – länkas till tjänstens sida. */
  slug?: string;
};

export function prisText(rad: Pick<Prisrad, "pris" | "fran">): string {
  if (typeof rad.pris === "string") return rad.pris;
  return rad.fran ? `från ${kr(rad.pris)}` : kr(rad.pris);
}

export type DelId = "studio" | "annonser" | "synlighet" | "webb";

export type Del = {
  id: DelId;
  namn: string;
  /** Vad kunden köper, en rad. */
  vad: string;
  /** Tjänsten delen hör till (tjanster.ts) – för länkar. */
  slug: string;
  lagsta: { belopp: number; enhet: "mån" | "engång" };
  /** Kort beskrivning överst i avsnittet. */
  intro: string;
  engang: readonly Prisrad[];
  /** Rubrik för nivåerna, t.ex. "Abonnemang". */
  nivaRubrik: string;
  nivaer: readonly Niva[];
  skraddarsytt: { pris: number; enhet: "mån" | "engång"; text: string };
  /** Vad som ingår i varje beställning. */
  ingarAlltid?: readonly string[];
  /** Krav och gränser. */
  granser: readonly string[];
};

export const STUDIO: Del = {
  id: "studio",
  namn: "Studio",
  vad: "Bilder och korta videor",
  slug: "marknadsforingsbilder",
  lagsta: { belopp: PRIS.studioS, enhet: "mån" },
  intro:
    "Produkt- och kampanjbilder och korta videor, framtagna med AI utifrån era produktfoton. Abonnemang ger lägre pris per bild än engångsköp.",
  engang: [
    { tjanst: "5 bilder", pris: PRIS.bilder5, slug: "marknadsforingsbilder" },
    { tjanst: "10 bilder", pris: PRIS.bilder10, slug: "marknadsforingsbilder" },
    { tjanst: "20 bilder", pris: PRIS.bilder20, slug: "marknadsforingsbilder" },
    {
      tjanst: "3 korta videor",
      pris: PRIS.videor3,
      not: `Extra video ${kr(PRIS.extraVideo)} st`,
      slug: "marknadsforingsbilder",
    },
  ],
  nivaRubrik: "Abonnemang",
  nivaer: [
    {
      id: "studio-s",
      namn: "Studio S",
      belopp: PRIS.studioS,
      enhet: "mån",
      ingar: ["5 bilder per månad"],
    },
    {
      id: "studio-m",
      namn: "Studio M",
      belopp: PRIS.studioM,
      enhet: "mån",
      utvald: true,
      ingar: ["10 bilder + 1 kort video per månad", "Enkel innehållsplan"],
    },
    {
      id: "studio-l",
      namn: "Studio L",
      belopp: PRIS.studioL,
      enhet: "mån",
      ingar: ["20 bilder + 3 korta videor per månad", "Innehållsplan", "En avstämning per månad"],
    },
  ],
  skraddarsytt: {
    pris: PRIS.studioSkraddarsytt,
    enhet: "engång",
    text: "Lookbooks, kampanjer med 40+ bilder, längre video, voice-over",
  },
  ingarAlltid: [
    "En bildstil och ett koncept",
    "2–3 testbilder som ni godkänner innan resten produceras",
    "Upp till 3 format per bild (1:1, 4:5, 9:16 eller 16:9)",
    "Video: 15–30 sekunder i stående format, med text och musik licensierad för kommersiellt bruk",
    "Leverans inom 5 arbetsdagar i en delad mapp",
    "Fri kommersiell användningsrätt",
  ],
  granser: [
    "Ni skickar egna produktfoton – utan referens kan vi inte garantera hur produkten ser ut.",
    GARANTI_TEXT,
    "Ingår inte: fotografering på plats, riktiga personer eller kändisar, logotypdesign, tryckoriginal i stora format.",
  ],
};

export const ANNONSER: Del = {
  id: "annonser",
  namn: "Annonser",
  vad: "Annonser på Facebook och Instagram",
  slug: "meta-annonser",
  lagsta: { belopp: PRIS.annonser1, enhet: "mån" },
  intro:
    "Priset styrs av hur många nya kampanjer vi startar per månad, med annonsbudgeten som tak – inte av hur mycket pengar som går igenom kontot. Annonsbudgeten betalar ni direkt till Meta.",
  engang: [
    {
      tjanst: "Annonsuppsättning",
      pris: PRIS.annonsUppsattning,
      not: "Business Manager, annonskonto, pixel, samtyckesbanner och första kampanjen",
      slug: "meta-annonser",
    },
  ],
  nivaRubrik: "Löpande",
  nivaer: [
    {
      id: "annonser-1",
      namn: "Annonser 1",
      belopp: PRIS.annonser1,
      enhet: "mån",
      ingar: [
        "1 ny kampanj per månad",
        "Annonsbudget upp till 10 000 kr/mån",
        "Kontroll varje vecka och månadsrapport",
      ],
    },
    {
      id: "annonser-2",
      namn: "Annonser 2",
      belopp: PRIS.annonser2,
      enhet: "mån",
      ingar: [
        "Upp till 3 nya kampanjer per månad",
        "Annonsbudget upp till 25 000 kr/mån",
        "Kontroll varje vecka och månadsrapport",
      ],
    },
  ],
  skraddarsytt: {
    pris: PRIS.annonserSkraddarsytt,
    enhet: "mån",
    text: "Högre budget, fler kampanjer, flera marknader, katalogannonser för e-handel",
  },
  ingarAlltid: [
    "En kampanj = ett mål, en målgrupp, upp till 3 annonsvarianter och upp till 4 veckors löptid",
    "Utan Studio: upp till 3 varianter av era befintliga bilder eller videor per kampanj – beskurna, med text och i rätt format",
    "Nytt bild- och videomaterial köps till i Studio",
  ],
  granser: [
    "Annonsbudgeten betalar ni direkt till Meta med eget kort. Vi hanterar aldrig era annonspengar.",
    "Samtyckesbannern sätts upp när vi har tillgång till er hemsida.",
    "Ingår inte: annonsbudget, nytt bild- och videomaterial, landningssidor. Resultatet beror mycket på materialet.",
  ],
};

export const SYNLIGHET: Del = {
  id: "synlighet",
  namn: "Synlighet",
  vad: "SEO och GEO: Google och AI-svar",
  slug: "seo",
  lagsta: { belopp: PRIS.synlighetBas, enhet: "mån" },
  intro:
    "Att hittas på Google och i AI-svar som ChatGPT. Först en grundoptimering, sedan en löpande nivå som vi föreslår efter genomgången – utifrån er konkurrens och hur sajten ser ut.",
  engang: [
    {
      tjanst: "AI-koll",
      pris: "Gratis",
      not: "Vad ChatGPT svarar om er och er bransch – ingår i genomgången",
    },
    {
      tjanst: "Google-företagsprofil",
      pris: PRIS.foretagsprofil,
      not: "Verifiering eller övertagande, kategorier, tjänster, serviceområde och bilder",
      slug: "seo",
    },
    {
      tjanst: "Grundoptimering, upp till 10 sidor",
      pris: PRIS.grundoptimering,
      not: "Teknik, sökordsanalys, strukturerad data, Search Console och Bing i ert namn, plan för 3 månader",
      slug: "seo",
    },
    {
      tjanst: "Grundoptimering, 11–30 sidor",
      pris: PRIS.grundoptimeringStor,
      slug: "seo",
    },
    {
      tjanst: "Grundoptimering som åtgärdslista",
      pris: PRIS.grundoptimeringLista,
      not: "Utan åtkomst: prioriterad lista med instruktioner – ni genomför själva",
      slug: "seo",
    },
  ],
  nivaRubrik: "Löpande",
  nivaer: [
    {
      id: "synlighet-bas",
      namn: "Synlighet Bas",
      belopp: PRIS.synlighetBas,
      enhet: "mån",
      ingar: ["1 ny eller förbättrad sida per månad", "Teknisk bevakning, AI-koll och rapport"],
    },
    {
      id: "synlighet-mellan",
      namn: "Synlighet Mellan",
      belopp: PRIS.synlighetMellan,
      enhet: "mån",
      ingar: ["3 nya eller förbättrade sidor per månad", "Teknisk bevakning, AI-koll och rapport"],
    },
    {
      id: "synlighet-hog",
      namn: "Synlighet Hög",
      belopp: PRIS.synlighetHog,
      enhet: "mån",
      ingar: [
        "4 nya eller förbättrade sidor per månad",
        "Konkurrentbevakning och utökad AI-koll",
        "Avstämning varje månad",
      ],
    },
  ],
  skraddarsytt: {
    pris: PRIS.synlighetSkraddarsytt,
    enhet: "mån",
    text: "Stora sajter, flera orter eller språk, e-handel",
  },
  ingarAlltid: [
    "Texterna skrivs med AI utifrån era uppgifter och granskas av oss. För varje ny sida fyller ni i ett kort formulär (10–15 minuter).",
    "Ger ni oss redaktörsåtkomst publicerar vi själva. Annars får ni färdigt underlag per sida – text, rubriker, metadata och strukturerad data – och publicerar själva.",
    "Vi tar en säkerhetskopia innan vi ändrar något på en befintlig sajt.",
  ],
  granser: [
    "Den löpande nivån kräver en grundoptimering först – eller att vi har byggt sajten.",
    "Ingår: nya och förbättrade texter, rubriker, metadata, strukturerad data och interna länkar. Ny design, nya funktioner och ändringar i layout räknas som Webb.",
    "Länkbygge, samarbeten och outreach ingår inte – ni får tips om omnämnanden.",
  ],
};

export const WEBB: Del = {
  id: "webb",
  namn: "Webb",
  vad: "Ny hemsida, drift och ändringar",
  slug: "hemsida",
  lagsta: { belopp: PRIS.landningssida, enhet: "engång" },
  intro:
    "Vi bygger hemsidan till fast pris. Efter lansering väljer ni själva: ta över allt, eller låt oss sköta drift och ändringar.",
  engang: [
    {
      tjanst: "Landningssida",
      pris: PRIS.landningssida,
      not: "En sida med design, texter, kontakt- eller offertformulär, SEO-grund och en ändringsrunda",
      slug: "hemsida",
    },
    {
      tjanst: "Företagshemsida",
      pris: PRIS.foretagshemsida,
      not: "Upp till 5 sidor, fler integrationer, Search Console och Bing",
      slug: "hemsida",
    },
    { tjanst: "Extra sida", pris: PRIS.extraSida, slug: "hemsida" },
    {
      tjanst: "Redigeringsverktyg (CMS)",
      pris: PRIS.cms,
      not: "För er som tar över sajten och vill ändra texter själva",
      slug: "hemsida",
    },
    {
      tjanst: "Modernisera befintlig hemsida",
      pris: PRIS.modernisering,
      fran: true,
      not: "Offert – fast pris efter genomgången",
      slug: "hemsideoptimering",
    },
  ],
  nivaRubrik: "Efter lansering",
  nivaer: [
    {
      id: "webb-essential",
      namn: "Essential",
      belopp: PRIS.essential,
      enhet: "mån",
      ingar: ["Hosting och SSL", "Övervakning och säkerhetsuppdateringar", "Backup"],
    },
    {
      id: "webb-total",
      namn: "Total",
      belopp: PRIS.total,
      enhet: "mån",
      utvald: true,
      ingar: [
        "Allt i Essential",
        "Domän (dyrare domännamn kan kosta extra)",
        "Upp till 1 timme ändringar per månad",
        `Därutöver ${kr(PRIS.extraTimme)} per påbörjad timme`,
      ],
    },
  ],
  skraddarsytt: {
    pris: PRIS.webbSkraddarsytt,
    enhet: "engång",
    text: "Bokning, flera språk, inloggning, fler än 10 sidor, andra plattformar",
  },
  ingarAlltid: [
    `Överlämning ingår i bygget: ni får kod, konton och inloggningar. Senare ändringar via klippkort – 2 timmar ${kr(PRIS.klippkort2)} eller 5 timmar ${kr(PRIS.klippkort5)}, giltigt i 12 månader.`,
    "Domänen ligger alltid i ert namn. Ligger sajten i vår drift får ni flytta den när ni vill – ni får koden och en timmes flytthjälp utan kostnad.",
    "Texterna skrivs med AI utifrån ett formulär ni fyller i, och granskas av oss.",
  ],
  granser: [
    "Fasta priser gäller hemsidor vi bygger i vår egen uppsättning. Andra plattformar, som WordPress eller Webflow, på offert.",
    "Vi bygger inte webbshoppar.",
    "Ingår inte: bilder (köps i Studio) och löpande SEO (köps i Synlighet).",
  ],
};

export const DELAR: readonly Del[] = [STUDIO, ANNONSER, SYNLIGHET, WEBB];

export const EXTERN = {
  id: "extern",
  namn: "Extern marknadsavdelning",
  belopp: PRIS.extern,
  /** Hur många kunder vi tar samtidigt. */
  maxKunder: 2,
  ingar: [
    "Studio: 30 bilder + 6 korta videor per månad, innehållsplan per kvartal",
    "Annonser: upp till 5 nya kampanjer per månad, budget upp till 50 000 kr/mån",
    "Synlighet: nivå Hög",
    "Webb: Total – drift och ändringar för en sajt vi byggt",
    "Avstämning varje vecka och svar inom 4 timmar på vardagar",
    "Annonsuppsättning och grundoptimering ingår",
  ],
} as const;

/** Alla månadsnivåer – kontaktformulärets val och den strukturerade datan. */
export const PAKET: readonly Niva[] = [
  ...STUDIO.nivaer,
  ...ANNONSER.nivaer,
  ...SYNLIGHET.nivaer,
  ...WEBB.nivaer,
  {
    id: EXTERN.id,
    namn: EXTERN.namn,
    belopp: EXTERN.belopp,
    enhet: "mån",
    ingar: EXTERN.ingar,
  },
];

/** Vanliga kombinationer – summan av delarna, utan rabatt. */
export const KOMBINATIONER: readonly {
  namn: string;
  delar: string;
  manad: number;
  uppstart: number | "Ingår";
  vanligast?: boolean;
}[] = [
  {
    namn: "Bilder och annonser",
    delar: "Studio M + Annonser 1",
    manad: PRIS.studioM + PRIS.annonser1,
    uppstart: PRIS.annonsUppsattning,
  },
  {
    namn: "Bilder och synlighet",
    delar: "Studio S + Synlighet Bas",
    manad: PRIS.studioS + PRIS.synlighetBas,
    uppstart: PRIS.grundoptimering,
  },
  {
    namn: "Bilder, annonser och synlighet",
    delar: "Studio M + Annonser 1 + Synlighet Bas",
    manad: PRIS.studioM + PRIS.annonser1 + PRIS.synlighetBas,
    uppstart: PRIS.annonsUppsattning + PRIS.grundoptimering,
    vanligast: true,
  },
  {
    namn: EXTERN.namn,
    delar: "Allt i ett",
    manad: PRIS.extern,
    uppstart: "Ingår",
  },
];

/** Råd om att börja med en del i taget – samma text där kombinationerna visas. */
export const EN_I_TAGET_TEXT =
  "Ni behöver inte köpa allt på en gång. De flesta börjar med en eller två delar – till exempel Studio och Annonser – och lägger till Synlighet när de första kampanjerna rullar. Då blir första fakturan lägre och ni ser vad varje del ger.";

/** Gränsen mellan Synlighet och Webb – samma text överallt där frågan kan uppstå. */
export const WEBB_GRANS_TEXT =
  "Nya och förbättrade texter, rubriker, metadata, strukturerad data och interna länkar ingår i Synlighet. Ny design, nya funktioner, nya sidmallar och ändringar i layout räknas som Webb.";

/** Hur ändringar på en hemsida köps – samma text överallt. */
export const ANDRINGAR_TEXT = `Ändringar på en sajt vi byggt ingår upp till en timme per månad i Total (${kr(PRIS.total)}/mån). Har ni tagit över sajten köper ni ändringar via klippkort: 2 timmar ${kr(PRIS.klippkort2)} eller 5 timmar ${kr(PRIS.klippkort5)}.`;

export type Fraga = { fraga: string; svar: string };

/** Search Console ingår i allt SEO-arbete – samma svar på prissidan och SEO-sidan. */
export const GSC_SVAR =
  "Ja. Vi kopplar Google Search Console och Bing Webmaster Tools till er hemsida, i ert eget namn. Därifrån följer vi upp vilka sökningar ni syns på och hur många som klickar, och kontot är ert även om ni slutar hos oss.";

export const PRIS_FRAGOR: readonly Fraga[] = [
  {
    fraga: "Vad kostar marknadsföring hos er?",
    svar: `Ni köper det ni behöver. Studio (bilder och video) från ${kr(PRIS.studioS)}/mån, Annonser från ${kr(PRIS.annonser1)}/mån, Synlighet (SEO och GEO) från ${kr(PRIS.synlighetBas)}/mån och en ny hemsida från ${kr(PRIS.landningssida)}. ${MOMS_TEXT}`,
  },
  {
    fraga: "Finns det någon bindningstid?",
    svar: BINDNING_TEXT,
  },
  {
    fraga: "Finns det en startavgift?",
    svar: STARTAVGIFT_TEXT,
  },
  {
    fraga: "Måste vi köpa allt på en gång?",
    svar: EN_I_TAGET_TEXT,
  },
  {
    fraga: "Ingår ändringar på hemsidan?",
    svar: `${ANDRINGAR_TEXT} ${WEBB_GRANS_TEXT}`,
  },
  {
    fraga: "Vad händer om vi inte är nöjda med bilderna?",
    svar: `${GARANTI_TEXT} Innan vi producerar allt godkänner ni 2–3 testbilder. För hemsidor ingår en ändringsrunda innan lansering.`,
  },
  {
    fraga: "Vem äger det ni tar fram?",
    svar: `${AGANDE_TEXT} Konton för Google, Meta och domän ligger i ert namn – vi får bara åtkomst.`,
  },
  {
    fraga: "Ingår annonsbudgeten i priset?",
    svar: "Nej. Annonsbudgeten betalar ni direkt till Meta med eget kort – vi hanterar aldrig era annonspengar. Våra priser gäller arbetet.",
  },
  {
    fraga: "Hur väljer vi nivå för Synlighet?",
    svar: "Den föreslår vi efter genomgången, utifrån hur hård konkurrensen är och hur sajten ser ut. Ni får förslaget skriftligt med fast pris och bestämmer själva.",
  },
  {
    fraga: "Kostar första mötet något?",
    svar: "Nej. Genomgången på 20–25 minuter, på video eller telefon, och förslaget efteråt är gratis.",
  },
  {
    fraga: "Tar ni betalt per timme?",
    svar: `Nej. Allt har fast pris – antingen ett pris per nivå eller en offert med fast pris. Det enda som räknas i timmar är ändringar på en färdig hemsida: via klippkort som ni köper i förväg, eller ${kr(PRIS.extraTimme)} per påbörjad timme utöver det som ingår i Total.`,
  },
  {
    fraga: "Ingår Google Search Console?",
    svar: GSC_SVAR,
  },
];
