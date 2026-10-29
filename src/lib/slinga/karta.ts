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
const TROGHET = 0.14;

const BLA = "#1f62ff";

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
    { id: "bakgrund", type: "background", paint: { "background-color": "#efe5d3" } },
    {
      id: "gront",
      type: "fill",
      source: "omt",
      "source-layer": "park",
      paint: { "fill-color": "#dcdcc0" },
    },
    {
      id: "vegetation",
      type: "fill",
      source: "omt",
      "source-layer": "landcover",
      filter: ["in", ["get", "class"], ["literal", ["grass", "wood", "farmland"]]],
      paint: { "fill-color": "#dcdcc0", "fill-opacity": 0.8 },
    },
    {
      id: "vatten",
      type: "fill",
      source: "omt",
      "source-layer": "water",
      paint: { "fill-color": "#9cc6c8" },
    },
    {
      id: "hus",
      type: "fill",
      source: "omt",
      "source-layer": "building",
      paint: { "fill-color": "#e2d0b2", "fill-outline-color": "#d3bc98" },
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
  const intro = 0.035;
  const stopp = 0.06;
  const svans = 0.02;
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
    const n = tl.fonster.length;
    tl.fonster.forEach((f, i) => {
      const el = kort[i];
      if (!el) return;
      const sista = i === n - 1;
      const o =
        smoothstep(f.fran - 0.03, f.fran + 0.004, p) *
        (sista ? 1 : 1 - smoothstep(f.till - 0.004, f.till + 0.025, p));
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
      const ovan = q.y - h - 30 > 16;
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
      ctx!.fillStyle = klar ? BLA : "#fffaf1";
      ctx!.shadowColor = "rgba(29,26,22,0.25)";
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
    ctx!.fillStyle = `rgba(31,98,255,${(0.28 * (1 - puls)).toFixed(3)})`;
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

  // ---------- Ett scroll = nästa stopp ----------
  //
  // Inne i sektionen tar ett scrollhjulsdrag, ett svep eller en piltangent en till nästa
  // (eller föregående) stopp. Efter sista stoppet scrollar sidan vidare som vanligt.

  /** Scrollpositionen (sidans y) där steget ligger: -1 = början, 0..n-1 = stoppen. */
  function stegY(steg: number): number {
    const top = sektion.getBoundingClientRect().top + window.scrollY;
    const skrollbar = sektion.offsetHeight - window.innerHeight;
    if (steg < 0) return top;
    const f = tl.fonster[steg];
    if (!f) return top + skrollbar;
    return top + skrollbar * ((f.fran + f.till) / 2);
  }

  /** Det steg som scrollpositionen ligger närmast. */
  function aktuelltSteg(): number {
    let bast = -1;
    let bastD = Math.abs(window.scrollY - stegY(-1));
    for (let i = 0; i < tl.fonster.length; i++) {
      const d = Math.abs(window.scrollY - stegY(i));
      if (d < bastD) {
        bastD = d;
        bast = i;
      }
    }
    return bast;
  }

  /** Är sektionen den som fyller skärmen just nu? */
  function inneISektionen(): boolean {
    const rect = sektion.getBoundingClientRect();
    return rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
  }

  let animerar = false;
  let animRam = 0;
  function scrollaTill(y: number) {
    cancelAnimationFrame(animRam);
    const start = window.scrollY;
    const avst = y - start;
    if (Math.abs(avst) < 1) return;
    if (minskadRorelse.matches) {
      window.scrollTo(0, y);
      return;
    }
    const tid = clamp(650 + Math.abs(avst) * 0.25, 800, 1500);
    const t0 = performance.now();
    animerar = true;
    const steg = (t: number) => {
      const u = clamp((t - t0) / tid, 0, 1);
      const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
      window.scrollTo(0, start + avst * e);
      if (u < 1) animRam = requestAnimationFrame(steg);
      else animerar = false;
    };
    animRam = requestAnimationFrame(steg);
  }

  /** Går ett steg. Returnerar false om sidan ska scrolla vanligt (före start/efter slut). */
  function ga(riktning: 1 | -1): boolean {
    const nu = aktuelltSteg();
    const mal = nu + riktning;
    if (mal < -1 || mal > tl.fonster.length - 1) return false;
    scrollaTill(stegY(mal));
    return true;
  }

  // Ett hjulsdrag är alla wheel-händelser utan längre paus än 220 ms (styrplattans tröghet
  // räknas alltså som samma drag). Varje drag ger högst ett steg.
  let senasteHjul = 0;
  let dragHanterat = false;
  const onWheel = (e: WheelEvent) => {
    if (e.ctrlKey || !inneISektionen()) return;
    const tidNu = performance.now();
    const nyttDrag = tidNu - senasteHjul > 220;
    senasteHjul = tidNu;
    if (nyttDrag) dragHanterat = false;
    if (animerar || dragHanterat) {
      e.preventDefault();
      return;
    }
    if (Math.abs(e.deltaY) < 3) return;
    if (ga(e.deltaY > 0 ? 1 : -1)) {
      e.preventDefault();
      dragHanterat = true;
    }
  };

  let touchY: number | null = null;
  let touchBeslut: "steg" | "fritt" | null = null;
  const onTouchStart = (e: TouchEvent) => {
    touchY = e.touches[0]?.clientY ?? null;
    touchBeslut = null;
  };
  const onTouchMove = (e: TouchEvent) => {
    if (touchY === null || !inneISektionen()) return;
    const dy = touchY - (e.touches[0]?.clientY ?? touchY);
    if (touchBeslut === null && Math.abs(dy) > 6) {
      const nu = aktuelltSteg();
      const mal = nu + (dy > 0 ? 1 : -1);
      touchBeslut = mal < -1 || mal > tl.fonster.length - 1 ? "fritt" : "steg";
    }
    if (touchBeslut === "steg" || animerar) e.preventDefault();
  };
  const onTouchEnd = (e: TouchEvent) => {
    if (touchY === null) return;
    const dy = touchY - (e.changedTouches[0]?.clientY ?? touchY);
    if (touchBeslut === "steg" && !animerar && Math.abs(dy) > 24) ga(dy > 0 ? 1 : -1);
    touchY = null;
    touchBeslut = null;
  };

  const onKey = (e: KeyboardEvent) => {
    if (!inneISektionen() || e.altKey || e.metaKey || e.ctrlKey) return;
    const mal = e.target as HTMLElement | null;
    if (mal && /^(INPUT|TEXTAREA|SELECT)$/.test(mal.tagName)) return;
    const ner = ["ArrowDown", "PageDown", " "].includes(e.key) && !e.shiftKey;
    const upp = ["ArrowUp", "PageUp"].includes(e.key) || (e.key === " " && e.shiftKey);
    if (!ner && !upp) return;
    if (animerar || ga(ner ? 1 : -1)) e.preventDefault();
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("keydown", onKey);

  const onScroll = () => {
    lasScroll();
    kor();
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
    cancelAnimationFrame(animRam);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", storlek);
    window.removeEventListener("wheel", onWheel);
    window.removeEventListener("touchstart", onTouchStart);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("touchend", onTouchEnd);
    window.removeEventListener("keydown", onKey);
    karta?.remove();
  };
}
