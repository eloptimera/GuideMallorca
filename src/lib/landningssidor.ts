// Alla landningssidor (/hemsida-foretag, /seo-byra …). Härifrån får /guider (Resurser) sina
// kort, sitemap.xml sina adresser och llms.txt sina länkar och frågor.
//
// REGEL: en sida per sökavsikt. Innan en ny landningssida byggs – kolla om en befintlig sida
// redan svarar på samma fråga (t.ex. "webbyrå" = /hemsida-foretag, "SEO-konsult" och "SEO för
// småföretag" = /seo-byra). Bygg i så fall ut den sidan i stället. Inga stadssidor
// ("webbyrå Göteborg" osv.): TAB riktar sig till hela Sverige. Se projektdokumentet
// claude/sajtstruktur.md.
//
// Ny landningssida: lägg till den här. Då händer resten av sig själv –
//  - FramtidaLank-länkar som pekar på adressen blir riktiga länkar,
//  - ersätter den en tjänst (`tjanst`) omdirigeras /tjanster/{slug} dit (301) och alla
//    interna länkar till tjänsten går direkt till landningssidan.
import { HEMSIDA_FORETAG, HEMSIDA_FRAGOR } from "@/lib/hemsida-foretag";
import { HEMSIDA_PRIS, HEMSIDA_PRIS_FRAGOR } from "@/lib/hemsida-pris";
import { LOKAL_FRAGOR, LOKAL_SEO } from "@/lib/lokal-seo";
import { GEO_FRAGOR, GEO_OPTIMERING } from "@/lib/geo-optimering";
import { META_ADS_BYRA, META_FRAGOR } from "@/lib/meta-ads-byra";
import { GOTEBORG_FRAGOR, WEBBYRA_GOTEBORG } from "@/lib/webbyra-goteborg";
import { MODERNISERA_FRAGOR, MODERNISERA_HEMSIDA } from "@/lib/modernisera-hemsida";
import type { Fraga } from "@/lib/priser";
import { SEO_BYRA, SEO_FRAGOR } from "@/lib/seo-byra";
import { SOKMOTOROPTIMERING, SOKMOTOROPTIMERING_FRAGOR } from "@/lib/sokmotoroptimering";

export type Landningssida = {
  sokvag: string;
  /** Kort namn i listor, brödsmulor och sitemap. */
  titel: string;
  /** Liten etikett på kortet under /guider. */
  etikett: string;
  /** Sidans titel i sökresultat, utan företagsnamn (läggs till automatiskt). */
  seoTitel: string;
  /** Max ca 155 tecken. */
  seoBeskrivning: string;
  /** Text på kortet under /guider. */
  kortText: string;
  publicerad: string;
  uppdaterad: string;
  fragor: readonly Fraga[];
  /** Tjänsten (slug i tjanster.ts) som sidan ersätter, om någon. */
  tjanst?: string;
};

export const LANDNINGSSIDOR: readonly Landningssida[] = [
  { ...SOKMOTOROPTIMERING, fragor: SOKMOTOROPTIMERING_FRAGOR },
  { ...SEO_BYRA, fragor: SEO_FRAGOR, tjanst: "seo" },
  { ...LOKAL_SEO, fragor: LOKAL_FRAGOR },
  { ...GEO_OPTIMERING, fragor: GEO_FRAGOR, tjanst: "geo" },
  { ...HEMSIDA_FORETAG, fragor: HEMSIDA_FRAGOR, tjanst: "hemsida" },
  { ...HEMSIDA_PRIS, fragor: HEMSIDA_PRIS_FRAGOR },
  { ...WEBBYRA_GOTEBORG, fragor: GOTEBORG_FRAGOR },
  { ...MODERNISERA_HEMSIDA, fragor: MODERNISERA_FRAGOR, tjanst: "hemsideoptimering" },
  { ...META_ADS_BYRA, fragor: META_FRAGOR, tjanst: "meta-annonser" },
];

export function hittaLandningssida(sokvag: string): Landningssida | undefined {
  return LANDNINGSSIDOR.find((l) => l.sokvag === sokvag);
}

export function landningssidaForTjanst(slug: string): Landningssida | undefined {
  return LANDNINGSSIDOR.find((l) => l.tjanst === slug);
}
