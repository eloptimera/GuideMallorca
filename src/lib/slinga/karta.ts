/*
 * Stadsslingan på startsidan: en blå plupp som springer runt i Palmas gamla stad när man
 * scrollar och lämnar en linje efter sig.
 *
 * - Kartan är riktig (OpenStreetMap via OpenFreeMap) med egen, varm stil och laddas i
 *   besökarens webbläsare.
 * - Slingan räknas fram ur kartans egna gator (se graf.ts), så linjen följer gator som finns.
 *   Den är dekor – en promenad genom gränderna, inte en exakt guidningsrutt.
 * - Pluppen stannar vid kapitlen i KAPITEL, och kapitlets text tonar fram.
 */
import type { Map as Karta, StyleSpecification } from "maplibre-gl";
import { byggGraf, gaSlinga, kumulativ, punktVid, rundaHorn, type Gata, type P } from "./graf";

// ---------- Inställningar ----------

/** Mitten av slingan: gamla stan i Palma. */
const MITT = { lng: 2.6503, lat: 39.5703 };
/** Hur långt från mitten (meter) slingan håller sig. */
const RADIE = 520;
/** Slingans längd i meter. */
const LANGD = 3600;
/** Ungefär hur många meter som ska synas när kartan följer pluppen (smala skärmar). */
const FOLJ_METER = 620;
/** Tröghet i sekunder. */
const TROGHET = 0.14;

const BLA = "#1f62ff";

/** Gatuklasser i OpenMapTiles som är för stora för en promenad i gränderna. */
const STORA_GATOR = new Set([
  "motorway",
  "trunk",
  "primary",
  "rail",
  "transit",
  "ferry",
  "aerialway",
  "busway",
  "raceway",
]);
const SMA_GATOR = new Set(["minor", "path", "service", "track"]);

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

/** Kartområdet som ska vara laddat: slingans cirkel plus lite marginal. */
function omrade(): [[number, number], [number, number]] {
  const r = RADIE * 1.12;
  return [tillGrader({ x: -r, y: r }), tillGrader({ x: r, y: -r })];
}

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
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1]! - ys[i]!) / (xs[i + 1]! - xs[i]!));
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
    const h = xs[i + 1]! - xs[i]!;
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

/** Scroll -> hur stor del av slingan som är gången, med stopp vid varje kapitel. */
function tidslinje(antalKapitel: number) {
  const borjan = 0.05;
  const slut = 0.93;
  const stopp = 0.05;
  const kapitel = Array.from({ length: antalKapitel }, (_, i) => {
    const mitt = borjan + ((i + 1) * (slut - borjan)) / (antalKapitel + 1);
    return { fran: mitt - stopp / 2, till: mitt + stopp / 2, andel: (i + 1) / (antalKapitel + 1) };
  });
  const f = kurva([
    [0, 0],
    [borjan, 0],
    ...kapitel.flatMap((k) => [[k.fran, k.andel] as const, [k.till, k.andel] as const]),
    [slut, 1],
    [1, 1],
  ]);
  return { f, kapitel, slut };
}

/** Gatorna i de laddade kartrutorna, i meter. */
function hamtaGator(karta: Karta): Gata[] {
  const gator: Gata[] = [];
  for (const f of karta.querySourceFeatures("omt", { sourceLayer: "transportation" })) {
    const klass = String(f.properties?.["class"] ?? "");
    if (STORA_GATOR.has(klass)) continue;
    if (f.properties?.["brunnel"] === "tunnel") continue;
    const liten = SMA_GATOR.has(klass);
    const g = f.geometry;
    const linjer: number[][][] =
      g.type === "LineString" ? [g.coordinates] : g.type === "MultiLineString" ? g.coordinates : [];
    for (const linje of linjer) {
      gator.push({ punkter: linje.map((c) => tillMeter(c[0] ?? 0, c[1] ?? 0)), liten });
    }
  }
  return gator;
}

/** Testgator (bara i utvecklingsläge, ?testgator): ett snett rutnät runt mitten. */
function testGator(): Gata[] {
  const gator: Gata[] = [];
  const v = 0.35;
  const rot = (x: number, y: number): P => ({
    x: x * Math.cos(v) - y * Math.sin(v),
    y: x * Math.sin(v) + y * Math.cos(v),
  });
  for (let i = -9; i <= 9; i++) {
    const k = i * 62 + (i % 3) * 9;
    gator.push({
      punkter: [rot(-620, k), rot(-200, k + 14), rot(620, k - 10)],
      liten: i % 4 !== 0,
    });
    gator.push({ punkter: [rot(k, -620), rot(k - 12, 0), rot(k + 8, 620)], liten: i % 4 !== 0 });
  }
  return gator;
}

// ---------- Start ----------

type Element = {
  stage: HTMLElement;
  karta: HTMLElement;
  canvas: HTMLCanvasElement;
  kapitel: HTMLElement[];
};

/**
 * Startar slingan i `sektion` (den höga scrollsektionen). Returnerar en funktion som stoppar
 * den och städar upp.
 */
export function startaSlinga(sektion: HTMLElement): () => void {
  const el: Element | null = (() => {
    const stage = sektion.querySelector<HTMLElement>(".slinga__scen");
    const karta = sektion.querySelector<HTMLElement>(".slinga__karta");
    const canvas = sektion.querySelector<HTMLCanvasElement>(".slinga__spar");
    if (!stage || !karta || !canvas) return null;
    const kapitel = Array.from(sektion.querySelectorAll<HTMLElement>(".slinga__kapitel"));
    return { stage, karta, canvas, kapitel };
  })();
  const ctx = el?.canvas.getContext("2d");
  if (!el || !ctx) return () => {};

  const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)");
  const test = import.meta.env.DEV && new URLSearchParams(location.search).has("testgator");
  const tl = tidslinje(el.kapitel.length);

  let karta: Karta | null = null;
  let vag: [number, number][] = []; // lng/lat
  let vagMeter: P[] = [];
  let kum: number[] = [];
  let vw = 1;
  let vh = 1;
  let dpr = 1;
  let grundZoom = 15;
  let foljZoom = 15;
  let folj = 0; // 0 = stilla karta, 1 = följer pluppen helt
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

  function storlek() {
    const rect = el!.stage.getBoundingClientRect();
    vw = Math.max(1, Math.round(rect.width));
    vh = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    el!.canvas.width = Math.round(vw * dpr);
    el!.canvas.height = Math.round(vh * dpr);
    if (karta) {
      karta.resize();
      karta.fitBounds(omrade(), { padding: 0, duration: 0 });
      grundZoom = karta.getZoom();
      // Zoom där FOLJ_METER ryms över skärmens kortaste sida (512 px-rutor i MapLibre).
      const mpp = FOLJ_METER / Math.min(vw, vh);
      foljZoom = Math.log2((40_075_016.686 * COS) / (512 * mpp));
      folj = foljZoom > grundZoom + 0.3 ? 1 : 0.18;
      if (folj < 1) foljZoom = grundZoom;
    }
  }

  function byggSlinga() {
    if (!karta && !test) return;
    const gator = test ? testGator() : hamtaGator(karta!);
    const graf = byggGraf(gator);
    const punkter = rundaHorn(gaSlinga(graf, { mitt: { x: 0, y: 0 }, radie: RADIE, langd: LANGD }));
    if (punkter.length < 2) return;
    vagMeter = punkter;
    vag = punkter.map(tillGrader);
    kum = kumulativ(punkter);
    sektion.dataset["klar"] = "";
  }

  function projicera(lngLat: [number, number]): P {
    if (karta) {
      const p = karta.project(lngLat);
      return { x: p.x, y: p.y };
    }
    // Utan karta (testläge utan nät): enkel projektion runt mitten.
    const m = tillMeter(lngLat[0], lngLat[1]);
    const skala = Math.min(vw, vh) / (RADIE * 2.3);
    return { x: vw / 2 + m.x * skala, y: vh / 2 + m.y * skala };
  }

  function rita(tid: number) {
    const p = nu;
    const total = kum[kum.length - 1] ?? 0;
    const s = tl.f(p) * total;

    // Kapitel och rubrik.
    sektion.style.setProperty("--hero-o", (1 - smoothstep(0, 0.045, p)).toFixed(3));
    sektion.style.setProperty("--slut-o", smoothstep(tl.slut - 0.02, tl.slut + 0.04, p).toFixed(3));
    tl.kapitel.forEach((k, i) => {
      const o = smoothstep(k.fran - 0.035, k.fran, p) * (1 - smoothstep(k.till, k.till + 0.035, p));
      const e = el!.kapitel[i];
      if (!e) return;
      e.style.opacity = o.toFixed(3);
      e.style.transform = `translateY(${((1 - o) * 14).toFixed(1)}px)`;
      e.style.visibility = o > 0.001 ? "visible" : "hidden";
    });

    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.clearRect(0, 0, el!.canvas.width, el!.canvas.height);
    if (vag.length < 2) return;

    const { p: pm, i } = punktVid(vagMeter, kum, s);
    const plupp = tillGrader(pm);

    // Kameran följer pluppen (helt på smala skärmar, lite på breda).
    if (karta) {
      const mitt: [number, number] = [
        MITT.lng + (plupp[0] - MITT.lng) * folj,
        MITT.lat + (plupp[1] - MITT.lat) * folj,
      ];
      const introZoom =
        folj >= 1 ? grundZoom + (foljZoom - grundZoom) * smoothstep(0.01, 0.07, p) : grundZoom;
      karta.jumpTo({ center: mitt, zoom: introZoom });
    }

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.lineCap = "round";
    ctx!.lineJoin = "round";

    // Linjen bakom pluppen.
    if (s > 0.5) {
      ctx!.beginPath();
      for (let k = 0; k <= i; k++) {
        const q = projicera(vag[k]!);
        if (k === 0) ctx!.moveTo(q.x, q.y);
        else ctx!.lineTo(q.x, q.y);
      }
      const q = projicera(plupp);
      ctx!.lineTo(q.x, q.y);
      ctx!.strokeStyle = "rgba(255,255,255,0.9)";
      ctx!.lineWidth = 8;
      ctx!.stroke();
      ctx!.strokeStyle = BLA;
      ctx!.lineWidth = 4;
      ctx!.stroke();
    }

    // Startpunkt.
    const start = projicera(vag[0]!);
    ctx!.beginPath();
    ctx!.arc(start.x, start.y, 5, 0, Math.PI * 2);
    ctx!.fillStyle = "#fff";
    ctx!.fill();
    ctx!.lineWidth = 2.5;
    ctx!.strokeStyle = BLA;
    ctx!.stroke();

    // Pluppen, med en pulserande ring som en positionsmarkör.
    const q = projicera(plupp);
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
    byggSlinga();
  } else {
    void import("maplibre-gl")
      .then(({ Map }) => {
        if (stoppad) return;
        karta = new Map({
          container: el.karta,
          style: KARTSTIL,
          bounds: omrade(),
          interactive: false,
          attributionControl: { compact: true },
          fadeDuration: 0,
          pixelRatio: dpr,
        });
        karta.once("idle", () => {
          if (stoppad || !karta) return;
          storlek();
          byggSlinga();
          sektion.dataset["karta"] = "";
        });
      })
      .catch(() => {
        // Kartan kunde inte laddas – rubrik och kapitel fungerar ändå.
      });
  }

  // För felsökning: window.__slinga.set(0.5) visar en given punkt i flygningen.
  (window as unknown as { __slinga?: object }).__slinga = {
    set(v: number) {
      mal = nu = clamp(v, 0, 1);
      rita(performance.now());
    },
  };

  return () => {
    stoppad = true;
    cancelAnimationFrame(ram);
    observer.disconnect();
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", storlek);
    karta?.remove();
  };
}
