import { useRef, type MouseEvent } from "react";

export type Fraga = { fraga: string; svar: string };

/**
 * Vanliga frågor som fäll-ut-listor. Bygger på <details>, så de fungerar utan JavaScript och
 * med tangentbord; JavaScript lägger bara till en mjuk öppna/stäng-animation.
 */
export function VanligaFragor({ fragor }: { fragor: readonly Fraga[] }) {
  return (
    <div className="faq">
      {fragor.map((f) => (
        <FragaRad key={f.fraga} {...f} />
      ))}
    </div>
  );
}

function FragaRad({ fraga, svar }: Fraga) {
  const ref = useRef<HTMLDetailsElement>(null);

  function vaxla(e: MouseEvent) {
    const el = ref.current;
    const innehall = el?.querySelector<HTMLElement>(".faq__svar");
    if (!el || !innehall || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    e.preventDefault();
    const oppna = !el.open;
    if (oppna) el.open = true;
    const hojd = innehall.scrollHeight;
    const anim = innehall.animate(
      [
        { height: oppna ? "0px" : `${hojd}px`, opacity: oppna ? 0 : 1 },
        { height: oppna ? `${hojd}px` : "0px", opacity: oppna ? 1 : 0 },
      ],
      { duration: 280, easing: "cubic-bezier(0.33, 1, 0.68, 1)" },
    );
    // Under stängningen är <details> fortfarande öppen; markera det så att ikonen vänder direkt.
    el.toggleAttribute("data-stanger", !oppna);
    anim.onfinish = () => {
      if (!oppna) el.open = false;
      el.removeAttribute("data-stanger");
    };
  }

  return (
    <details ref={ref} className="faq__rad">
      <summary onClick={vaxla}>
        <span>{fraga}</span>
        <span className="faq__ikon" aria-hidden="true" />
      </summary>
      <div className="faq__svar">
        <p>{svar}</p>
      </div>
    </details>
  );
}
