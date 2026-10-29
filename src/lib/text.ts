// Långa svenska sammansättningar i stora rubriker bryts annars mitt i ordet utan bindestreck
// ("Marknadsföringsb / ilder"). Mjuka bindestreck (­) syns bara om ordet faktiskt måste
// delas, och då på rätt ställe: "Marknads- / föringsbilder".
const AVSTAVNING: readonly [RegExp, string][] = [
  [/arknadsföringsbilder/g, "arknads­förings­bilder"],
  [/arknadsföringsbyrå/g, "arknads­förings­byrå"],
  [/emsideoptimering/g, "emside­optimering"],
  [/emsideförbättringar/g, "emside­förbättringar"],
  [/ökmotoroptimering/g, "ökmotor­optimering"],
  [/öretagshemsida/g, "öretags­hemsida"],
];

/** Lägger in mjuka bindestreck i kända långa ord. Bara för visning – inte i metadata. */
export function avstava(text: string): string {
  return AVSTAVNING.reduce((t, [monster, ersattning]) => t.replace(monster, ersattning), text);
}
