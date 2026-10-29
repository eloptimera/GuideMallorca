// Stoppen på stadsvandringen, i ordning. Pluppen går den kortaste gångvägen mellan dem på
// kartans riktiga gator och stannar vid varje stopp, där kortet med bild och text visas.
//
// Koordinaterna är platsen pluppen ska stanna på. Ändras rutten: byt ordning eller lägg till
// stopp här – linjen räknas om automatiskt.
export type Stopp = {
  namn: string;
  text: string;
  lat: number;
  lng: number;
  /** Bild i public/stopp (800 × 600, WebP). Sista stoppet har ingen. */
  bild?: { src: string; alt: string };
  /** Sista stoppet: visar en knapp till bokningen i stället för en bild. */
  slut?: boolean;
};

export const STOPP: readonly Stopp[] = [
  {
    namn: "Plaza de España",
    text: "Palmas centrala knutpunkt och historiska port, där det moderna stadslivet möter historien vid statyn av kung Jaime I.",
    lat: 39.5756,
    lng: 2.65362,
    bild: {
      src: "/stopp/plaza-de-espana.webp",
      alt: "Ryttarstatyn av kung Jaime I på Plaza de España i kvällsljus",
    },
  },
  {
    namn: "Mercat de l'Olivar",
    text: "Stadens största och mest färgstarka saluhall – ett sensoriskt äventyr fyllt av mallorcanska smaker, färsk fisk och lokala råvaror.",
    lat: 39.5729,
    lng: 2.6537,
    bild: { src: "/stopp/mercat-olivar.webp", alt: "Charkdisk med skinkor i Mercat de l'Olivar" },
  },
  {
    namn: "Plaça Major",
    text: "Det storslagna och livliga torget i hjärtat av de gamla kvarteren, omgivet av spansk arkitektur och mysiga uteserveringar.",
    lat: 39.5714,
    lng: 2.6509,
    bild: {
      src: "/stopp/placa-major.webp",
      alt: "Plaça Major med gula fasader och gröna fönsterluckor",
    },
  },
  {
    namn: "Plaça de Cort",
    text: "Hem till Palmas vackra rådhus och det urgamla olivträdet Olivera de Cort, som har vakat över torget i århundraden.",
    lat: 39.56961,
    lng: 2.65019,
    bild: { src: "/stopp/placa-de-cort.webp", alt: "Palmas rådhus vid Plaça de Cort i skymningen" },
  },
  {
    namn: "La Seu",
    text: "Stadens majestätiska gotiska mästerverk som reser sig över havet, världsberömt för sina rosettfönster och sitt ljusspel.",
    lat: 39.5675,
    lng: 2.649,
    bild: {
      src: "/stopp/la-seu.webp",
      alt: "Katedralen La Seu som speglar sig i vattnet nedanför",
    },
  },
  {
    namn: "Sa Llotja",
    text: "Ett arkitektoniskt mästerverk från 1400-talet, vars gotiska pelarsalar en gång var medelhavshandelns ekonomiska hjärta.",
    lat: 39.56837,
    lng: 2.64432,
    bild: { src: "/stopp/sa-llotja.webp", alt: "Sa Llotja med sina tinnar bakom palmer" },
  },
  {
    namn: "Färdig",
    text: "Efter cirka två timmar rundar vi av i Es Jonquet, fulla av nya intryck och berättelser om Palmas dolda skatter.",
    lat: 39.5682,
    lng: 2.6376,
    slut: true,
  },
];
