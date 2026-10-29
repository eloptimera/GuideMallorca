import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BokaKnapp } from "@/components/Boka";
import { Logo } from "@/components/Brand";
import { FORETAG } from "@/lib/foretag";

const LANKAR = [
  { to: "/tjanster", label: "Tjänster" },
  { to: "/priser", label: "Priser" },
  { to: "/guider", label: "Resurser" },
  { to: "/om-oss", label: "Om oss" },
  { to: "/kontakt", label: "Kontakt" },
] as const;

const LANK_BAS =
  "caps px-4 py-3 !tracking-[0.16em] whitespace-nowrap transition-colors duration-200";
const LANK_MORK = `${LANK_BAS} text-ink/70 hover:text-ink`;
const LANK_LJUS = `${LANK_BAS} text-white/75 hover:text-white`;
const AKTIV_MORK = "text-ink underline decoration-ink decoration-1 underline-offset-[10px]";
const AKTIV_LJUS = "text-white underline decoration-white decoration-1 underline-offset-[10px]";

function Lank({
  to,
  label,
  onClick,
  ljus = false,
}: {
  to: string;
  label: string;
  onClick?: () => void;
  ljus?: boolean;
}) {
  const bas = ljus ? LANK_LJUS : LANK_MORK;
  return (
    <Link
      to={to}
      onClick={onClick}
      activeOptions={{ exact: false }}
      className={bas}
      activeProps={{
        className: `${bas} ${ljus ? AKTIV_LJUS : AKTIV_MORK}`,
        "aria-current": "page",
      }}
    >
      {label}
    </Link>
  );
}

export function Header() {
  const [oppen, setOppen] = useState(false);

  // Högst upp: helt transparent och full bredd. Efter scroll: en flytande svart pill
  // som lossnar från kanten, så menyn aldrig krockar med innehållet under den.
  // Pillen flyttas med transform (inte margin) – headerns höjd ändras aldrig, så sidan hoppar inte.
  const [scrollad, setScrollad] = useState(false);
  useEffect(() => {
    const kolla = () => setScrollad(window.scrollY > 24);
    kolla();
    window.addEventListener("scroll", kolla, { passive: true });
    return () => window.removeEventListener("scroll", kolla);
  }, []);

  useEffect(() => {
    if (!oppen) return;
    const stang = (e: KeyboardEvent) => e.key === "Escape" && setOppen(false);
    window.addEventListener("keydown", stang);
    return () => window.removeEventListener("keydown", stang);
  }, [oppen]);

  return (
    <header className="sticky top-0 z-50">
      <a
        href="#innehall"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-ink"
      >
        Hoppa till innehållet
      </a>
      <div
        className={`relative mx-auto flex h-[4.5rem] items-center justify-between transition-[max-width,background-color,border-radius,transform,box-shadow,padding] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          scrollad
            ? "max-w-[min(80rem,calc(100%-1.5rem))] translate-y-3 rounded-full bg-ink px-5 shadow-[0_18px_40px_-18px_rgba(16,17,20,0.55)] sm:px-8"
            : "max-w-[88rem] translate-y-0 rounded-none bg-transparent px-6 sm:px-10"
        }`}
      >
        <Link to="/" aria-label={`${FORETAG.namn} – startsida`} onClick={() => setOppen(false)}>
          <Logo ljus={scrollad} className="transition-colors duration-300" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Huvudmeny">
          {LANKAR.map((l) => (
            <Lank key={l.to} {...l} ljus={scrollad} />
          ))}
          <BokaKnapp
            variant={scrollad ? "white" : "dark"}
            className="ml-4 min-h-11 px-6 py-2 text-sm"
          />
        </nav>

        {/* Mobil: bokningsknappen syns alltid, inte bara inne i menyn */}
        <div className="flex items-center gap-2 lg:hidden">
          <BokaKnapp
            variant={scrollad ? "white" : "dark"}
            className="min-h-11 px-4 py-2 text-sm"
            onClick={() => setOppen(false)}
          >
            Boka
            <span className="sr-only"> gratis genomgång</span>
          </BokaKnapp>
          <button
            type="button"
            aria-label={oppen ? "Stäng meny" : "Öppna meny"}
            aria-expanded={oppen}
            aria-controls="mobilmeny"
            onClick={() => setOppen((o) => !o)}
            className={`grid size-11 place-items-center rounded-full transition-colors duration-300 ${
              scrollad ? "bg-white/12 text-white" : "bg-tint text-ink"
            }`}
          >
            {oppen ? (
              <X className="size-5" aria-hidden="true" />
            ) : (
              <Menu className="size-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {oppen && (
          <nav
            id="mobilmeny"
            aria-label="Mobilmeny"
            className="absolute inset-x-4 top-full mt-2 flex flex-col gap-1 rounded-[1.75rem] bg-white p-3 shadow-xl shadow-ink/15 lg:hidden"
          >
            {LANKAR.map((l) => (
              <Lank key={l.to} {...l} onClick={() => setOppen(false)} />
            ))}
            <BokaKnapp className="mt-1" onClick={() => setOppen(false)} />
          </nav>
        )}
      </div>
    </header>
  );
}
