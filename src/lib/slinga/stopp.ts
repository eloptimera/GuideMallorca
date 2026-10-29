// Stoppen på stadsvandringen, i ordning. Pluppen går den kortaste gångvägen mellan dem på
// kartans riktiga gator och stannar vid varje stopp, där kortet med bild och text visas.
//
// Koordinaterna är platsen pluppen ska stanna på. Ändras rutten: byt ordning eller lägg till
// stopp här – linjen räknas om automatiskt.
import type { Sprak } from "@/lib/sprak";

type PerSprak = Record<Sprak, string>;

export type Stopp = {
  namn: PerSprak;
  text: PerSprak;
  lat: number;
  lng: number;
  /** Bild i public/stopp (800 × 600, WebP). Sista stoppet har ingen. */
  bild?: { src: string; alt: PerSprak };
  /** Sista stoppet: visar en knapp till bokningen i stället för en bild. */
  slut?: boolean;
};

/** Platsnamnet är detsamma på alla språk. */
const samma = (namn: string): PerSprak => ({ sv: namn, en: namn, es: namn });

export const STOPP: readonly Stopp[] = [
  {
    namn: { sv: "Plaza de España", en: "Plaza de España", es: "Plaza de España" },
    text: {
      sv: "Palmas centrala knutpunkt och historiska port, där det moderna stadslivet möter historien vid statyn av kung Jaime I.",
      en: "Palma's central hub and historic gateway, where modern city life meets history at the statue of King Jaime I.",
      es: "El gran punto de encuentro y antigua puerta de Palma, donde la vida moderna se cruza con la historia junto a la estatua del rey Jaime I.",
    },
    lat: 39.5756,
    lng: 2.65362,
    bild: {
      src: "/stopp/plaza-de-espana.webp",
      alt: {
        sv: "Ryttarstatyn av kung Jaime I på Plaza de España i kvällsljus",
        en: "The equestrian statue of King Jaime I on Plaza de España at dusk",
        es: "La estatua ecuestre del rey Jaime I en la Plaza de España al atardecer",
      },
    },
  },
  {
    namn: samma("Mercat de l'Olivar"),
    text: {
      sv: "Stadens största och mest färgstarka saluhall – ett sensoriskt äventyr fyllt av mallorcanska smaker, färsk fisk och lokala råvaror.",
      en: "The city's largest and most colourful market hall – a feast for the senses full of Mallorcan flavours, fresh fish and local produce.",
      es: "El mercado más grande y colorido de la ciudad: una aventura para los sentidos llena de sabores mallorquines, pescado fresco y producto local.",
    },
    lat: 39.5729,
    lng: 2.6537,
    bild: {
      src: "/stopp/mercat-olivar.webp",
      alt: {
        sv: "Charkdisk med skinkor i Mercat de l'Olivar",
        en: "A charcuterie counter with hams in Mercat de l'Olivar",
        es: "Un puesto de embutidos con jamones en el Mercat de l'Olivar",
      },
    },
  },
  {
    namn: samma("Plaça Major"),
    text: {
      sv: "Det storslagna och livliga torget i hjärtat av de gamla kvarteren, omgivet av spansk arkitektur och mysiga uteserveringar.",
      en: "The grand, lively square at the heart of the old town, framed by Spanish architecture and inviting terraces.",
      es: "La gran plaza llena de vida en el corazón del casco antiguo, rodeada de arquitectura española y terrazas acogedoras.",
    },
    lat: 39.5714,
    lng: 2.6509,
    bild: {
      src: "/stopp/placa-major.webp",
      alt: {
        sv: "Plaça Major med gula fasader och gröna fönsterluckor",
        en: "Plaça Major with yellow façades and green shutters",
        es: "La Plaça Major con fachadas amarillas y contraventanas verdes",
      },
    },
  },
  {
    namn: samma("Plaça de Cort"),
    text: {
      sv: "Hem till Palmas vackra rådhus och det urgamla olivträdet Olivera de Cort, som har vakat över torget i århundraden.",
      en: "Home to Palma's beautiful city hall and the ancient olive tree Olivera de Cort, which has watched over the square for centuries.",
      es: "Aquí están el bello ayuntamiento de Palma y el olivo milenario de Cort, que lleva siglos velando por la plaza.",
    },
    lat: 39.56961,
    lng: 2.65019,
    bild: {
      src: "/stopp/placa-de-cort.webp",
      alt: {
        sv: "Palmas rådhus vid Plaça de Cort i skymningen",
        en: "Palma's city hall on Plaça de Cort at twilight",
        es: "El ayuntamiento de Palma en la Plaça de Cort al anochecer",
      },
    },
  },
  {
    namn: samma("La Seu"),
    text: {
      sv: "Stadens majestätiska gotiska mästerverk som reser sig över havet, världsberömt för sina rosettfönster och sitt ljusspel.",
      en: "The city's majestic Gothic masterpiece rising above the sea, world-famous for its rose windows and play of light.",
      es: "La majestuosa obra maestra gótica que se alza sobre el mar, famosa en todo el mundo por sus rosetones y sus juegos de luz.",
    },
    lat: 39.5675,
    lng: 2.649,
    bild: {
      src: "/stopp/la-seu.webp",
      alt: {
        sv: "Katedralen La Seu som speglar sig i vattnet nedanför",
        en: "La Seu cathedral reflected in the water below",
        es: "La catedral de La Seu reflejada en el agua",
      },
    },
  },
  {
    namn: samma("Sa Llotja"),
    text: {
      sv: "Ett arkitektoniskt mästerverk från 1400-talet, vars gotiska pelarsalar en gång var medelhavshandelns ekonomiska hjärta.",
      en: "A 15th-century architectural masterpiece whose Gothic halls were once the financial heart of Mediterranean trade.",
      es: "Una obra maestra del siglo XV cuyas salas góticas fueron en su día el corazón económico del comercio mediterráneo.",
    },
    lat: 39.56837,
    lng: 2.64432,
    bild: {
      src: "/stopp/sa-llotja.webp",
      alt: {
        sv: "Sa Llotja med sina tinnar bakom palmer",
        en: "Sa Llotja with its battlements behind palm trees",
        es: "Sa Llotja con sus almenas tras las palmeras",
      },
    },
  },
  {
    namn: { sv: "Färdig", en: "Finished", es: "Fin del recorrido" },
    text: {
      sv: "Efter cirka två timmar rundar vi av vid Es Baluard, fulla av nya intryck och berättelser om Palmas dolda skatter.",
      en: "After about two hours we finish at Es Baluard, full of new impressions and stories about Palma's hidden treasures.",
      es: "Tras unas dos horas terminamos en Es Baluard, con muchas impresiones nuevas e historias sobre los tesoros escondidos de Palma.",
    },
    // Plaça de la Porta de Santa Catalina, vid Es Baluard.
    lat: 39.5701,
    lng: 2.6397,
    slut: true,
  },
];
