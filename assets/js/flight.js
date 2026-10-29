/*
 * Drönarflygning över Palma.
 *
 * Scrollen styr en kamera som flyger från översiktsbilden (bild 2) in mot
 * katedralens huvudentré. På vägen tonar närbilden (bild 1) in, och till sist
 * dyker kameran in i dörren och sidan blir svart.
 *
 * Koordinatsystem: "världen" är pixlarna i översiktsbilden (4096 × 3124).
 * Närbilden placeras i världen så att entrén hamnar på samma ställe.
 *
 * Hur det hålls mjukt:
 *  - Zoomen är logaritmisk (konstant upplevd fart, som en verklig framflygning).
 *  - Scrollpositionen dämpas med tröghet, så varje hjulsteg blir ett glid.
 *  - Bilderna har olika perspektiv (AI-genererade). Under övertoningen förvrids
 *    båda bilderna gemensamt så att fasaderna sammanfaller, vilket läser som
 *    parallax från en kamera i rörelse i stället för en dubbelexponering.
 */
(() => {
  "use strict";

  // ---------- Bilddata (uppmätt) ----------

  const OVERVIEW = { src: "assets/img/palma-oversikt.webp", w: 4096, h: 3124 };
  const CLOSEUP = { src: "assets/img/palma-katedral.webp", w: 1672, h: 941 };

  // Entréportalen i respektive bild.
  const PORTAL_OVERVIEW = { x: 2211, y: 1707 };
  const PORTAL_CLOSEUP = { x: 917, y: 452 };

  // Närbildens skala i världen när fasaderna matchas (perspektiven skiljer sig:
  // fasaden är relativt smalare i översiktsbilden).
  const MATCH = { x: 0.66, y: 0.86 };
  // Proportionell skala som närbilden landar i efter övertoningen.
  const UNIFORM = Math.sqrt(MATCH.x * MATCH.y);

  // Punkten kameran dyker in i: vänstra dörröppningen i huvudentrén (närbild).
  const DOOR_CLOSEUP = { x: 920, y: 474 };

  // Mjuk kant på närbilden så att den inte har synliga kanter under toningen.
  const FEATHER = 0.06;

  // Hur få närbildspixlar som ska synas när allt är svart.
  const END_VISIBLE_PX = 10;

  // Tröghet i sekunder (tidskonstant). Högre = mer "flytande".
  const INERTIA = 0.16;

  // Lätt krängning under inflygningen, i grader.
  const BANK_DEG = 0.7;

  // ---------- Hjälpfunktioner ----------

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smoothstep = (a, b, v) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * (3 - 2 * t);
  };
  const smootherstep = (a, b, v) => {
    const t = clamp((v - a) / (b - a), 0, 1);
    return t * t * t * (t * (t * 6 - 15) + 10);
  };
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  // Monoton kubisk interpolation (Fritsch–Carlson): mjuk kurva utan överslag,
  // så att flygningen aldrig backar eller rycker mellan nyckelpunkterna.
  function monotoneCurve(points) {
    const n = points.length;
    const xs = points.map((p) => p[0]);
    const ys = points.map((p) => p[1]);
    const d = [];
    const m = new Array(n).fill(0);
    for (let i = 0; i < n - 1; i++) d.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]));
    m[0] = d[0];
    m[n - 1] = d[n - 2];
    for (let i = 1; i < n - 1; i++) m[i] = d[i - 1] * d[i] <= 0 ? 0 : (d[i - 1] + d[i]) / 2;
    for (let i = 0; i < n - 1; i++) {
      if (d[i] === 0) { m[i] = 0; m[i + 1] = 0; continue; }
      const a = m[i] / d[i];
      const b = m[i + 1] / d[i];
      const s = a * a + b * b;
      if (s > 9) {
        const t = 3 / Math.sqrt(s);
        m[i] = t * a * d[i];
        m[i + 1] = t * b * d[i];
      }
    }
    return (x) => {
      if (x <= xs[0]) return ys[0];
      if (x >= xs[n - 1]) return ys[n - 1];
      let i = 0;
      while (x > xs[i + 1]) i++;
      const h = xs[i + 1] - xs[i];
      const t = (x - xs[i]) / h;
      const t2 = t * t;
      const t3 = t2 * t;
      return (
        (2 * t3 - 3 * t2 + 1) * ys[i] +
        (t3 - 2 * t2 + t) * h * m[i] +
        (-2 * t3 + 3 * t2) * ys[i + 1] +
        (t3 - t2) * h * m[i + 1]
      );
    };
  }

  // ---------- DOM ----------

  const root = document.documentElement;
  const section = document.getElementById("flight");
  const stage = section.querySelector(".flight__stage");
  const canvas = section.querySelector(".flight__canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const canFilter = "filter" in ctx;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let vw = 0;
  let vh = 0;
  let dpr = 1;

  // Beräknas om vid storleksändring.
  let layout = null;

  let overviewImg = null;
  let closeupLayer = null; // canvas med mjuka kanter

  let target = 0; // scrollframsteg 0..1
  let current = 0; // dämpat framsteg
  let lastTime = 0;
  let running = false;

  // ---------- Bildladdning ----------

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(() => resolve(img));
      img.onerror = reject;
      img.src = src;
    });
  }

  function featherLayer(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "destination-in";

    const fx = FEATHER;
    let grad = g.createLinearGradient(0, 0, c.width, 0);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(fx, "rgba(0,0,0,1)");
    grad.addColorStop(1 - fx, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);

    grad = g.createLinearGradient(0, 0, 0, c.height);
    grad.addColorStop(0, "rgba(0,0,0,0)");
    grad.addColorStop(fx, "rgba(0,0,0,1)");
    grad.addColorStop(1 - fx, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  // ---------- Geometri ----------

  // Gemensam förvrängning under övertoningen (kring portalen i världen).
  function warpAt(f) {
    return {
      x: lerp(1, UNIFORM / MATCH.x, f),
      y: lerp(1, UNIFORM / MATCH.y, f),
    };
  }

  // Närbildspunkt -> världen, givet förvrängning w.
  function closeupToWorld(p, w) {
    return {
      x: PORTAL_OVERVIEW.x + w.x * MATCH.x * (p.x - PORTAL_CLOSEUP.x),
      y: PORTAL_OVERVIEW.y + w.y * MATCH.y * (p.y - PORTAL_CLOSEUP.y),
    };
  }

  function computeLayout() {
    // "cover"-skala för översiktsbilden.
    const s0 = Math.max(vw / OVERVIEW.w, vh / OVERVIEW.h);

    // Var dyker vi in (i slutlig, proportionell placering)?
    const door = closeupToWorld(DOOR_CLOSEUP, warpAt(1));

    // Närbildens heltäckande kärna (utan mjuk kant) i världen.
    const coreHalfW = (CLOSEUP.w * (1 - 2 * FEATHER) * UNIFORM) / 2;
    const coreHalfH = (CLOSEUP.h * (1 - 2 * FEATHER) * UNIFORM) / 2;
    const coreCenter = closeupToWorld({ x: CLOSEUP.w / 2, y: CLOSEUP.h / 2 }, warpAt(1));
    const dx = Math.abs(coreCenter.x - door.x);
    const dy = Math.abs(coreCenter.y - door.y);

    // Halva synfältet vid zoom 1, i världspixlar, inkl. marginal för krängning.
    const bankMargin = 1 + Math.sin((BANK_DEG * Math.PI) / 180) * Math.max(vw / vh, vh / vw) + 0.02;
    const halfW1 = vw / 2 / s0;
    const halfH1 = vh / 2 / s0;

    // Zoomen där närbilden täcker hela skärmen (övertoningen klar).
    const zFull = Math.max(
      (halfW1 * bankMargin) / Math.max(coreHalfW - dx, 1),
      (halfH1 * bankMargin) / Math.max(coreHalfH - dy, 1),
      2.4
    );
    const zFadeStart = zFull / 1.5;

    // Slutzoom: bara några få närbildspixlar syns.
    const zEnd = Math.max((Math.min(halfW1, halfH1) * 2) / (END_VISIBLE_PX * UNIFORM), zFull * 8);
    const lnEnd = Math.log(zEnd);
    const uFull = Math.log(zFull) / lnEnd;

    // Scroll (0..1) -> flygförlopp u (0..1, där zoom = zEnd^u).
    // Kort start, långsam inflygning över staden, lugnt parti vid katedralen,
    // sedan in genom porten och svart i sista delen.
    const curve = monotoneCurve([
      [0, 0],
      [0.03, 0],
      [0.4, uFull],
      [0.56, uFull + 0.07],
      [0.9, 1],
      [1, 1],
    ]);

    return { s0, door, zFull, zFadeStart, zEnd, lnEnd, uFull, curve, halfW1, halfH1, bankMargin };
  }

  // ---------- Rendering ----------

  function resize() {
    const rect = stage.getBoundingClientRect();
    vw = Math.max(1, Math.round(rect.width));
    vh = Math.max(1, Math.round(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    layout = computeLayout();
    readScroll();
    current = target;
    draw();
  }

  function readScroll() {
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - vh;
    target = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
  }

  function draw() {
    if (!layout || !overviewImg) return;
    const L = layout;
    const p = current;
    const u = clamp(L.curve(p), 0, 1);
    const z = Math.exp(u * L.lnEnd);
    const lnz = Math.log(z);

    // Övertoning och gemensam förvrängning.
    const fade = smootherstep(Math.log(L.zFadeStart), Math.log(L.zFull), lnz);
    const w = warpAt(fade);

    // Krängning: lätt lutning under inflygningen som rätas upp.
    const bank = ((BANK_DEG * Math.PI) / 180) * Math.sin(Math.PI * clamp(u / (L.uFull * 1.6), 0, 1));

    const s = L.s0 * z * L.bankMargin;

    // Kamerans mittpunkt: dörren förs mjukt från sin plats i bilden mot mitten.
    const door = closeupToWorld(DOOR_CLOSEUP, w);
    const start = { x: OVERVIEW.w / 2, y: OVERVIEW.h / 2 };
    const offX0 = (door.x - start.x) * L.s0 * L.bankMargin;
    const offY0 = (door.y - start.y) * L.s0 * L.bankMargin;
    const e = easeInOutCubic(clamp(u / (L.uFull * 1.25), 0, 1));
    let cx = door.x - (offX0 * (1 - e)) / s;
    let cy = door.y - (offY0 * (1 - e)) / s;

    // Håll synfältet inom översiktsbilden.
    const halfW = vw / 2 / s;
    const halfH = vh / 2 / s;
    const r = Math.hypot(halfW, halfH);
    const viewR = { x: Math.abs(Math.cos(bank)) * halfW + Math.abs(Math.sin(bank)) * halfH, y: Math.abs(Math.sin(bank)) * halfW + Math.abs(Math.cos(bank)) * halfH };
    cx = clamp(cx, viewR.x, OVERVIEW.w - viewR.x);
    cy = clamp(cy, viewR.y, OVERVIEW.h - viewR.y);

    // Mörker när vi går in genom porten.
    const visiblePx = (Math.min(halfW, halfH) * 2) / UNIFORM;
    const black = smoothstep(80, 13, visiblePx);

    // Mitt i övertoningen: kort ljusdis och lätt oskärpa, som när en drönare
    // passerar genom motljus. Döljer att bilderna inte är exakt samma vy.
    const mid = Math.pow(Math.sin(Math.PI * fade), 1.5);
    const blurPx = canFilter ? mid * 1.4 * dpr : 0;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (black < 0.999) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      if (blurPx > 0.05) ctx.filter = `blur(${blurPx.toFixed(2)}px)`;

      // Kamera: skärmmitt -> krängning -> skala -> världen.
      const camera = new DOMMatrix()
        .scaleSelf(dpr, dpr)
        .translateSelf(vw / 2, vh / 2)
        .rotateSelf((bank * 180) / Math.PI)
        .scaleSelf(s, s)
        .translateSelf(-cx, -cy);

      // Synligt område i världen (kvadrat som täcker roterad vy).
      const view = { x0: cx - r, y0: cy - r, x1: cx + r, y1: cy + r };

      // Behövs översiktsbilden? Bara om närbilden inte täcker hela vyn.
      const coreTL = closeupToWorld({ x: CLOSEUP.w * FEATHER, y: CLOSEUP.h * FEATHER }, w);
      const coreBR = closeupToWorld({ x: CLOSEUP.w * (1 - FEATHER), y: CLOSEUP.h * (1 - FEATHER) }, w);
      const closeupCovers =
        fade >= 0.999 &&
        coreTL.x <= cx - viewR.x && coreBR.x >= cx + viewR.x &&
        coreTL.y <= cy - viewR.y && coreBR.y >= cy + viewR.y;

      if (!closeupCovers) {
        // Översiktsbilden, förvrängd kring portalen.
        const m = camera
          .translate(PORTAL_OVERVIEW.x, PORTAL_OVERVIEW.y)
          .scaleSelf(w.x, w.y)
          .translateSelf(-PORTAL_OVERVIEW.x, -PORTAL_OVERVIEW.y);
        ctx.setTransform(m);
        // Rita bara den synliga delen (snabbare vid hög zoom).
        const sx0 = clamp(PORTAL_OVERVIEW.x + (view.x0 - PORTAL_OVERVIEW.x) / w.x - 2, 0, OVERVIEW.w);
        const sy0 = clamp(PORTAL_OVERVIEW.y + (view.y0 - PORTAL_OVERVIEW.y) / w.y - 2, 0, OVERVIEW.h);
        const sx1 = clamp(PORTAL_OVERVIEW.x + (view.x1 - PORTAL_OVERVIEW.x) / w.x + 2, 0, OVERVIEW.w);
        const sy1 = clamp(PORTAL_OVERVIEW.y + (view.y1 - PORTAL_OVERVIEW.y) / w.y + 2, 0, OVERVIEW.h);
        if (sx1 > sx0 && sy1 > sy0) {
          ctx.drawImage(overviewImg, sx0, sy0, sx1 - sx0, sy1 - sy0, sx0, sy0, sx1 - sx0, sy1 - sy0);
        }
      }

      if (closeupLayer && fade > 0.001) {
        const m = camera
          .translate(PORTAL_OVERVIEW.x, PORTAL_OVERVIEW.y)
          .scaleSelf(w.x * MATCH.x, w.y * MATCH.y)
          .translateSelf(-PORTAL_CLOSEUP.x, -PORTAL_CLOSEUP.y);
        ctx.setTransform(m);
        ctx.globalAlpha = fade;
        const kx = w.x * MATCH.x;
        const ky = w.y * MATCH.y;
        const sx0 = clamp(PORTAL_CLOSEUP.x + (view.x0 - PORTAL_OVERVIEW.x) / kx - 2, 0, CLOSEUP.w);
        const sy0 = clamp(PORTAL_CLOSEUP.y + (view.y0 - PORTAL_OVERVIEW.y) / ky - 2, 0, CLOSEUP.h);
        const sx1 = clamp(PORTAL_CLOSEUP.x + (view.x1 - PORTAL_OVERVIEW.x) / kx + 2, 0, CLOSEUP.w);
        const sy1 = clamp(PORTAL_CLOSEUP.y + (view.y1 - PORTAL_OVERVIEW.y) / ky + 2, 0, CLOSEUP.h);
        if (sx1 > sx0 && sy1 > sy0) {
          ctx.drawImage(closeupLayer, sx0, sy0, sx1 - sx0, sy1 - sy0, sx0, sy0, sx1 - sx0, sy1 - sy0);
        }
        ctx.globalAlpha = 1;
      }
      ctx.filter = "none";
    }

    // Överlägg via CSS-variabler.
    root.style.setProperty("--black-o", black.toFixed(4));
    root.style.setProperty("--hero-o", (1 - smoothstep(0.0, 0.07, p)).toFixed(4));
    root.style.setProperty("--hero-y", `${(-smoothstep(0, 0.1, p) * 60).toFixed(2)}px`);
    root.style.setProperty("--cue-o", (1 - smoothstep(0.0, 0.03, p)).toFixed(4));
    root.style.setProperty("--haze", (mid * 0.26).toFixed(4));
    root.style.setProperty("--vignette", (1 - fade * 0.35).toFixed(4));
  }

  // ---------- Loop ----------

  function tick(now) {
    const dt = lastTime ? Math.min((now - lastTime) / 1000, 0.1) : 1 / 60;
    lastTime = now;

    if (reducedMotion.matches) {
      current = target;
    } else {
      current += (target - current) * (1 - Math.exp(-dt / INERTIA));
    }

    if (Math.abs(target - current) < 1e-5) current = target;
    draw();

    if (current !== target) {
      requestAnimationFrame(tick);
    } else {
      running = false;
      lastTime = 0;
    }
  }

  function wake() {
    readScroll();
    if (!running) {
      running = true;
      requestAnimationFrame(tick);
    }
  }

  // ---------- Start ----------

  async function init() {
    try {
      overviewImg = await loadImage(OVERVIEW.src);
    } catch {
      return; // posterbilden står kvar
    }
    resize();
    document.body.classList.add("is-ready");

    loadImage(CLOSEUP.src)
      .then((img) => {
        closeupLayer = featherLayer(img);
        draw();
      })
      .catch(() => {});

    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", resize);
    if (window.visualViewport) window.visualViewport.addEventListener("resize", resize);
  }

  // För felsökning och test: window.__flight.set(0.5) ritar en given punkt.
  window.__flight = {
    set(p) {
      target = current = clamp(p, 0, 1);
      draw();
    },
    get layout() { return layout; },
  };

  init();
})();
