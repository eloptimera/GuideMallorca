import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Ringar in innehållet med en handritad, svart tuschlinje som ritas fram när den
 * syns i bild. Linjen är rent dekorativ och döljs för skärmläsare.
 */
export function Tusch({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [synlig, setSynlig] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) {
          setSynlig(true);
          obs.disconnect();
        }
      },
      { threshold: 0.6 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 300 120"
        preserveAspectRatio="none"
        fill="none"
        className="pointer-events-none absolute -top-[30%] -left-[4%] h-[164%] w-[108%] overflow-visible text-ink"
      >
        <path
          pathLength={1}
          className={`tusch-linje ${synlig ? "tusch-in" : ""}`}
          d="M150 7C232 5 294 27 294 59C294 92 236 114 151 114C66 114 6 94 6 60C6 27 63 7 142 8C170 8 192 11 210 16"
          stroke="currentColor"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </span>
  );
}
