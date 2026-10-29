import { FORETAG } from "@/lib/foretag";

/** "Marketing" i Inter Medium, omgjord till kontur så att inget typsnitt behöver laddas. */
const MARKETING = {
  viewBox: "0 0 253.1 120",
  d: "M23.2 78H28.6V58.6C28.6 55.9 28.4 51.3 28.3 47.5C29.7 51.9 31.1 56.4 32 58.6L39.4 78H44.1L51.5 58.6C52.3 56.4 53.8 51.7 55.1 47.4C55 51.4 54.9 56 54.9 58.6V78H60.4V42H52.2L44.5 62.7C43.8 64.6 42.7 68.6 41.8 71.9C41 68.6 39.9 64.6 39.2 62.7L31.3 42H23.2ZM74.8 78.6C79.1 78.6 81.7 76.4 82.7 74.3H83V78H88.1V60.1C88.1 52.3 81.9 50.6 77.6 50.6C72.8 50.6 68.2 52.5 66.4 57.4L71.4 58.7C72.1 56.8 74.1 55 77.7 55C81 55 82.8 56.7 82.8 59.7V59.9C82.8 61.8 80.8 61.7 76 62.3C70.9 62.9 65.6 64.2 65.6 70.4C65.6 75.7 69.6 78.6 74.8 78.6ZM75.9 74.3C73 74.3 70.8 73 70.8 70.4C70.8 67.7 73.3 66.6 76.3 66.2C77.9 66 82 65.6 82.8 64.8V68.3C82.8 71.4 80.3 74.3 75.9 74.3ZM94.5 78H99.9V61.6C99.9 58 102.6 55.5 106.3 55.5C107.4 55.5 108.7 55.7 109.1 55.8V50.7C108.5 50.7 107.5 50.6 106.8 50.6C103.7 50.6 101 52.4 100 55.3H99.7V51H94.5ZM112.9 78H118.3V68.5L120.8 65.9L130 78H136.5L124.9 62.6L135.8 51H129.4L118.7 62.4H118.3V42H112.9ZM151.5 78.6C157.3 78.6 161.4 75.7 162.7 71.5L157.7 70.3C156.8 72.9 154.5 74.2 151.6 74.2C147.1 74.2 144.1 71.3 143.9 66.1H163.1V64.2C163.1 54.5 157.2 50.6 151 50.6C143.5 50.6 138.6 56.4 138.6 64.7C138.6 73.1 143.5 78.6 151.5 78.6ZM144 62.2C144.3 58.3 146.8 55 151.1 55C155.2 55 157.5 57.9 157.8 62.2ZM179.7 51H174.3V44.6H169V51H165.1V55.3H169V71.1C169 75.7 171.9 78.4 176.8 78.4C178 78.4 179.3 78.2 180.5 77.8L179.5 73.6C178.9 73.7 177.9 73.8 177.3 73.8C175.2 73.8 174.3 72.9 174.3 70.7V55.3H179.7ZM184.3 78H189.6V51H184.3ZM187 46.9C188.8 46.9 190.3 45.5 190.3 43.7C190.3 42 188.8 40.6 187 40.6C185.1 40.6 183.6 42 183.6 43.7C183.6 45.5 185.1 46.9 187 46.9ZM201.3 62C201.3 57.7 204 55.3 207.6 55.3C211.1 55.3 213.3 57.6 213.3 61.5V78H218.6V60.8C218.6 54.2 215 50.6 209.4 50.6C205.6 50.6 202.8 52.4 201.1 56.2L201.1 51H196V78H201.3ZM236.3 88.7C243.3 88.7 248.5 85.5 248.5 78.4V51H243.3V55.4H243C242 53.7 240.1 50.6 235.1 50.6C228.6 50.6 223.8 55.8 223.8 64.4C223.8 73 228.7 77.6 235.1 77.6C240 77.6 241.9 74.9 242.8 73.1H243.3V78.4C243.3 82.5 240.4 84.4 236.3 84.4C232 84.4 230.3 82.3 229.3 80.7L224.9 82.8C226.4 86.1 230.1 88.7 236.3 88.7ZM236.3 73.2C231.7 73.2 229.2 69.6 229.2 64.3C229.2 59.2 231.6 55.2 236.3 55.2C240.9 55.2 243.3 58.9 243.3 64.3C243.3 69.9 240.8 73.2 236.3 73.2Z",
};

/**
 * Loggan: färgkortet med "Tab" (public/logo/tab-chip.svg) och ordet "Marketing".
 * Kortet har egen bakgrund och syns på både ljus och mörk botten; ordet följer textfärgen.
 * Båda delarna är lika höga (120 enheter), så de ligger rätt mot varandra i alla storlekar.
 */
export function Logo({
  ljus = false,
  storlek = "normal",
  className = "",
}: {
  ljus?: boolean;
  /** normal = sidhuvudet, stor = sidfoten. */
  storlek?: "normal" | "stor";
  className?: string;
}) {
  const hojd = storlek === "stor" ? "h-11" : "h-8 sm:h-9";
  return (
    <span
      className={`inline-flex items-center ${hojd} ${ljus ? "text-white" : "text-ink"} ${className}`}
    >
      <img
        src="/logo/tab-chip.svg"
        alt=""
        width={180}
        height={120}
        draggable={false}
        className="h-full w-auto select-none"
      />
      <svg
        viewBox={MARKETING.viewBox}
        aria-hidden="true"
        focusable="false"
        fill="currentColor"
        className="h-full w-auto"
      >
        <path d={MARKETING.d} />
      </svg>
      <span className="sr-only">{FORETAG.namn}</span>
    </span>
  );
}

/**
 * Kornig, suddig färgblob. Förrenderad till en bild (public/blob.webp) i stället för ett
 * levande SVG-filter – filtret räknades om varje gång innehållet runt omkring flyttade sig,
 * vilket gjorde t.ex. den utfällbara listan hackig. Rent dekorativ – döljs för skärmläsare.
 * Storlek och placering styrs med className (t.ex. absolute/relative + bredd).
 */
export function Blob({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none aspect-[5/4] ${className}`}>
      <div className="relative size-full">
        <img
          src="/blob.webp"
          alt=""
          width={1000}
          height={800}
          decoding="async"
          draggable={false}
          className="absolute top-[-30%] left-[-30%] h-[160%] w-[160%] max-w-none select-none"
        />
      </div>
    </div>
  );
}

/** Tunna linjer: en cirkel och två horisontella – korsar blobben och ordbilden. */
export function Linjer({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 400"
      preserveAspectRatio="none"
      className={`pointer-events-none ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      vectorEffect="non-scaling-stroke"
    >
      <line x1="0" y1="62" x2="1000" y2="62" vectorEffect="non-scaling-stroke" />
      <line x1="0" y1="338" x2="1000" y2="338" vectorEffect="non-scaling-stroke" />
      <ellipse cx="650" cy="200" rx="290" ry="196" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
