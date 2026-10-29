/*
 * Gatugraf och slinga.
 *
 * Tar gatulinjer (i meter, lokalt koordinatsystem) och bygger ett sammanhängande gatunät:
 *  - Vektorkartor tappar ofta punkten där två gator korsar varandra, så korsningar räknas fram
 *    geometriskt och gatorna delas där.
 *  - Gator som slutar en bit ifrån en annan gata (T-korsningar utan gemensam punkt) kopplas ihop.
 *  - Korta återvändsstumpar (ofta skarvar mellan kartrutor) rensas bort.
 *
 * Sedan går en deterministisk "promenad" genom nätet: den föredrar gator den inte har gått,
 * små gator framför stora, att fortsätta rakt fram, och att hålla sig inom ett område.
 * Ren TypeScript utan beroenden, så att den kan testas utan karta.
 */

export type P = { x: number; y: number };
export type Gata = { punkter: P[]; liten: boolean };

type Kant = { till: number; langd: number; liten: boolean; id: number };
type Nod = P & { kanter: Kant[] };

const SNAP = 0.9; // meter: punkter närmare än så blir samma nod
const T_KOPPLING = 4; // meter: en gatuände så nära en annan gata kopplas ihop med den
const STUMP = 22; // meter: kortare återvändsgränder tas bort

const nyckel = (p: P) => `${Math.round(p.x / SNAP)},${Math.round(p.y / SNAP)}`;
const avstand = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);

type Segment = { a: P; b: P; liten: boolean; delningar: number[] };

/** Bygger gatunätet. */
export function byggGraf(gator: readonly Gata[]): Nod[] {
  // 1. Segment, utan dubbletter (samma gata kommer ofta från flera kartrutor).
  const sett = new Set<string>();
  const segment: Segment[] = [];
  for (const g of gator) {
    for (let i = 0; i < g.punkter.length - 1; i++) {
      const a = g.punkter[i]!;
      const b = g.punkter[i + 1]!;
      if (avstand(a, b) < 0.05) continue;
      const ka = nyckel(a);
      const kb = nyckel(b);
      const k = ka < kb ? `${ka}|${kb}` : `${kb}|${ka}`;
      if (sett.has(k)) continue;
      sett.add(k);
      segment.push({ a, b, liten: g.liten, delningar: [] });
    }
  }

  // 2. Rutnät för att bara jämföra segment som ligger nära varandra.
  const CELL = 25;
  const rutor = new Map<string, number[]>();
  segment.forEach((s, i) => {
    const x0 = Math.floor((Math.min(s.a.x, s.b.x) - T_KOPPLING) / CELL);
    const x1 = Math.floor((Math.max(s.a.x, s.b.x) + T_KOPPLING) / CELL);
    const y0 = Math.floor((Math.min(s.a.y, s.b.y) - T_KOPPLING) / CELL);
    const y1 = Math.floor((Math.max(s.a.y, s.b.y) + T_KOPPLING) / CELL);
    for (let x = x0; x <= x1; x++)
      for (let y = y0; y <= y1; y++) {
        const k = `${x},${y}`;
        const lista = rutor.get(k);
        if (lista) lista.push(i);
        else rutor.set(k, [i]);
      }
  });

  // 3. Korsningar: dela båda segmenten där de skär varandra.
  const provade = new Set<number>();
  for (const lista of rutor.values()) {
    for (let m = 0; m < lista.length; m++)
      for (let n = m + 1; n < lista.length; n++) {
        const i = lista[m]!;
        const j = lista[n]!;
        const par = i < j ? i * 1e6 + j : j * 1e6 + i;
        if (provade.has(par)) continue;
        provade.add(par);
        const s = segment[i]!;
        const t = segment[j]!;
        const r = { x: s.b.x - s.a.x, y: s.b.y - s.a.y };
        const q = { x: t.b.x - t.a.x, y: t.b.y - t.a.y };
        const kors = r.x * q.y - r.y * q.x;
        if (Math.abs(kors) < 1e-9) continue;
        const d = { x: t.a.x - s.a.x, y: t.a.y - s.a.y };
        const u1 = (d.x * q.y - d.y * q.x) / kors;
        const u2 = (d.x * r.y - d.y * r.x) / kors;
        if (u1 > 1e-6 && u1 < 1 - 1e-6 && u2 > -1e-6 && u2 < 1 + 1e-6) s.delningar.push(u1);
        if (u2 > 1e-6 && u2 < 1 - 1e-6 && u1 > -1e-6 && u1 < 1 + 1e-6) t.delningar.push(u2);
      }
  }

  // 4. T-korsningar: räkna hur många segment som delar varje ändpunkt.
  const andar = new Map<string, number>();
  for (const s of segment) {
    for (const p of [s.a, s.b]) andar.set(nyckel(p), (andar.get(nyckel(p)) ?? 0) + 1);
  }
  const extra: { a: P; b: P; liten: boolean }[] = [];
  for (const s of segment) {
    for (const p of [s.a, s.b]) {
      if ((andar.get(nyckel(p)) ?? 0) !== 1) continue; // inte en lös ände
      const cx = Math.floor(p.x / CELL);
      const cy = Math.floor(p.y / CELL);
      let bast: { seg: Segment; u: number; d: number } | null = null;
      for (const i of rutor.get(`${cx},${cy}`) ?? []) {
        const t = segment[i]!;
        if (t === s) continue;
        const q = { x: t.b.x - t.a.x, y: t.b.y - t.a.y };
        const l2 = q.x * q.x + q.y * q.y;
        if (l2 < 1e-9) continue;
        const u = ((p.x - t.a.x) * q.x + (p.y - t.a.y) * q.y) / l2;
        if (u < 0 || u > 1) continue;
        const proj = { x: t.a.x + q.x * u, y: t.a.y + q.y * u };
        const d = avstand(p, proj);
        if (d > 0.05 && d < T_KOPPLING && (!bast || d < bast.d)) bast = { seg: t, u, d };
      }
      if (bast) {
        const { seg, u } = bast;
        if (u > 1e-6 && u < 1 - 1e-6) seg.delningar.push(u);
        const proj = { x: seg.a.x + (seg.b.x - seg.a.x) * u, y: seg.a.y + (seg.b.y - seg.a.y) * u };
        extra.push({ a: p, b: proj, liten: s.liten });
      }
    }
  }

  // 5. Noder och kanter.
  const noder: Nod[] = [];
  const index = new Map<string, number>();
  const nod = (p: P) => {
    const k = nyckel(p);
    let i = index.get(k);
    if (i === undefined) {
      i = noder.length;
      noder.push({ x: p.x, y: p.y, kanter: [] });
      index.set(k, i);
    }
    return i;
  };
  let kantId = 0;
  const kantSett = new Set<string>();
  const koppla = (a: P, b: P, liten: boolean) => {
    const i = nod(a);
    const j = nod(b);
    if (i === j) return;
    const k = i < j ? `${i}|${j}` : `${j}|${i}`;
    if (kantSett.has(k)) return;
    kantSett.add(k);
    const langd = avstand(noder[i]!, noder[j]!);
    const id = kantId++;
    noder[i]!.kanter.push({ till: j, langd, liten, id });
    noder[j]!.kanter.push({ till: i, langd, liten, id });
  };
  for (const s of segment) {
    const us = [0, ...s.delningar.sort((a, b) => a - b), 1];
    for (let k = 0; k < us.length - 1; k++) {
      const u0 = us[k]!;
      const u1 = us[k + 1]!;
      if (u1 - u0 < 1e-9) continue;
      koppla(
        { x: s.a.x + (s.b.x - s.a.x) * u0, y: s.a.y + (s.b.y - s.a.y) * u0 },
        { x: s.a.x + (s.b.x - s.a.x) * u1, y: s.a.y + (s.b.y - s.a.y) * u1 },
        s.liten,
      );
    }
  }
  for (const e of extra) koppla(e.a, e.b, e.liten);

  rensaStumpar(noder);
  return noder;
}

/** Tar bort korta återvändsgränder (vanligen skarvar mellan kartrutor). */
function rensaStumpar(noder: Nod[]) {
  for (let varv = 0; varv < 3; varv++) {
    for (let i = 0; i < noder.length; i++) {
      if (noder[i]!.kanter.length !== 1) continue;
      // Följ kedjan tills en korsning, och ta bort den om den är kort.
      const kedja: number[] = [i];
      let langd = 0;
      let foregaende = -1;
      let nu = i;
      while (true) {
        const kanter = noder[nu]!.kanter.filter((k) => k.till !== foregaende);
        if (kanter.length !== 1 || noder[nu]!.kanter.length > 2) break;
        const k = kanter[0]!;
        langd += k.langd;
        foregaende = nu;
        nu = k.till;
        if (noder[nu]!.kanter.length !== 2) break;
        kedja.push(nu);
        if (langd > STUMP) break;
      }
      if (langd <= STUMP && noder[nu]!.kanter.length >= 3) {
        const borta = new Set(kedja);
        for (const n of kedja) noder[n]!.kanter = [];
        noder[nu]!.kanter = noder[nu]!.kanter.filter((k) => !borta.has(k.till));
      }
    }
  }
}

/** Liten deterministisk slumpgenerator (mulberry32). */
function slump(fro: number) {
  let a = fro >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Största sammanhängande delen av nätet (så att promenaden inte fastnar på en ö). */
function storstaKomponent(noder: Nod[]): Set<number> {
  const sedd = new Int32Array(noder.length).fill(-1);
  let bast = new Set<number>();
  for (let s = 0; s < noder.length; s++) {
    if (sedd[s] !== -1 || noder[s]!.kanter.length === 0) continue;
    const komp = new Set<number>([s]);
    const ko = [s];
    sedd[s] = s;
    while (ko.length) {
      const n = ko.pop()!;
      for (const k of noder[n]!.kanter) {
        if (sedd[k.till] === -1) {
          sedd[k.till] = s;
          komp.add(k.till);
          ko.push(k.till);
        }
      }
    }
    if (komp.size > bast.size) bast = komp;
  }
  return bast;
}

/**
 * Går en slinga genom nätet med start nära `mitt`, inom radien `radie` (meter), tills
 * `langd` meter har gåtts. Returnerar punkterna i ordning.
 */
export function gaSlinga(
  noder: Nod[],
  { mitt, radie, langd, fro = 7 }: { mitt: P; radie: number; langd: number; fro?: number },
): P[] {
  const komp = storstaKomponent(noder);
  if (komp.size < 10) return [];
  const r = slump(fro);

  // Start: den nod i nätet som ligger närmast mitten och har minst tre gator.
  let start = -1;
  let startD = Infinity;
  for (const i of komp) {
    const n = noder[i]!;
    if (n.kanter.length < 3) continue;
    const d = avstand(n, mitt);
    if (d < startD) {
      startD = d;
      start = i;
    }
  }
  if (start < 0) return [];

  const gangna = new Map<number, number>();
  const vag: P[] = [{ x: noder[start]!.x, y: noder[start]!.y }];
  let nu = start;
  let foregaende = -1;
  let gatt = 0;
  let steg = 0;

  while (gatt < langd && steg < 20000) {
    steg++;
    const n = noder[nu]!;
    let kandidater = n.kanter.filter((k) => k.till !== foregaende && komp.has(k.till));
    if (kandidater.length === 0) kandidater = n.kanter.filter((k) => komp.has(k.till));
    if (kandidater.length === 0) break;

    const riktning =
      foregaende >= 0
        ? { x: n.x - noder[foregaende]!.x, y: n.y - noder[foregaende]!.y }
        : { x: 0, y: 0 };
    const rl = Math.hypot(riktning.x, riktning.y) || 1;

    const vikter = kandidater.map((k) => {
      const m = noder[k.till]!;
      const gang = gangna.get(k.id) ?? 0;
      let w = gang === 0 ? 1 : 0.12 / gang;
      if (k.liten) w *= 1.8;
      // Håll dig inom området: mjukt utanför radien, hårt långt utanför.
      const d = avstand(m, mitt);
      if (d > radie) w *= Math.max(0.02, 1 - (d - radie) / (radie * 0.25));
      // Rakt fram är vanligast, men svängar ska förekomma.
      if (foregaende >= 0) {
        const v = { x: m.x - n.x, y: m.y - n.y };
        const cos = (v.x * riktning.x + v.y * riktning.y) / ((Math.hypot(v.x, v.y) || 1) * rl);
        w *= 0.55 + 0.45 * (cos + 1);
      }
      return Math.max(w, 1e-6);
    });
    const summa = vikter.reduce((a, b) => a + b, 0);
    let x = r() * summa;
    let val = kandidater[0]!;
    for (let i = 0; i < kandidater.length; i++) {
      x -= vikter[i]!;
      if (x <= 0) {
        val = kandidater[i]!;
        break;
      }
    }

    gangna.set(val.id, (gangna.get(val.id) ?? 0) + 1);
    gatt += val.langd;
    foregaende = nu;
    nu = val.till;
    vag.push({ x: noder[nu]!.x, y: noder[nu]!.y });
  }
  return vag;
}

/** Rundar av hörnen lite (en Chaikin-omgång) så att rörelsen blir mjukare i svängarna. */
export function rundaHorn(punkter: readonly P[], andel = 0.2): P[] {
  if (punkter.length < 3) return [...punkter];
  const ut: P[] = [punkter[0]!];
  for (let i = 1; i < punkter.length - 1; i++) {
    const a = punkter[i - 1]!;
    const b = punkter[i]!;
    const c = punkter[i + 1]!;
    const lab = avstand(a, b);
    const lbc = avstand(b, c);
    const r = Math.min(andel * lab, andel * lbc, 6);
    ut.push({ x: b.x + ((a.x - b.x) * r) / (lab || 1), y: b.y + ((a.y - b.y) * r) / (lab || 1) });
    ut.push({ x: b.x + ((c.x - b.x) * r) / (lbc || 1), y: b.y + ((c.y - b.y) * r) / (lbc || 1) });
  }
  ut.push(punkter[punkter.length - 1]!);
  return ut;
}

/** Kumulativ längd längs en linje, för att kunna placera pluppen på en viss sträcka. */
export function kumulativ(punkter: readonly P[]): number[] {
  const c = [0];
  for (let i = 1; i < punkter.length; i++)
    c.push(c[i - 1]! + avstand(punkter[i - 1]!, punkter[i]!));
  return c;
}

/** Punkten och indexet vid sträckan `s` längs linjen. */
export function punktVid(punkter: readonly P[], kum: readonly number[], s: number) {
  const total = kum[kum.length - 1] ?? 0;
  const t = Math.min(Math.max(s, 0), total);
  let lo = 0;
  let hi = kum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (kum[mid]! <= t) lo = mid;
    else hi = mid;
  }
  const a = punkter[lo]!;
  const b = punkter[hi] ?? a;
  const seg = kum[hi]! - kum[lo]! || 1;
  const u = (t - kum[lo]!) / seg;
  return { p: { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u }, i: lo };
}
