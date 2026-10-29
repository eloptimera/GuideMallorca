import { useEffect, useRef, type ReactNode } from "react";

/**
 * Bild som svävar: den guppar sakta upp och ner och lutar sig i 3D mot muspekaren.
 * På pekskärmar och med "minska rörelse" blir det bara den lugna svävningen (eller ingenting).
 */
export function SvavandeBild({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fin = window.matchMedia("(hover: hover) and (pointer: fine)");
    const lugn = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fin.matches || lugn.matches) return;

    let mal = { x: 0, y: 0 };
    let nu = { x: 0, y: 0 };
    let ram = 0;

    const tick = () => {
      nu = { x: nu.x + (mal.x - nu.x) * 0.08, y: nu.y + (mal.y - nu.y) * 0.08 };
      el.style.setProperty("--lut-x", `${(nu.y * -7).toFixed(2)}deg`);
      el.style.setProperty("--lut-y", `${(nu.x * 9).toFixed(2)}deg`);
      el.style.setProperty("--glans-x", `${(50 + nu.x * 40).toFixed(1)}%`);
      el.style.setProperty("--glans-y", `${(30 + nu.y * 40).toFixed(1)}%`);
      if (Math.abs(mal.x - nu.x) + Math.abs(mal.y - nu.y) > 0.001)
        ram = requestAnimationFrame(tick);
      else ram = 0;
    };
    const starta = () => {
      if (!ram) ram = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      // Räkna från bildens mitt, men låt den reagera även när pekaren är en bit utanför.
      mal = {
        x: Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width * 0.9))),
        y: Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height * 0.9))),
      };
      starta();
    };
    const onLeave = () => {
      mal = { x: 0, y: 0 };
      starta();
    };

    const yta = el.closest("section") ?? el;
    yta.addEventListener("pointermove", onMove as EventListener);
    yta.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(ram);
      yta.removeEventListener("pointermove", onMove as EventListener);
      yta.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={ref} className="svava">
      <div className="svava__gupp">
        <div className="svava__kort">
          {children}
          <span className="svava__glans" aria-hidden="true" />
        </div>
      </div>
      <span className="svava__skugga" aria-hidden="true" />
    </div>
  );
}
