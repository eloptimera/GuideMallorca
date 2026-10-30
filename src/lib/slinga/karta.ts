/*
 * Stadsvandringen på startsidan: en blå plupp som går Carolines rutt genom Palma när man
 * scrollar och drar en linje efter sig. Vid varje stopp stannar den och kortet med bild och
 * text visas.
 *
 * - Kartan är riktig (OpenStreetMap via OpenFreeMap) med egen, varm stil och laddas i
 *   besökarens webbläsare.
 * - Rutten räknas fram ur kartans egna gator (se graf.ts): den kortaste gångvägen mellan
 *   stoppen i STOPP, så linjen följer gator som finns.
 */
import type { Map as Karta, StyleSpecification } from "maplibre-gl";
import { byggGraf, kumulativ, punktVid, ruttGenom, rundaHorn, type Gata, type P } from "./graf";
import { STOPP } from "./stopp";

// ---------- Inställningar ----------

/** Marginal runt stoppen (meter) som ska synas och laddas. */
const MARGINAL = 170;
/** Ungefär hur många meter som ska synas när kartan följer pluppen (smala skärmar). */
const FOLJ_METER = 560;
/** Under den här bredden följer kartan pluppen och kortet ligger nederst. */
const SMAL = 760;
/** Tröghet i sekunder. */
const TROGHET = 0.1;

const BLA = "#0593c6";

/** Kostnad per gatuklass i OpenMapTiles. Saknas klassen går rutten inte där. */
const GATUVIKT: Record<string, number> = {
  path: 0.95,
  minor: 1,
  service: 1,
  track: 1.05,
  tertiary: 1.1,
  secondary: 1.15,
  primary: 1.2,
  trunk: 1.35,
};

// ---------- Kartstil ----------

export const KARTSTIL: StyleSpecification = {
  version: 8,
  sources: {
    omt: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  layers: [
    { id: "bakgrund", type: "background", paint: { "background-color": "#f3f8fa" } },
    {
      id: "gront",
      type: "fill",
      source: "omt",
      "source-layer": "park",
      paint: { "fill-color": "#dfeadf" },
    },
    {
      id: "vegetation",
      type: "fill",
      source: "omt",
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["grass", "wood", "farmland"]]],
      paint: { "fill-color": "#dfeadf", "fill-opacity": 0.8 },
    },
    {
      id: "vatten",
      type: "fill",
      source: "omt",
      "source-layer": "water",
      paint: { "fill-color": "#a6d6e8" },
    },
    {
      id: "hus",
      type: "fill",
      source: "omt",
      "source-layer": "building",
      paint: { "fill-color": "#e2ebf0", "fill-outline-color": "#cddae2" },
    },
    {
      id: "gator-stora",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: [
        "in",
        ["get", "class"],
        ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary"]],
      ],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#fbf6ec",
        "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 13, 2, 17, 14],
      },
    },
    {
      id: "gator-sma",
      type: "line",
      source: "omt",
      "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["minor", "service", "path", "track"]]],
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#fbf6ec",
        "line-width": ["interpolate", ["exponential", 1.6], ["zoom"], 13, 0.8, 17, 7],
      },
    },
  ],
};

// ---------- Koordinater ----------

const latMin = Math.min(...STOPP.map((s) => s.lat));
const latMax = Math.max(...STOPP.map((s) => s.lat));
const lngMin = Math.min(...STOPP.map((s) => s.lng));
const lngMax = Math.max(...STOPP.map((s) => s.lng));
const MITT = { lng: (lngMin + lngMax) / 2, lat: (latMin + latMax) / 2 };

const COS = Math.cos((MITT.lat * Math.PI) / 180);
const M_PER_GRAD_LAT = 110_574;
const M_PER_GRAD_LNG = 111_320 * COS;

const tillMeter = (lng: number, lat: number): P => ({
  x: (lng - MITT.lng) * M_PER_GRAD_LNG,
  y: -(lat - MITT.lat) * M_PER_GRAD_LAT,
});
const tillGrader = (p: P): [number, number] => [
  MITT.lng + p.x / M_PER_GRAD_LNG,
  MITT.lat - p.y / M_PER_GRAD_LAT,
];

/** Området runt alla stopp, i meter. */
const OMR = (() => {
  const a = tillMeter(lngMin, latMax);
  const b = tillMeter(lngMax, latMin);
  return { x0: a.x - MARGINAL, y0: a.y - MARGINAL, x1: b.x + MARGINAL, y1: b.y + MARGINAL };
})();

function omradeGrader(): [[number, number], [number, number]] {
  return [tillGrader({ x: OMR.x0, y: OMR.y1 }), tillGrader({ x: OMR.x1, y: OMR.y0 })];
}

/** Meter per pixel vid en viss zoom (512 px-rutor i MapLibre). */
const meterPerPixel = (zoom: number) => (40_075_016.686 * COS) / (512 * 2 ** zoom);

// ---------- Hjälp ----------

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/** Mjuk, monoton kurva genom nyckelpunkter (platta partier blir stopp). */
function kurva(punkter: readonly (readonly [number, number])[]) {
  const n = punkter.length;
  const xs = punkter.map((p) => p[0]);
  const ys = punkter.map((p) => p[1]);
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1]! - ys[i]!) / (xs[i + 1]! - xs[i]! || 1));
  const m = xs.map((_, i) => {
    if (i === 0) return d[0]!;
    if (i === n - 1) return d[n - 2]!;
    return d[i - 1]! * d[i]! <= 0 ? 0 : (2 * d[i - 1]! * d[i]!) / (d[i - 1]! + d[i]!);
  });
  return (x: number) => {
    if (x <= xs[0]!) return ys[0]!;
    if (x >= xs[n - 1]!) return ys[n - 1]!;
    let i = 0;
    while (x > xs[i + 1]!) i++;
    const h = xs[i + 1]! - xs[i]! || 1;
    const t = (x - xs[i]!) / h;
    const t2 = t * t;
    const t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * ys[i]! +
      (t3 - 2 * t2 + t) * h * m[i]! +
      (-2 * t3 + 3 * t2) * ys[i + 1]! +
      (t3 - t2) * h * m[i + 1]!
    );
  };
}

/**
 * Scroll (0..1) -> andel av rutten. Varje stopp får ett lika långt stopp i scrollen, och
 * sträckan mellan stoppen får scroll i proportion till hur lång den är.
 */
function tidslinje(andelar: readonly number[]) {
  const intro = 0.03;
  // Kort platå vid varje stopp: pluppen står still ett ögonblick, men scrollen gör alltid något.
  const stopp = 0.022;
  const svans = 0.015;
  const n = andelar.length;
  const rorelse = 1 - intro - svans - stopp * n;
  const kortast = rorelse * 0.06;
  const strackor = andelar.slice(1).map((a, i) => a - andelar[i]!);
  const summa = strackor.reduce((s, x) => s + Math.max(x, 0.0001), 0);
  // Varje sträcka får minst en liten del, resten fördelas efter längd.
  const andel = strackor.map(
    (x) => kortast + (rorelse - kortast * strackor.length) * (Math.max(x, 0.0001) / summa),
  );

  const nyckel: [number, number][] = [[0, andelar[0] ?? 0]];
  const fonster: { fran: number; till: number }[] = [];
  let t = intro;
  for (let i = 0; i < n; i++) {
    const a = andelar[i]!;
    nyckel.push([t, a]);
    fonster.push({ fran: t, till: t + stopp });
    t += stopp;
    nyckel.push([t, a]);
    if (i < n - 1) t += andel[i]!;
  }
  nyckel.push([1, andelar[n - 1] ?? 1]);
  return { f: kurva(nyckel), fonster, intro };
}

/** Gatorna i de laddade kartrutorna, i meter, med vikt efter gatuklass. */
function hamtaGator(karta: Karta): Gata[] {
  const gator: Gata[] = [];
  for (const f of karta.querySourceFeatures("omt", { sourceLayer: "transportation" })) {
    const vikt = GATUVIKT[String(f.properties?.["class"] ?? "")];
    if (vikt === undefined) continue;
    if (f.properties?.["brunnel"] === "tunnel") continue;
    const g = f.geometry;
    const linjer: number[][][] =
      g.type === "LineString"
        ? [g.coordinates]
        : g.type === "MultiLineString"
          ? g.coordinates
          : g.type === "Polygon"
            ? g.coordinates // gångytor (torg): gå längs kanten
            : g.type === "MultiPolygon"
              ? g.coordinates.flat()
              : [];
    for (const linje of linjer) {
      gator.push({ punkter: linje.map((c) => tillMeter(c[0] ?? 0, c[1] ?? 0)), vikt });
    }
  }
  return gator;
}

/** Testgator (bara i utvecklingsläge, ?testgator): ett snett rutnät över området. */
function testGator(): Gata[] {
  const gator: Gata[] = [];
  const v = 0.3;
  const rot = (x: number, y: number): P => ({
    x: x * Math.cos(v) - y * Math.sin(v),
    y: x * Math.sin(v) + y * Math.cos(v),
  });
  for (let i = -18; i <= 18; i++) {
    const k = i * 58 + (i % 3) * 8;
    gator.push({ punkter: [rot(-1200, k), rot(-300, k + 12), rot(1200, k - 9)], vikt: 1 });
    gator.push({ punkter: [rot(k, -1200), rot(k - 10, 0), rot(k + 7, 1200)], vikt: 1 });
  }
  return gator;
}

/** Väntar tills kartan har laddat allt som syns (eller max 8 s). */
const vantaPaKartan = (karta: Karta) =>
  new Promise<void>((resolve) => {
    const klar = () => {
      clearTimeout(t);
      resolve();
    };
    const t = setTimeout(() => {
      karta.off("idle", klar);
      resolve();
    }, 8000);
    karta.once("idle", klar);
    karta.triggerRepaint();
  });

// ---------- Start ----------

/**
 * Startar vandringen i `sektion` (den höga scrollsektionen). Returnerar en funktion som
 * stoppar den och städar upp.
 */
export function startaSlinga(sektion: HTMLElement): () => void {
  const scen = sektion.querySelector<HTMLElement>(".slinga__scen");
  const kartEl = sektion.querySelector<HTMLElement>(".slinga__karta");
  const canvas = sektion.querySelector<HTMLCanvasElement>(".slinga__spar");
  const kort = Array.from(sektion.querySelectorAll<HTMLElement>(".slinga__kort"));
  const ctx = canvas?.getContext("2d");
  if (!scen || !kartEl || !canvas || !ctx) return () => {};

  const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)");
  const test = import.meta.env.DEV && new URLSearchParams(location.search).has("testgator");

  let karta: Karta | null = null;
  let vag: P[] = []; // meter
  let kum: number[] = [];
  let stoppPos: P[] = []; // där pluppen stannar vid varje stopp (meter)
  let tl = tidslinje(STOPP.map((_, i) => i / (STOPP.length - 1)));
  let vw = 1;
  let vh = 1;
  let dpr = 1;
  let smal = false;
  let grundZoom = 15;
  let foljZoom = 15;
  let mal = 0;
  let nu = 0;
  let senast = 0;
  let synlig = true;
  let stoppad = false;
  let ram = 0;

  function lasScroll() {
    const rect = sektion.getBoundingClientRect();
    const skrollbar = sektion.offsetHeight - window.innerHeight;
    mal = skrollbar > 0 ? clamp(-rect.top / skrollbar, 0, 1) : 0;
  }

  /** Högerkanten på den vänsterställda rubriken (breda skärmar), i pixlar. */
  const heroKant = () => Math.min(360, vw * 0.3) + Math.min(64, Math.max(24, vw * 0.045)) + 24;

  function kamera() {
    if (!karta) return;
    karta.fitBounds(omradeGrader(), {
      padding: smal
        ? 0
        : { top: Math.min(120, vh * 0.13), bottom: 50, left: heroKant() + 40, right: 70 },
      duration: 0,
    });
    grundZoom = karta.getZoom();
    foljZoom = Math.log2((40_075_016.686 * COS) / (512 * (FOLJ_METER / Math.min(vw, vh))));
  }

  function storlek() {
    const rect = scen!.getBoundingClientRect();
    vw = Math.max(1, Math.round(rect.width));
    vh = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    smal = vw < SMAL;
    sektion.toggleAttribute("data-smal", smal);
    canvas!.width = Math.round(vw * dpr);
    canvas!.height = Math.round(vh * dpr);
    if (karta) {
      karta.resize();
      kamera();
    }
    rita(performance.now());
  }

  function byggRutt(gator: Gata[]) {
    const graf = byggGraf(gator);
    const stopp = STOPP.map((s) => tillMeter(s.lng, s.lat));
    const r = ruttGenom(graf, stopp);
    if (r.punkter.length < 2) return;
    // Rundade hörn för en mjukare rörelse.
    vag = rundaHorn(r.punkter);
    kum = kumulativ(vag);
    const total = kum[kum.length - 1] || 1;
    // Var längs den rundade linjen varje stopp hamnar: närmaste punkt, sökt framåt i ordning.
    let fran = 0;
    const andelar = r.stoppIndex.map((idx) => {
      const mal = r.punkter[idx]!;
      let bast = fran;
      let bastD = Infinity;
      for (let j = fran; j < vag.length; j++) {
        const d = Math.hypot(vag[j]!.x - mal.x, vag[j]!.y - mal.y);
        if (d < bastD) {
          bastD = d;
          bast = j;
        }
        if (d > bastD + 400) break; // har passerat stoppet
      }
      fran = bast;
      return (kum[bast] ?? 0) / total;
    });
    stoppPos = andelar.map((a) => punktVid(vag, kum, a * total).p);
    tl = tidslinje(andelar);
    sektion.dataset["klar"] = "";
  }

  /** Laddar kartrutor över hela området (flera vyer på små skärmar) och samlar gatorna. */
  async function samlaGator(k: Karta): Promise<Gata[]> {
    k.fitBounds(omradeGrader(), { padding: 0, duration: 0 });
    await vantaPaKartan(k);
    // Fullt detaljerade gator finns i nivå 14. Täcker en vy hela området där räcker den.
    if (k.getZoom() >= 14.05) return hamtaGator(k);
    const zoom = 14.2;
    const bredd = vw * meterPerPixel(zoom) * 0.9;
    const hojd = vh * meterPerPixel(zoom) * 0.9;
    const nx = Math.max(1, Math.ceil((OMR.x1 - OMR.x0) / bredd));
    const ny = Math.max(1, Math.ceil((OMR.y1 - OMR.y0) / hojd));
    const gator: Gata[] = [];
    for (let ix = 0; ix < nx; ix++) {
      for (let iy = 0; iy < ny; iy++) {
        if (stoppad) return gator;
        const c = {
          x: OMR.x0 + ((ix + 0.5) * (OMR.x1 - OMR.x0)) / nx,
          y: OMR.y0 + ((iy + 0.5) * (OMR.y1 - OMR.y0)) / ny,
        };
        k.jumpTo({ center: tillGrader(c), zoom });
        await vantaPaKartan(k);
        gator.push(...hamtaGator(k));
      }
    }
    return gator;
  }

  function projicera(p: P): P {
    if (karta) {
      const q = karta.project(tillGrader(p));
      return { x: q.x, y: q.y };
    }
    // Utan karta (testläge): enkel projektion av området.
    const s = Math.min(vw / (OMR.x1 - OMR.x0), vh / (OMR.y1 - OMR.y0)) * 0.9;
    return { x: vw / 2 + p.x * s, y: vh / 2 + p.y * s };
  }

  function rita(tid: number) {
    const p = nu;
    const total = kum[kum.length - 1] ?? 0;
    const s = tl.f(p) * total;
    const plupp = total > 0 ? punktVid(vag, kum, s) : null;

    // Rubriken flyttar till vänster så fort man har börjat scrolla.
    sektion.toggleAttribute("data-flyttad", mal > 0.004 || p > 0.004);
    sektion.style.setProperty("--cue-o", (1 - smoothstep(0, tl.intro * 0.6, p)).toFixed(3));

    // Kameran: stilla och hela rutten på breda skärmar, följer pluppen på smala.
    if (karta && plupp && smal) {
      const z = grundZoom + (foljZoom - grundZoom) * smoothstep(0.005, tl.intro + 0.02, p);
      const c = tillGrader({ x: plupp.p.x, y: plupp.p.y + vh * 0.12 * meterPerPixel(z) });
      karta.jumpTo({ center: c, zoom: z });
    }

    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height);

    // Korten: tonar in när pluppen kommer fram och ut när den går vidare.
    tl.fonster.forEach((f, i) => {
      const el = kort[i];
      if (!el) return;
      // Övertoning: ett kort tonar ut medan nästa tonar in, så att det alltid syns ett kort
      // på vägen mellan två stopp. Mitt emellan överlappar de en aning.
      const fore = tl.fonster[i - 1];
      const efter = tl.fonster[i + 1];
      const inFran = fore ? fore.till + (f.fran - fore.till) * 0.2 : 0;
      const ut = efter ? f.till + (efter.fran - f.till) * 0.8 : Infinity;
      const o =
        (fore ? smoothstep(inFran, f.fran, p) : smoothstep(tl.intro * 0.3, f.fran, p)) *
        (efter ? 1 - smoothstep(f.till, ut, p) : 1);
      el.style.opacity = o.toFixed(3);
      el.style.visibility = o > 0.002 ? "visible" : "hidden";
      el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      if (smal || !stoppPos[i]) {
        el.style.transform = `translateY(${((1 - o) * 16).toFixed(1)}px)`;
        return;
      }
      // Bred skärm: kortet sitter vid platsen på kartan, ovanför (eller under) stoppet.
      const q = projicera(stoppPos[i]!);
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const ovan = q.y - h - 30 > 64; // lämna plats för språkvalet uppe till höger
      const x = clamp(q.x - w / 2, Math.min(heroKant(), vw - w - 16), vw - w - 16);
      const y = ovan ? q.y - h - 30 : Math.min(q.y + 30, vh - h - 16);
      el.style.transform = `translate(${x.toFixed(1)}px, ${(y + (1 - o) * 12).toFixed(1)}px)`;
      el.dataset["ovan"] = ovan ? "ja" : "nej";
      el.style.setProperty("--pil", `${clamp(q.x - x, 24, w - 24).toFixed(1)}px`);
    });

    if (!plupp) return;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";

    // Linjen bakom pluppen.
    if (s > 0.5) {
      ctx!.beginPath();
      for (let k = 0; k <= plupp.i; k++) {
        const q = projicera(vag[k]!);
        if (k === 0) ctx!.moveTo(q.x, q.y);
        else ctx!.lineTo(q.x, q.y);
      }
      const q = projicera(plupp.p);
      ctx!.lineTo(q.x, q.y);
      ctx!.strokeStyle = "rgba(255,255,255,0.92)";
      ctx!.lineWidth = 8;
      ctx!.stroke();
      ctx!.strokeStyle = BLA;
      ctx!.lineWidth = 4;
      ctx!.stroke();
    }

    // Stoppen: numrerade markörer, ifyllda när pluppen har varit där.
    const avklarad = tl.fonster.map((f) => p >= f.fran - 0.004);
    stoppPos.forEach((sp, i) => {
      const q = projicera(sp);
      const klar = avklarad[i];
      ctx!.beginPath();
      ctx!.arc(q.x, q.y, 11, 0, Math.PI * 2);
      ctx!.fillStyle = klar ? BLA : "#ffffff";
      ctx!.shadowColor = "rgba(18,28,43,0.25)";
      ctx!.shadowBlur = 6;
      ctx!.fill();
      ctx!.shadowBlur = 0;
      ctx!.lineWidth = 2;
      ctx!.strokeStyle = klar ? "#fff" : BLA;
      ctx!.stroke();
      ctx!.fillStyle = klar ? "#fff" : BLA;
      ctx!.font = "600 11px 'DM Sans Variable', system-ui, sans-serif";
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(i === stoppPos.length - 1 ? "✓" : String(i + 1), q.x, q.y + 0.5);
    });

    // Pluppen, med en pulserande ring som en positionsmarkör.
    const q = projicera(plupp.p);
    const puls = minskadRorelse.matches ? 0.5 : (tid / 1600) % 1;
    ctx!.beginPath();
    ctx!.arc(q.x, q.y, 10 + puls * 22, 0, Math.PI * 2);
    ctx!.fillStyle = `rgba(5,147,198,${(0.28 * (1 - puls)).toFixed(3)})`;
    ctx!.fill();
    ctx!.beginPath();
    ctx!.arc(q.x, q.y, 10, 0, Math.PI * 2);
    ctx!.fillStyle = "#fff";
    ctx!.shadowColor = "rgba(0,0,0,0.25)";
    ctx!.shadowBlur = 8;
    ctx!.fill();
    ctx!.shadowBlur = 0;
    ctx!.beginPath();
    ctx!.arc(q.x, q.y, 7, 0, Math.PI * 2);
    ctx!.fillStyle = BLA;
    ctx!.fill();
  }

  function kor() {
    if (!ram && !stoppad) ram = requestAnimationFrame(tick);
  }

  function tick(tid: number) {
    ram = 0;
    if (stoppad) return;
    const dt = senast ? Math.min((tid - senast) / 1000, 0.1) : 1 / 60;
    senast = tid;
    nu = minskadRorelse.matches ? mal : nu + (mal - nu) * (1 - Math.exp(-dt / TROGHET));
    if (Math.abs(mal - nu) < 1e-5) nu = mal;
    rita(tid);
    // Fortsätt rita medan sektionen syns (pulsen), annars bara tills trögheten har lagt sig.
    if (synlig || nu !== mal) ram = requestAnimationFrame(tick);
    else senast = 0;
  }

  const observer = new IntersectionObserver(([post]) => {
    synlig = post?.isIntersecting ?? false;
    kor();
  });
  observer.observe(sektion);

  // ---------- Magnet vid stoppen ----------
  //
  // Scrollen är helt fri. När man slutar scrolla och är nära stoppet man är på väg mot, glider
  // sidan in och lägger sig där. Magneten drar aldrig tillbaka mot stoppet man just lämnade
  // (bara ett litet överskott korrigeras), så nästa scroll tar en alltid vidare.

  /** Sidans y-position för varje stopp. */
  function stoppY(): number[] {
    const top = sektion.getBoundingClientRect().top + window.scrollY;
    const skrollbar = sektion.offsetHeight - window.innerHeight;
    return tl.fonster.map((f) => top + skrollbar * ((f.fran + f.till) / 2));
  }

  let riktning = 0;
  let forraY = window.scrollY;
  let viloTimer = 0;
  let animRam = 0;
  let egenScroll = false;
  let fingret = false;

  function avbrytGlid() {
    cancelAnimationFrame(animRam);
    egenScroll = false;
  }

  function glidTill(y: number) {
    avbrytGlid();
    const start = window.scrollY;
    const avst = y - start;
    if (Math.abs(avst) < 2) return;
    if (minskadRorelse.matches) {
      window.scrollTo(0, y);
      return;
    }
    const tid = clamp(260 + Math.abs(avst) * 0.6, 280, 520);
    const t0 = performance.now();
    egenScroll = true;
    const steg = (t: number) => {
      const u = clamp((t - t0) / tid, 0, 1);
      const e = 1 - Math.pow(1 - u, 3);
      window.scrollTo(0, start + avst * e);
      if (u < 1 && egenScroll) animRam = requestAnimationFrame(steg);
      else egenScroll = false;
    };
    animRam = requestAnimationFrame(steg);
  }

  function magnet() {
    if (fingret || egenScroll || !kum.length) return;
    const y = window.scrollY;
    const ys = stoppY();
    const glapp = ys.length > 1 ? (ys[ys.length - 1]! - ys[0]!) / (ys.length - 1) : 0;
    const fangst = Math.max(60, glapp * 0.4); // så nära stoppet framåt som magneten drar
    const overskott = Math.max(30, glapp * 0.25); // så långt förbi ett stopp som korrigeras
    let mal: number | null = null;
    for (const sy of ys) {
      const d = sy - y; // > 0: stoppet ligger längre ner
      const framat = riktning >= 0 ? d : -d;
      if (framat >= 0 && framat <= fangst) {
        mal = sy;
        break;
      }
      if (framat < 0 && -framat <= overskott) mal = sy;
    }
    if (riktning < 0) {
      // Uppåt: närmsta stopp ovanför inom fångstavståndet.
      mal = null;
      for (let i = ys.length - 1; i >= 0; i--) {
        const d = y - ys[i]!;
        if (d >= 0 && d <= fangst) {
          mal = ys[i]!;
          break;
        }
        if (d < 0 && -d <= overskott) mal = ys[i]!;
      }
    }
    if (mal !== null) glidTill(mal);
  }

  // ---------- Mobil: kort stopp vid varje plats ----------
  //
  // På pekskärmar kan ett svep annars flyga förbi hela rutten. När scrollen passerar ett
  // stopp hålls sidan kvar där ett ögonblick (HALL_MS, 0,1 s) och farten nollas. Nästa svep tar en
  // vidare som vanligt.
  const HALL_MS = 100;
  const pekskarm = window.matchMedia("(pointer: coarse)");
  let haller = false;
  let hallTimer = 0;
  const rot = document.documentElement;

  function hallKvar(y: number) {
    haller = true;
    avbrytGlid();
    clearTimeout(viloTimer);
    // overflow: hidden stoppar den inbyggda svepfarten i både Safari och Chrome.
    rot.style.overflow = "hidden";
    window.scrollTo(0, y);
    forraY = y;
    clearTimeout(hallTimer);
    hallTimer = window.setTimeout(() => {
      rot.style.overflow = "";
      haller = false;
    }, HALL_MS);
  }

  /** Har scrollen just passerat (eller nått) ett stopp i färdriktningen? */
  function passeratStopp(fran: number, till: number): number | null {
    if (Math.abs(till - fran) < 0.5) return null;
    for (const sy of stoppY()) {
      if (till > fran && fran < sy - 0.5 && till >= sy - 0.5) return sy;
      if (till < fran && fran > sy + 0.5 && till <= sy + 0.5) return sy;
    }
    return null;
  }

  // ---------- Navigering via länkar ----------
  //
  // När man klickar på en länk till en annan del av sidan (menyn, knappar) scrollar sidan
  // förbi rutten. Då ska varken magneten eller mobilens stopp fånga scrollen. Spärren släpper
  // när scrollen har stått still en stund.
  let navigerar = false;
  let navTimer = 0;
  function borjaNavigera() {
    navigerar = true;
    avbrytGlid();
    clearTimeout(viloTimer);
    clearTimeout(hallTimer);
    rot.style.overflow = "";
    haller = false;
    clearTimeout(navTimer);
    navTimer = window.setTimeout(() => (navigerar = false), 1200);
  }
  const onKlick = (e: MouseEvent) => {
    const lank = (e.target as Element | null)?.closest?.("a[href]");
    const href = lank?.getAttribute("href") ?? "";
    if (href.startsWith("#")) borjaNavigera();
  };
  document.addEventListener("click", onKlick, true);
  window.addEventListener("hashchange", borjaNavigera);

  const avbryt = () => avbrytGlid();
  const onTouchStart = () => {
    fingret = true;
    avbrytGlid();
  };
  const onTouchEnd = () => {
    fingret = false;
  };
  window.addEventListener("wheel", avbryt, { passive: true });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("keydown", avbryt);

  const onScroll = () => {
    lasScroll();
    kor();
    const y = window.scrollY;
    if (navigerar) {
      // Följ med utan att fånga; släpp spärren när scrollen har stannat.
      forraY = y;
      clearTimeout(navTimer);
      navTimer = window.setTimeout(() => (navigerar = false), 250);
      return;
    }
    if (haller) return;
    if (pekskarm.matches && !egenScroll && kum.length) {
      const sy = passeratStopp(forraY, y);
      if (sy !== null) {
        hallKvar(sy);
        return;
      }
    }
    if (!egenScroll && Math.abs(y - forraY) > 0.5) riktning = y > forraY ? 1 : -1;
    forraY = y;
    // Magneten verkar bara inne i rutten, när scrollen har stannat.
    clearTimeout(viloTimer);
    if (!egenScroll) {
      const rect = sektion.getBoundingClientRect();
      if (rect.top <= 1 && rect.bottom >= window.innerHeight - 1) {
        viloTimer = window.setTimeout(magnet, 140);
      }
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", storlek);

  storlek();
  lasScroll();
  nu = mal;
  kor();

  if (test) {
    byggRutt(testGator());
  } else {
    void import("maplibre-gl")
      .then(async ({ Map }) => {
        if (stoppad) return;
        karta = new Map({
          container: kartEl,
          style: KARTSTIL,
          bounds: omradeGrader(),
          interactive: false,
          attributionControl: { compact: true },
          fadeDuration: 0,
          pixelRatio: dpr,
        });
        const gator = await samlaGator(karta);
        if (stoppad || !karta) return;
        byggRutt(gator);
        kamera();
        sektion.dataset["karta"] = "";
        rita(performance.now());
      })
      .catch(() => {
        // Kartan kunde inte laddas – rubrik och kort fungerar ändå.
      });
  }

  return () => {
    stoppad = true;
    cancelAnimationFrame(ram);
    observer.disconnect();
    avbrytGlid();
    clearTimeout(viloTimer);
    clearTimeout(hallTimer);
    rot.style.overflow = "";
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", storlek);
    window.removeEventListener("wheel", avbryt);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("keydown", avbryt);
    document.removeEventListener("click", onKlick, true);
    window.removeEventListener("hashchange", borjaNavigera);
    clearTimeout(navTimer);
    karta?.remove();
  };
}
