import { createFileRoute, Link } from "@tanstack/react-router";
import { Mark, PageHero } from "@/components/Heading";
import { sidhuvud } from "@/lib/seo";

// Visas efter att bokningsformuläret skickats. Besök här = en bokning i statistiken.
// Sidan ska inte synas i sökresultat och står inte i sitemap.xml.
export const Route = createFileRoute("/tack")({
  head: () => {
    const h = sidhuvud({
      titel: "Tack för er förfrågan",
      beskrivning: "Vi har fått er förfrågan och hör av oss för att boka en tid.",
      sokvag: "/tack",
    });
    return { ...h, meta: [...h.meta, { name: "robots", content: "noindex" }] };
  },
  component: Tack,
});

function Tack() {
  return (
    <PageHero
      tavla={{ src: "/fyr/fyr-hog.webp", bredd: 940, hojd: 1672 }}
      eyebrow="Tack"
      title={
        <>
          Tack – vi <Mark>hör av oss</Mark>
        </>
      }
      intro="Vi har fått er förfrågan och hör av oss inom en arbetsdag för att boka en tid för den kostnadsfria genomgången."
    >
      <Link to="/" className="btn-base btn-dark">
        Till startsidan
      </Link>
      <Link to="/tjanster" className="btn-base btn-outline">
        Läs om våra tjänster
      </Link>
    </PageHero>
  );
}
