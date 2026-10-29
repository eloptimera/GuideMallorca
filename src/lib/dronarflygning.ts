/*
 * Drönarflygning över Palma.
 *
 * Scrollen styr en kamera som flyger från översiktsbilden (bild 2) in mot katedralens
 * huvudentré. På vägen tonar närbilden (bild 1) in, och till sist dyker kameran in i dörren
 * och sidan blir svart.
 *
 * Koordinatsystem: "världen" är pixlarna i översiktsbilden (4096 × 3124). Närbilden placeras
 * i världen så att entrén hamnar på samma ställe.
 *
 * Hur det hålls mjukt:
 *  - Zoomen är logaritmisk (konstant upplevd fart, som en verklig framflygning).
 *  - Scrollpositionen dämpas med tröghet, så varje hjulsteg blir ett glid.
 *  - Bilderna har olika perspektiv (AI-genererade). Under övertoningen förvrids båda bilderna
 *    gemensamt så att fasaderna sammanfaller, och en kort ljusdis döljer resten.
 */

export const OVERSIKT = { src: "/flight/palma-oversikt.webp", w: 4096, h: 3124 } as const;
export const NARBILD = { src: "/flight/palma-katedral.webp", w: 1672, h: 941 } as const;

type Punkt = { x: number; y: number };

// Entréportalen i respektive bild (uppmätt).
const PORTAL_OVERSIKT: Punkt = { x: 2211, y: 1707 };
const PORTAL_NARBILD: Punkt = { x: 917, y: 452 };

// Närbildens skala i världen när fasaderna matchas. Fasaden är relativt smalare i
// översiktsbilden, därför olika skala på bredd och höjd.
const MATCH: Punkt = { x: 0.66, y: 0.86 };
// Proportionell skala som närbilden landar i efter övertoningen.
const PROPORTIONELL = Math.sqrt(MATCH.x * MATCH.y);

// Punkten kameran dyker in i: vänstra dörröppningen i huvudentrén (närbild).
const DORR_NARBILD: Punkt = { x: 920, y: 474 };

// Mjuk kant på närbilden så att den inte har synliga kanter under toningen.
const MJUK_KANT = 0.06;
// Hur få närbildspixlar som ska synas när allt är svart.
const SLUT_PIXLAR = 10;
// Tröghet i sekunder (tidskonstant). Högre = mer "flytande".
const TROGHET = 0.16;
// Lätt krängning under inflygningen, i grader.
const KRANGNING_GRADER = 0.7;

// ---------- Hjälpfunktioner ----------

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smoothstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const smootherstep = (a: number, b: number, v: number) => {
  const t = clamp((v - a) / (b - a), 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
};
const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

// Monoton kubisk interpolation (Fritsch–Carlson): mjuk kurva utan överslag, så att flygningen
// aldrig backar eller rycker mellan nyckelpunkterna.
function monotonKurva(punkter: readonly (readonly [number, number])[]) {
  const n = punkter.length;
  const xs = punkter.map((p) => p[0]);
  const ys = punkter.map((p) => p[1]);
  const d: number[] = [];
  const m: number[] = new Array<number>(n).fill(0);
  for (let i = 0; i < n - 1; i++) d.push((ys[i + 1]! - ys[i]!) / (xs[i + 1]! - xs[i]!));
  m[0] = d[0]!;
  m[n - 1] = d[n - 2]!;
  for (let i = 1; i < n - 1; i++) {
    m[i] = d[i - 1]! * d[i]! <= 0 ? 0 : (d[i - 1]! + d[i]!) / 2;
  }
  for (let i = 0; i < n - 1; i++) {
    if (d[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i]! / d[i]!;
    const b = m[i + 1]! / d[i]!;
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * d[i]!;
      m[i + 1] = t * b * d[i]!;
    }
  }
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

function laddaBild(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const klar = img.decode ? img.decode().catch(() => undefined) : Promise.resolve();
      void klar.then(() => resolve(img));
    };
    img.onerror = reject;
    img.src = src;
  });
}

function mjukaKanter(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const g = c.getContext("2d");
  if (!g) return c;
  g.drawImage(img, 0, 0);
  g.globalCompositeOperation = "destination-in";
  for (const [x1, y1] of [
    [c.width, 0],
    [0, c.height],
  ] as const) {
    const grad = g.createLinearGradient(0, 0, x1, y1);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(MJUK_KANT, "rgba(0,0,0,1)");
    grad.addColorStop(1 - MJUK_KANT, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);
  }
  return c;
}

// ---------- Geometri ----------

// Gemensam förvrängning under övertoningen (kring portalen i världen).
function forvrangning(f: number): Punkt {
  return { x: lerp(1, PROPORTIONELL / MATCH.x, f), y: lerp(1, PROPORTIONELL / MATCH.y, f) };
}

// Närbildspunkt -> världen, givet förvrängning w.
function narbildTillVarld(p: Punkt, w: Punkt): Punkt {
  return {
    x: PORTAL_OVERSIKT.x + w.x * MATCH.x * (p.x - PORTAL_NARBILD.x),
    y: PORTAL_OVERSIKT.y + w.y * MATCH.y * (p.y - PORTAL_NARBILD.y),
  };
}

type Layout = ReturnType<typeof beraknaLayout>;

function beraknaLayout(vw: number, vh: number) {
  // "cover"-skala för översiktsbilden.
  const s0 = Math.max(vw / OVERSIKT.w, vh / OVERSIKT.h);
  const dorr = narbildTillVarld(DORR_NARBILD, forvrangning(1));

  // Närbildens heltäckande kärna (utan mjuk kant) i världen.
  const karnaHalvB = (NARBILD.w * (1 - 2 * MJUK_KANT) * PROPORTIONELL) / 2;
  const karnaHalvH = (NARBILD.h * (1 - 2 * MJUK_KANT) * PROPORTIONELL) / 2;
  const karnaMitt = narbildTillVarld({ x: NARBILD.w / 2, y: NARBILD.h / 2 }, forvrangning(1));
  const dx = Math.abs(karnaMitt.x - dorr.x);
  const dy = Math.abs(karnaMitt.y - dorr.y);

  // Marginal så att krängningen aldrig visar hörnen.
  const marginal =
    1 + Math.sin((KRANGNING_GRADER * Math.PI) / 180) * Math.max(vw / vh, vh / vw) + 0.02;
  const halvB1 = vw / 2 / s0;
  const halvH1 = vh / 2 / s0;

  // Zoomen där närbilden täcker hela skärmen (övertoningen klar).
  const zFull = Math.max(
    (halvB1 * marginal) / Math.max(karnaHalvB - dx, 1),
    (halvH1 * marginal) / Math.max(karnaHalvH - dy, 1),
    2.4,
  );
  const zToningStart = zFull / 1.5;

  // Slutzoom: bara några få närbildspixlar syns.
  const zSlut = Math.max(
    (Math.min(halvB1, halvH1) * 2) / (SLUT_PIXLAR * PROPORTIONELL),
    zFull * 8,
  );
  const lnSlut = Math.log(zSlut);
  const uFull = Math.log(zFull) / lnSlut;

  // Scroll (0..1) -> flygförlopp u (0..1, där zoom = zSlut^u). Kort start, långsam inflygning
  // över staden, lugnt parti vid katedralen, sedan in genom porten och svart i sista delen.
  const kurva = monotonKurva([
    [0, 0],
    [0.03, 0],
    [0.4, uFull],
    [0.56, uFull + 0.07],
    [0.9, 1],
    [1, 1],
  ]);

  return { s0, zFull, zToningStart, lnSlut, uFull, kurva, marginal };
}

// ---------- Start ----------

/**
 * Startar flygningen i `sektion` (den höga scrollsektionen). Returnerar en funktion som
 * stoppar den och tar bort alla lyssnare.
 */
export function startaDronarflygning(sektion: HTMLElement): () => void {
  const scen = sektion.querySelector<HTMLElement>(".flight__stage");
  const canvas = sektion.querySelector<HTMLCanvasElement>(".flight__canvas");
  const ctx = canvas?.getContext("2d", { alpha: false });
  if (!scen || !canvas || !ctx) return () => {};

  const kanFiltrera = "filter" in ctx;
  const minskadRorelse = window.matchMedia("(prefers-reduced-motion: reduce)");

  let vw = 1;
  let vh = 1;
  let dpr = 1;
  let layout: Layout | null = null;
  let oversikt: HTMLImageElement | null = null;
  let narbild: HTMLCanvasElement | null = null;
  let mal = 0; // scrollframsteg 0..1
  let nu = 0; // dämpat framsteg
  let senast = 0;
  let igang = false;
  let stoppad = false;
  let ram = 0;

  const satt = (namn: string, v: string) => sektion.style.setProperty(namn, v);

  function lasScroll() {
    const rect = sektion.getBoundingClientRect();
    const skrollbar = sektion.offsetHeight - vh;
    mal = skrollbar > 0 ? clamp(-rect.top / skrollbar, 0, 1) : 0;
  }

  function storlek() {
    const rect = scen!.getBoundingClientRect();
    vw = Math.max(1, Math.round(rect.width));
    vh = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas!.width = Math.round(vw * dpr);
    canvas!.height = Math.round(vh * dpr);
    layout = beraknaLayout(vw, vh);
    lasScroll();
    nu = mal;
    rita();
  }

  function rita() {
    if (!layout || !oversikt || !ctx) return;
    const L = layout;
    const p = nu;
    const u = clamp(L.kurva(p), 0, 1);
    const z = Math.exp(u * L.lnSlut);
    const lnz = Math.log(z);

    // Övertoning och gemensam förvrängning.
    const toning = smootherstep(Math.log(L.zToningStart), Math.log(L.zFull), lnz);
    const w = forvrangning(toning);

    // Krängning: lätt lutning under inflygningen som rätas upp.
    const krang =
      ((KRANGNING_GRADER * Math.PI) / 180) * Math.sin(Math.PI * clamp(u / (L.uFull * 1.6), 0, 1));

    const s = L.s0 * z * L.marginal;

    // Kamerans mittpunkt: dörren förs mjukt från sin plats i bilden mot mitten.
    const dorr = narbildTillVarld(DORR_NARBILD, w);
    const startX = OVERSIKT.w / 2;
    const startY = OVERSIKT.h / 2;
    const offX0 = (dorr.x - startX) * L.s0 * L.marginal;
    const offY0 = (dorr.y - startY) * L.s0 * L.marginal;
    const e = easeInOutCubic(clamp(u / (L.uFull * 1.25), 0, 1));
    let cx = dorr.x - (offX0 * (1 - e)) / s;
    let cy = dorr.y - (offY0 * (1 - e)) / s;

    // Håll synfältet inom översiktsbilden.
    const halvB = vw / 2 / s;
    const halvH = vh / 2 / s;
    const r = Math.hypot(halvB, halvH);
    const vyX = Math.abs(Math.cos(krang)) * halvB + Math.abs(Math.sin(krang)) * halvH;
    const vyY = Math.abs(Math.sin(krang)) * halvB + Math.abs(Math.cos(krang)) * halvH;
    cx = clamp(cx, vyX, OVERSIKT.w - vyX);
    cy = clamp(cy, vyY, OVERSIKT.h - vyY);

    // Mörker när vi går in genom porten.
    const synligaPixlar = (Math.min(halvB, halvH) * 2) / PROPORTIONELL;
    const svart = smoothstep(80, 13, synligaPixlar);

    // Mitt i övertoningen: kort ljusdis och lätt oskärpa, som när en drönare passerar genom
    // motljus. Döljer att bilderna inte är exakt samma vy.
    const mitt = Math.pow(Math.sin(Math.PI * toning), 1.5);
    const oskarpa = kanFiltrera ? mitt * 1.4 * dpr : 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (kanFiltrera) ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas!.width, canvas!.height);

    if (svart < 0.999) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (oskarpa > 0.05) ctx.filter = `blur(${oskarpa.toFixed(2)}px)`;

      // Kamera: skärmmitt -> krängning -> skala -> världen.
      const kamera = new DOMMatrix()
        .scaleSelf(dpr, dpr)
        .translateSelf(vw / 2, vh / 2)
        .rotateSelf((krang * 180) / Math.PI)
        .scaleSelf(s, s)
        .translateSelf(-cx, -cy);

      // Synligt område i världen (kvadrat som täcker roterad vy).
      const x0 = cx - r;
      const y0 = cy - r;
      const x1 = cx + r;
      const y1 = cy + r;

      // Behövs översiktsbilden? Bara om närbilden inte täcker hela vyn.
      const karnaTL = narbildTillVarld({ x: NARBILD.w * MJUK_KANT, y: NARBILD.h * MJUK_KANT }, w);
      const karnaBR = narbildTillVarld(
        { x: NARBILD.w * (1 - MJUK_KANT), y: NARBILD.h * (1 - MJUK_KANT) },
        w,
      );
      const narbildTacker =
        toning >= 0.999 &&
        karnaTL.x <= cx - vyX &&
        karnaBR.x >= cx + vyX &&
        karnaTL.y <= cy - vyY &&
        karnaBR.y >= cy + vyY;

      if (!narbildTacker) {
        const m = kamera
          .translate(PORTAL_OVERSIKT.x, PORTAL_OVERSIKT.y)
          .scaleSelf(w.x, w.y)
          .translateSelf(-PORTAL_OVERSIKT.x, -PORTAL_OVERSIKT.y);
        ctx.setTransform(m);
        // Rita bara den synliga delen (snabbare vid hög zoom).
        const sx0 = clamp(PORTAL_OVERSIKT.x + (x0 - PORTAL_OVERSIKT.x) / w.x - 2, 0, OVERSIKT.w);
        const sy0 = clamp(PORTAL_OVERSIKT.y + (y0 - PORTAL_OVERSIKT.y) / w.y - 2, 0, OVERSIKT.h);
        const sx1 = clamp(PORTAL_OVERSIKT.x + (x1 - PORTAL_OVERSIKT.x) / w.x + 2, 0, OVERSIKT.w);
        const sy1 = clamp(PORTAL_OVERSIKT.y + (y1 - PORTAL_OVERSIKT.y) / w.y + 2, 0, OVERSIKT.h);
        if (sx1 > sx0 && sy1 > sy0) {
          ctx.drawImage(oversikt, sx0, sy0, sx1 - sx0, sy1 - sy0, sx0, sy0, sx1 - sx0, sy1 - sy0);
        }
      }

      if (narbild && toning > 0.001) {
        const kx = w.x * MATCH.x;
        const ky = w.y * MATCH.y;
        const m = kamera
          .translate(PORTAL_OVERSIKT.x, PORTAL_OVERSIKT.y)
          .scaleSelf(kx, ky)
          .translateSelf(-PORTAL_NARBILD.x, -PORTAL_NARBILD.y);
        ctx.setTransform(m);
        ctx.globalAlpha = toning;
        const sx0 = clamp(PORTAL_NARBILD.x + (x0 - PORTAL_OVERSIKT.x) / kx - 2, 0, NARBILD.w);
        const sy0 = clamp(PORTAL_NARBILD.y + (y0 - PORTAL_OVERSIKT.y) / ky - 2, 0, NARBILD.h);
        const sx1 = clamp(PORTAL_NARBILD.x + (x1 - PORTAL_OVERSIKT.x) / kx + 2, 0, NARBILD.w);
        const sy1 = clamp(PORTAL_NARBILD.y + (y1 - PORTAL_OVERSIKT.y) / ky + 2, 0, NARBILD.h);
        if (sx1 > sx0 && sy1 > sy0) {
          ctx.drawImage(narbild, sx0, sy0, sx1 - sx0, sy1 - sy0, sx0, sy0, sx1 - sx0, sy1 - sy0);
        }
        ctx.globalAlpha = 1;
      }
      if (kanFiltrera) ctx.filter = "none";
    }

    // Överlägg via CSS-variabler på sektionen.
    satt("--black-o", svart.toFixed(4));
    satt("--hero-o", (1 - smoothstep(0, 0.07, p)).toFixed(4));
    satt("--hero-y", `${(-smoothstep(0, 0.1, p) * 60).toFixed(2)}px`);
    satt("--cue-o", (1 - smoothstep(0, 0.03, p)).toFixed(4));
    satt("--haze", (mitt * 0.26).toFixed(4));
    satt("--vignette", (1 - toning * 0.35).toFixed(4));
  }

  function tick(tid: number) {
    if (stoppad) return;
    const dt = senast ? Math.min((tid - senast) / 1000, 0.1) : 1 / 60;
    senast = tid;
    nu = minskadRorelse.matches ? mal : nu + (mal - nu) * (1 - Math.exp(-dt / TROGHET));
    if (Math.abs(mal - nu) < 1e-5) nu = mal;
    rita();
    if (nu !== mal) {
      ram = requestAnimationFrame(tick);
    } else {
      igang = false;
      senast = 0;
    }
  }

  function vakna() {
    lasScroll();
    if (!igang) {
      igang = true;
      ram = requestAnimationFrame(tick);
    }
  }

  const visuell = window.visualViewport;

  void laddaBild(OVERSIKT.src)
    .then((img) => {
      if (stoppad) return;
      oversikt = img;
      storlek();
      sektion.dataset["ready"] = "";
      window.addEventListener("scroll", vakna, { passive: true });
      window.addEventListener("resize", storlek);
      visuell?.addEventListener("resize", storlek);
      return laddaBild(NARBILD.src).then((n) => {
        if (stoppad) return;
        narbild = mjukaKanter(n);
        rita();
      });
    })
    .catch(() => {
      // Posterbilden står kvar om något inte laddar.
    });

  return () => {
    stoppad = true;
    cancelAnimationFrame(ram);
    window.removeEventListener("scroll", vakna);
    window.removeEventListener("resize", storlek);
    visuell?.removeEventListener("resize", storlek);
  };
}
