import * as Accordion from "@radix-ui/react-accordion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { FORETAG } from "@/lib/foretag";
import { kr } from "@/lib/priser";
import { tjanstOppnad } from "@/lib/sparning";
import { avstava } from "@/lib/text";
import { hittaTjanst, OMRADEN, tjanstSokvag, type Delomrade, type Tjanst } from "@/lib/tjanster";

const LUTNING = ["-rotate-[1.4deg]", "rotate-[1.1deg]", "rotate-[0.8deg]", "-rotate-[1deg]"];

function Svarighet({ niva }: { niva: Tjanst["svarighet"] }) {
  return (
    <span className="flex items-center gap-2" aria-label={`Svårighet att göra själv: ${niva} av 5`}>
      <span className="text-[0.7rem] font-bold tracking-[0.14em] text-muted-foreground uppercase sm:hidden lg:inline">
        Göra själv
      </span>
      <span className="flex gap-1" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`size-2.5 rounded-full ${n <= niva ? "bg-ink" : "border border-ink/30"}`}
          />
        ))}
      </span>
    </span>
  );
}

/** "Gör det själv" mot "Med oss" för en tjänst. Används här och på tjänstesidorna. */
export function SjalvMotOss({ o }: { o: Pick<Tjanst, "sjalv" | "medOss"> }) {
  return (
    <div className="grid items-center gap-5 lg:grid-cols-[1fr_auto_1fr] lg:gap-6">
      {/* Gör det själv */}
      <div className="skylt h-full p-6 sm:p-8">
        <p className="text-[0.7rem] font-bold tracking-[0.18em] text-guld-mork uppercase">
          Gör det själv · det blir ett extrajobb
        </p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {o.sjalv.map((s, i) => (
            <li
              key={s}
              className={`bg-[#fbf8f1] p-4 text-[0.95rem] leading-snug text-ink shadow-[2px_3px_0_rgb(30_20_5/0.08)] outline outline-1 outline-guld/30 ${LUTNING[i % LUTNING.length]}`}
            >
              {s}
            </li>
          ))}
        </ul>
        <p className="mt-6 inline-block font-bold text-ink underline decoration-guld decoration-2 underline-offset-[6px]">
          Och det tar tid från det ni egentligen ska göra.
        </p>
      </div>

      <span
        aria-hidden="true"
        className="mx-auto grid size-14 rotate-90 place-items-center rounded-full border border-guld bg-background text-guld-mork lg:rotate-0"
      >
        <ArrowRight className="size-6" />
      </span>

      {/* Med oss */}
      <div className="inramad h-full p-6 text-elfenben sm:p-8">
        <p className="text-[0.7rem] font-bold tracking-[0.18em] text-white/80 uppercase">
          Med {FORETAG.kortnamn} · det bara händer
        </p>
        <ol className="relative mt-6 space-y-4">
          <span
            aria-hidden="true"
            className="absolute top-5 bottom-5 left-[1.1rem] w-px bg-white/40"
          />
          {o.medOss.map((m) => (
            <li key={m} className="relative flex items-center gap-4">
              <span className="grid size-9 shrink-0 place-items-center rounded-full text-guld border border-guld">
                <Check className="size-4" strokeWidth={3} aria-hidden="true" />
              </span>
              <span className="font-bold">{m}</span>
            </li>
          ))}
        </ol>
        <p className="mt-7 inline-block -rotate-[1.2deg] border border-guld/70 px-5 py-2.5 text-sm font-bold text-sun">
          Ni godkänner. Vi gör resten.
        </p>
      </div>
    </div>
  );
}

function Innehall({ o }: { o: Tjanst | Delomrade }) {
  const del = "ingarI" in o;
  const lank = del ? hittaTjanst(o.ingarI) : o;
  return (
    <div className="px-5 pb-6 sm:px-8 sm:pb-8">
      <p className="max-w-3xl text-lg leading-relaxed text-ink/80">{o.forklaring}</p>
      <div className="mt-8">
        <SjalvMotOss o={o} />
      </div>
      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        {del ? (
          <p className="font-bold text-ink">{o.ingarText}</p>
        ) : (
          <p className="text-ink/80">
            {o.pris.avser}:{" "}
            <span className="font-display text-xl text-ink">
              {o.pris.fran ? "från " : ""}
              {kr(o.pris.belopp)}
              {o.pris.manad ? "/mån" : ""}
            </span>{" "}
            <span className="text-sm text-muted-foreground">exkl. moms</span>
          </p>
        )}
        <Link to={tjanstSokvag(lank?.slug ?? o.slug)} className="btn-base btn-outline">
          Läs mer om {avstava(lank?.iText ?? o.iText)}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

/** Utfällbar lista: vad som krävs för att lyckas digitalt, själv kontra med oss. */
export function LyckasDigitalt() {
  const rot = useRef<HTMLDivElement>(null);
  const [oppen, setOppen] = useState("seo");

  // När en rad ovanför stängs samtidigt som en ny öppnas glider den klickade raden uppåt
  // under fingret, vilket upplevs som hack. Vi håller kvar den klickade raden på samma
  // plats på skärmen medan animationen pågår.
  function byt(nytt: string) {
    if (nytt) tjanstOppnad(nytt);
    const id = nytt || oppen;
    const rad = rot.current?.querySelector<HTMLElement>(`[data-omrade="${id}"]`);
    const start = rad?.getBoundingClientRect().top;
    setOppen(nytt);
    if (!rad || start === undefined) return;
    const slut = performance.now() + 450;
    const folj = () => {
      const diff = rad.getBoundingClientRect().top - start;
      if (Math.abs(diff) > 0.5) window.scrollBy({ top: diff, behavior: "instant" });
      if (performance.now() < slut) requestAnimationFrame(folj);
    };
    requestAnimationFrame(folj);
  }

  return (
    <Accordion.Root
      ref={rot}
      type="single"
      collapsible
      value={oppen}
      onValueChange={byt}
      className="grid gap-3 [overflow-anchor:none]"
    >
      {OMRADEN.map((o, i) => (
        <Accordion.Item
          key={o.slug}
          value={o.slug}
          data-omrade={o.slug}
          className="skylt overflow-hidden"
        >
          <Accordion.Header className="font-sans leading-normal font-normal tracking-normal">
            <Accordion.Trigger className="group flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left sm:gap-6 sm:px-8 sm:py-6">
              <span
                className="hidden font-display text-2xl text-ink/55 sm:inline"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="grid size-12 shrink-0 place-items-center rounded-full text-guld-mork border border-guld">
                <o.ikon className="size-5" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-2xl leading-tight tracking-[-0.015em] text-ink sm:text-3xl">
                  {avstava(o.titel)}
                </span>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground sm:text-base">
                  {o.vad}
                </span>
                <span className="mt-2.5 block sm:hidden">
                  <Svarighet niva={o.svarighet} />
                </span>
              </span>
              <span className="hidden sm:block">
                <Svarighet niva={o.svarighet} />
              </span>
              <span className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink text-ink transition-[transform,background-color,color] duration-300 group-hover:bg-ink group-hover:text-white group-data-[state=open]:rotate-45 group-data-[state=open]:bg-ink group-data-[state=open]:text-white">
                <Plus className="size-5" aria-hidden="true" />
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden [--tw-animation-duration:280ms] [--tw-ease:cubic-bezier(0.22,1,0.36,1)] data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
            <Innehall o={o} />
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
