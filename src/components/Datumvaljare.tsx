import { useState } from "react";
import { format, startOfToday } from "date-fns";
import { enGB as datumEn, es as datumEs, sv as datumSv } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";
import { enGB, es, sv } from "react-day-picker/locale";
import { TEXTER, type Sprak } from "@/lib/sprak";

const DATUM_LOCALE = { sv: datumSv, en: datumEn, es: datumEs } as const;
const KALENDER_LOCALE = { sv, en: enGB, es } as const;
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Datumfält som öppnar en kalender. Dagar som redan har varit går inte att välja.
 * `onChange` får datumet som läsbar svensk text ("fredag 14 maj 2027") – det är så det står i
 * mejlet till Caroline – eller "" när det rensas. Fältet och kalendern visas på besökarens språk.
 */
export function Datumvaljare({
  id,
  sprak,
  onChange,
}: {
  id: string;
  sprak: Sprak;
  onChange: (text: string) => void;
}) {
  const t = TEXTER[sprak].formular;
  const lokal = DATUM_LOCALE[sprak];
  const [valt, setValt] = useState<Date | undefined>();
  const [oppen, setOppen] = useState(false);

  function valj(d: Date | undefined) {
    setValt(d);
    onChange(d ? format(d, "EEEE d MMMM yyyy", { locale: datumSv }) : "");
    if (d) setOppen(false);
  }

  return (
    <Popover open={oppen} onOpenChange={setOppen}>
      <div className="datum">
        <PopoverTrigger asChild>
          <button
            id={id}
            type="button"
            className="datum__knapp"
            data-tom={valt ? undefined : ""}
            aria-label={
              valt ? `${t.datum}: ${format(valt, "PPP", { locale: lokal })}` : t.valjDatum
            }
          >
            <CalendarDays aria-hidden="true" className="datum__ikon" />
            <span>{valt ? format(valt, "PP", { locale: lokal }) : t.valjDatum}</span>
          </button>
        </PopoverTrigger>
        {valt && (
          <button
            type="button"
            className="datum__rensa"
            onClick={() => valj(undefined)}
            aria-label={t.rensaDatum}
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      <PopoverContent className="datum__ruta" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          locale={KALENDER_LOCALE[sprak]}
          selected={valt}
          onSelect={valj}
          defaultMonth={valt ?? startOfToday()}
          disabled={{ before: startOfToday() }}
          startMonth={startOfToday()}
          className="bg-transparent [--cell-size:2.4rem]"
          // Dagens datum markeras diskret; bara det valda datumet blir blått.
          classNames={{ today: "datum__idag" }}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
