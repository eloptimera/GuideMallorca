import { useState } from "react";
import { format, startOfToday } from "date-fns";
import { sv as datumSv } from "date-fns/locale";
import { CalendarDays, X } from "lucide-react";
import { sv } from "react-day-picker/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

/**
 * Datumfält som öppnar en kalender. Dagar som redan har varit går inte att välja.
 * `onChange` får datumet som läsbar text ("fredag 14 maj 2027"), eller "" när det rensas.
 */
export function Datumvaljare({ id, onChange }: { id: string; onChange: (text: string) => void }) {
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
              valt
                ? `Önskat datum: ${format(valt, "d MMMM yyyy", { locale: datumSv })}`
                : "Välj datum"
            }
          >
            <CalendarDays aria-hidden="true" className="datum__ikon" />
            <span>{valt ? format(valt, "d MMM yyyy", { locale: datumSv }) : "Välj datum"}</span>
          </button>
        </PopoverTrigger>
        {valt && (
          <button
            type="button"
            className="datum__rensa"
            onClick={() => valj(undefined)}
            aria-label="Rensa datum"
          >
            <X aria-hidden="true" />
          </button>
        )}
      </div>
      <PopoverContent className="datum__ruta" align="start" sideOffset={8}>
        <Calendar
          mode="single"
          locale={sv}
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
