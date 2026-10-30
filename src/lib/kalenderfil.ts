// "Lägg till i kalendern": länk till Google Kalender och en .ics-fil för Apple, Outlook m.fl.
// Evenemangens tider anges i Mallorca-tid (Europe/Madrid) och räknas om till UTC här.
import type { Aktivitet } from "@/lib/innehall";

const TIDSZON = "Europe/Madrid";

/** Lokal tid på Mallorca → UTC, med rätt sommar-/vintertid för just det datumet. */
function tillUtc(datum: string, tid: string): Date {
  const [ar, man, dag] = datum.split("-").map(Number);
  const [h, m] = tid.split(":").map(Number);
  const gissning = Date.UTC(ar!, man! - 1, dag!, h!, m!);
  const namn = new Intl.DateTimeFormat("en-US", { timeZone: TIDSZON, timeZoneName: "longOffset" })
    .formatToParts(new Date(gissning))
    .find((d) => d.type === "timeZoneName")?.value; // "GMT+01:00"
  const traff = namn?.match(/GMT([+-])(\d{2}):(\d{2})/);
  const forskjutning = traff
    ? (traff[1] === "-" ? -1 : 1) * (Number(traff[2]) * 60 + Number(traff[3]))
    : 60;
  return new Date(gissning - forskjutning * 60_000);
}

const utcText = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

function tider(a: Aktivitet) {
  const start = tillUtc(a.datum, a.tid);
  const slut = new Date(start.getTime() + a.minuter * 60_000);
  return { start: utcText(start), slut: utcText(slut) };
}

export function googleKalenderLank(a: Aktivitet, titel: string, text: string, plats: string) {
  const { start, slut } = tider(a);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: titel,
    dates: `${start}/${slut}`,
    details: text,
    location: plats,
    ctz: TIDSZON,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

const ics = (t: string) =>
  t
    .replace(/\\/g, "\\\\")
    .replace(/([,;])/g, "\\$1")
    .replace(/\n/g, "\\n");

/** Laddar ner evenemanget som .ics (fungerar i Apple Kalender, Outlook och de flesta andra). */
export function laddaNerIcs(a: Aktivitet, titel: string, text: string, plats: string) {
  const { start, slut } = tider(a);
  const nu = utcText(new Date());
  const innehall = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Shoot for the Moon//SV",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${a.id}@shootforthemoon.se`,
    `DTSTAMP:${nu}`,
    `DTSTART:${start}`,
    `DTEND:${slut}`,
    `SUMMARY:${ics(titel)}`,
    `DESCRIPTION:${ics(text)}`,
    `LOCATION:${ics(plats)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([innehall], { type: "text/calendar;charset=utf-8" }));
  const lank = document.createElement("a");
  lank.href = url;
  lank.download = `${a.id}.ics`;
  document.body.appendChild(lank);
  lank.click();
  lank.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
