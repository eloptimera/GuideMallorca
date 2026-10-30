import { SPRAK, SPRAKKOD, TEXTER, sprakSokvag, type Sprak } from "@/lib/sprak";

/** Flaggor som runda SVG:er (inga bilder att ladda). */
function Flagga({ sprak }: { sprak: Sprak }) {
  if (sprak === "sv") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" fill="#006aa7" />
        <rect x="9" width="5" height="32" fill="#fecc00" />
        <rect y="13.5" width="32" height="5" fill="#fecc00" />
      </svg>
    );
  }
  if (sprak === "es") {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" fill="#aa151b" />
        <rect y="8" width="32" height="16" fill="#f1bf00" />
      </svg>
    );
  }
  // Storbritannien
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" fill="#012169" />
      <path d="M0 0 32 32M32 0 0 32" stroke="#fff" strokeWidth="6" />
      <path d="M0 0 32 32M32 0 0 32" stroke="#c8102e" strokeWidth="2.4" />
      <path d="M16 0v32M0 16h32" stroke="#fff" strokeWidth="9" />
      <path d="M16 0v32M0 16h32" stroke="#c8102e" strokeWidth="5" />
    </svg>
  );
}

/** Språkval uppe till höger: tre flaggor, där den aktiva är markerad. */
export function Sprakvaljare({
  sprak,
  sokvagFor = sprakSokvag,
  inbyggd = false,
}: {
  sprak: Sprak;
  /** Inuti toppmenyn i stället för fast uppe till höger. */
  inbyggd?: boolean;
  /** Vart varje flagga leder. Standard: startsidan på det språket. */
  sokvagFor?: ((s: Sprak) => string) | undefined;
}) {
  return (
    <nav
      className={inbyggd ? "sprakval sprakval--inbyggd" : "sprakval"}
      aria-label={TEXTER[sprak].sprakval}
    >
      {SPRAK.map((s) => (
        <a
          key={s}
          href={sokvagFor(s)}
          hrefLang={SPRAKKOD[s].html}
          lang={SPRAKKOD[s].html}
          className="sprakval__flagga"
          aria-current={s === sprak ? "true" : undefined}
          aria-label={SPRAKKOD[s].namn}
          title={SPRAKKOD[s].namn}
        >
          <Flagga sprak={s} />
        </a>
      ))}
    </nav>
  );
}
