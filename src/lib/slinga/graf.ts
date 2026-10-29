/*
 * Gatugraf och rutt.
 *
 * Tar gatulinjer (i meter, lokalt koordinatsystem) och bygger ett sammanhängande gatunät:
 *  - Vektorkartor tappar ofta punkten där två gator korsar varandra, så korsningar räknas fram
 *    geometriskt och gatorna delas där.
 *  - Gator som slutar en bit ifrån en annan gata (T-korsningar utan gemensam punkt) kopplas ihop.
 *  - Korta återvändsstumpar (ofta skarvar mellan kartrutor) rensas bort.
 *
 * Sedan räknas den kortaste gångvägen fram mellan stoppen (Dijkstra), där varje gata kan ha
 * en vikt – större gator kostar lite mer, så att rutten hellre tar gränderna.
 * Ren TypeScript utan beroenden, så att den kan testas utan karta.
 */

export type P = { x: number; y: number };
export type Gata = { punkter: P[]; vikt: number };

type Kant = { till: number; langd: number; vikt: number; id: number };
export type Nod = P & { kanter: Kant[] };

const SNAP = 0.9; // meter: punkter närmare än så blir samma nod
const T_KOPPLING = 4; // meter: en gatuände så nära en annan gata kopplas ihop med den
const STUMP = 22; // meter: kortare återvändsgränder tas bort

const nyckel = (p: P) => `${Math.round(p.x / SNAP)},${Math.round(p.y / SNAP)}`;
const avstand = (a: P, b: P) => Math.hypot(a.x - b.x, a.y - b.y);

type Segment = { a: P; b: P; vikt: number; delningar: number[] };

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
      segment.push({ a, b, vikt: g.vikt, delningar: [] });
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
  const extra: { a: P; b: P; vikt: number }[] = [];
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
        extra.push({ a: p, b: proj, vikt: s.vikt });
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
  const koppla = (a: P, b: P, vikt: number) => {
    const i = nod(a);
    const j = nod(b);
    if (i === j) return;
    const k = i < j ? `${i}|${j}` : `${j}|${i}`;
    if (kantSett.has(k)) return;
    kantSett.add(k);
    const langd = avstand(noder[i]!, noder[j]!);
    const id = kantId++;
    noder[i]!.kanter.push({ till: j, langd, vikt, id });
    noder[j]!.kanter.push({ till: i, langd, vikt, id });
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
        s.vikt,
      );
    }
  }
  for (const e of extra) koppla(e.a, e.b, e.vikt);

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

/** Nod i den stora sammanhängande delen av nätet som ligger närmast punkten. */
function narmasteNod(noder: readonly Nod[], komp: Set<number>, p: P): number {
  let bast = -1;
  let bastD = Infinity;
  for (const i of komp) {
    const d = avstand(noder[i]!, p);
    if (d < bastD) {
      bastD = d;
      bast = i;
    }
  }
  return bast;
}

/** Kortaste vägen (Dijkstra, viktad längd) mellan två noder. Returnerar nodlistan. */
function kortasteVag(noder: readonly Nod[], fran: number, till: number): number[] {
  const n = noder.length;
  const dist = new Float64Array(n).fill(Infinity);
  const fore = new Int32Array(n).fill(-1);
  const klar = new Uint8Array(n);
  dist[fran] = 0;
  // Binär heap med [avstånd, nod].
  const heap: [number, number][] = [[0, fran]];
  const upp = (i: number) => {
    while (i > 0) {
      const f = (i - 1) >> 1;
      if (heap[f]![0] <= heap[i]![0]) break;
      [heap[f], heap[i]] = [heap[i]!, heap[f]!];
      i = f;
    }
  };
  const ner = (i: number) => {
    for (;;) {
      const l = 2 * i + 1;
      const r = l + 1;
      let m = i;
      if (l < heap.length && heap[l]![0] < heap[m]![0]) m = l;
      if (r < heap.length && heap[r]![0] < heap[m]![0]) m = r;
      if (m === i) break;
      [heap[m], heap[i]] = [heap[i]!, heap[m]!];
      i = m;
    }
  };
  while (heap.length) {
    const [d, u] = heap[0]!;
    const sista = heap.pop()!;
    if (heap.length) {
      heap[0] = sista;
      ner(0);
    }
    if (klar[u]) continue;
    klar[u] = 1;
    if (u === till) break;
    for (const k of noder[u]!.kanter) {
      const nd = d + k.langd * k.vikt;
      if (nd < dist[k.till]!) {
        dist[k.till] = nd;
        fore[k.till] = u;
        heap.push([nd, k.till]);
        upp(heap.length - 1);
      }
    }
  }
  if (fran !== till && fore[till] === -1) return [];
  const vag = [till];
  while (vag[vag.length - 1] !== fran) vag.push(fore[vag[vag.length - 1]!]!);
  return vag.reverse();
}

/**
 * Gångrutt genom stoppen i ordning. Varje stopp knyts till närmaste gatunod. Returnerar
 * punkterna längs rutten och var i punktlistan varje stopp ligger.
 */
export function ruttGenom(
  noder: Nod[],
  stopp: readonly P[],
): { punkter: P[]; stoppIndex: number[]; avvikelse: number[] } {
  const komp = storstaKomponent(noder);
  if (komp.size < 2 || stopp.length < 2) return { punkter: [], stoppIndex: [], avvikelse: [] };
  const noderFor = stopp.map((p) => narmasteNod(noder, komp, p));
  const avvikelse = stopp.map((p, i) => avstand(p, noder[noderFor[i]!]!));
  const punkter: P[] = [];
  const stoppIndex: number[] = [];
  for (let i = 0; i < noderFor.length; i++) {
    if (i === 0) {
      punkter.push({ x: noder[noderFor[0]!]!.x, y: noder[noderFor[0]!]!.y });
      stoppIndex.push(0);
      continue;
    }
    const vag = kortasteVag(noder, noderFor[i - 1]!, noderFor[i]!);
    for (let k = 1; k < vag.length; k++)
      punkter.push({ x: noder[vag[k]!]!.x, y: noder[vag[k]!]!.y });
    stoppIndex.push(punkter.length - 1);
  }
  return { punkter, stoppIndex, avvikelse };
}
