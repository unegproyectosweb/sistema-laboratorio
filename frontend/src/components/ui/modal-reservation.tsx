import { useState } from "react";
import { Button } from "./button";
import CalendarReservation from "./calendar-reservation";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

function ModalReservasion() {
  const [date, setDate] = useState<string>("Selecciona un dia");
  const AvailableHours = [
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
  ];

  const obtainDate = (selectedDate: string): void => {
    setDate(selectedDate);
  };

  //Se usara par verificar la hora que seaa un entero
  const verificationHours = (hour: string) => {
    const isValid = AvailableHours.includes(hour);

    if (isValid) return true;

    alert("Hora no válida, por favor seleccione las horas que se te indican");
    return false;
  };

  return (
    <div className="flex w-full justify-center shadow-black sm:px-4 md:px-0">
      <div className="shadow-4xl h-[750px] w-full overflow-y-auto rounded-lg border border-solid border-gray-300 p-4 shadow-xl md:h-full md:w-auto">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="flex justify-center gap-14">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#0FF48D]"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-[#FF600B]"></div>
                <span>No Disponible</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-center">
                <h2 className="text-center text-3xl font-semibold">
                  Calendario de Reservas
                </h2>
                <p className="w-3/4 text-center text-xl font-light">
                  Selecciona un dia para ver la disponibilidad
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 p-4">
                <CalendarReservation obtainDate={obtainDate} />
                <p className="text-destructive w-3/4 px-2 text-center leading-tight font-semibold">
                  <span>Nota:</span> Las reservas duran 2 horas para dar clases
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-rows-[auto-1fr-auto] gap-4">
            <div className="k h-28 w-96 justify-self-center-safe rounded-lg bg-[#F5F6F6] py-2 text-center shadow-xl">
              <h2 className="text-xl font-semibold">{date}</h2>
              <p className="my-2 text-[#A91515]">
                Horas de Reservas no disponibles
              </p>
              <span className="text-[#A91515]"> 9am - 11 am - 1pm</span>
            </div>

            <div className="flex-col space-y-10">
              <div className="space-y-2">
                <Label className="font-normal">
                  Selecciona la hora a reservar
                </Label>
                <Input id="time" list="horas-disponibles" type="time" />
                <datalist id="horas-disponibles">
                  {AvailableHours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">
                  Escribe una descripcion del motivo de reserva
                </Label>
                <Textarea
                  id="message"
                  placeholder="Escribe por que necesitas reservar este espacio"
                ></Textarea>
              </div>
            </div>

            <div className="order-1 my-2 flex h-9 justify-center gap-4 self-end text-white">
              <Button type="button" variant="secondary">
                Cancelar
              </Button>
              <Button type="button" variant="default">
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ModalReservasion;
