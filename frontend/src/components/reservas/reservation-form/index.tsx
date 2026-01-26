/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDate } from "date-fns";
import { useEffect, useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import CalendarReservation from "../calendar-reservation";
import { reservationFormSchema, type ReservationFormValues } from "./schema";
import { setErrorFromServer } from "@/lib/api";
import postReservation from "./PostReservation";

export interface ModalReservasionProps {
  availableHours: string[];
  availableLaboratory: {
    id: number;
    name: string;
    active: boolean;
    number: number;
  }[];
  stateTypeEvent: {
    id: number;
    name: string;
    minimalAnticipation: number;
    blockDuration: number;
    priority: number;
    needsApproval: boolean;
  }[];
  reserved: {
    startDate: string;
    defaultStartTime: string;
  }[];
}

function ReservationForm({
  reserved,
  availableHours,
  availableLaboratory,
  stateTypeEvent,
}: ModalReservasionProps) {
  const navigate = useNavigate();
  const formId = useId();
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema as any),
  });
  const [load, setLoad] = useState(false);
  const { register, handleSubmit, formState, setError, control, trigger } =
    form;
  const { errors } = formState;
  const [stepsView, setStepsView] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const dateValue = useWatch({ control, name: "date" });

  const handleNextStep = async () => {
    const fieldsStep1: any[] = [
      "date",
      "start_time",
      "end_time",
      "laboratorio",
      "type_event",
      "description",
    ];

    const isValid = await trigger(fieldsStep1);

    if (isValid) {
      setStepsView(true);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(async (data) => {
        setLoad(true);
        const authDataRaw = localStorage.getItem("auth");
        const authData = JSON.parse(authDataRaw as string);
        const userId = authData.state.user.id;

        for (const reserve of reserved) {
          if (reserve.startDate === data.date.toISOString().split("T")[0]) {
            if (reserve.defaultStartTime === data.start_time + ":00") {
              alert(
                `Selecciona otra hora de reserva aparte de ${reserve.defaultStartTime.slice(0, 5)}`,
              );
              setLoad(false);
              return;
            }
          }
        }

        try {
          const sendData = {
            userId: userId,
            name: data.description,
            startDate: data.date.toISOString().split("T")[0],
            endDate: data.dateFinally.toISOString().split("T")[0],
            rrule: null,
            defaultStartTime: data.start_time + ":00",
            defaultEndTime: data.end_time + ":00",
            laboratoryId: Number(data.laboratorio),
            stateId: 1, //estado en PROCESO
            typeId: Number(data.type_event),
          };
          await postReservation(sendData);

          setSendSuccess(true);
          alert("Registro de reserva exitoso");
        } catch (error) {
          setErrorFromServer(setError, error);
          console.log(error);
          return;
        } finally {
          setLoad(false);
          navigate("/reservas");
        }
      })}
      className="p-4 md:h-full md:w-auto"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[400px_1fr]">
        <div className="flex flex-col justify-center gap-2">
          <div className={`${stepsView && "hidden"}`}>
            {/* <div className="flex justify-center gap-14">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 rounded-full bg-[#0FF48D]"></div>
                <span>Disponible</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-4 w-4 rounded-full bg-[#FF600B]"></div>
                <span>No Disponible</span>
              </div>
            </div> */}
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-center">
                <h2 className="text-center text-xl font-bold">
                  Calendario de Reservas
                </h2>
                <p className="text-center">
                  Selecciona un dia para ver la disponibilidad
                </p>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 p-4">
                <Controller
                  control={control}
                  name="date"
                  render={({ field }) => (
                    <CalendarReservation
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                      }}
                    />
                  )}
                />
                <FieldError>{errors.date?.message}</FieldError>
                <p className="text-destructive px-2 text-center leading-tight font-semibold text-pretty">
                  <span>Nota:</span> Las reservas tienen una duración de 2 horas
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${!stepsView && "hidden"} flex h-full flex-col justify-center`}
          >
            <div className="flex flex-col gap-2">
              <div className="flex flex-col items-center">
                <h2 className="px-8 text-center text-4xl sm:w-[20rem] sm:px-0 sm:text-2xl">
                  Selecciona la fecha de finalizacion de reserva
                </h2>
              </div>
              <div className="flex flex-col items-center justify-center gap-4 p-4">
                <Controller
                  control={control}
                  name="dateFinally"
                  render={({ field }) => (
                    <CalendarReservation
                      selected={field.value}
                      onSelect={(date) => {
                        field.onChange(date);
                      }}
                    />
                  )}
                />
                <FieldError className="text-center">
                  {errors.dateFinally?.message}
                </FieldError>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-4">
          <div className="w-96 self-center rounded-lg border bg-zinc-50 p-5 text-center shadow-md">
            <h2 className="text-xl font-semibold">
              {dateValue
                ? "Seleccionaste " + formatDate(dateValue, "d 'de' MMMM yyyy")
                : "Selecciona una fecha"}
            </h2>
            {dateValue !== undefined &&
              (reserved.length > 0 ? (
                (() => {
                  const filteredByDate = reserved.filter(
                    (res) =>
                      dateValue.toISOString().split("T")[0] === res.startDate,
                  );
                  const uniqueHours = [
                    ...new Map(
                      filteredByDate.map((item) => [
                        item.defaultStartTime,
                        item,
                      ]),
                    ).values(),
                  ];

                  return uniqueHours.length > 0 ? (
                    <>
                      <p className="font-bold text-red-800">
                        Horas no disponibles:
                      </p>
                      {uniqueHours.map((res, index) => (
                        <span className="text-red-800" key={index}>
                          {res.defaultStartTime.startsWith("0")
                            ? res.defaultStartTime.slice(1, 5)
                            : res.defaultStartTime.slice(0, 5)}

                          {index < uniqueHours.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </>
                  ) : (
                    <p className="text-green-600">
                      No hay reservas por los momentos.
                    </p>
                  );
                })()
              ) : (
                <p className="text-gray-500">Cargando disponibilidad...</p>
              ))}
          </div>

          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="laboratorio-selection">
                Selecciona un laboratorio
              </FieldLabel>

              <select
                id="laboratorio-selection"
                {...register("laboratorio")}
                className={`${stepsView && "cursor-not-allowed bg-gray-100 text-gray-400"} w-full rounded-md border p-2`}
                disabled={stepsView}
              >
                <option value="">Selecciona</option>
                {availableLaboratory.map(
                  (laboratory: any) =>
                    laboratory.active === true && (
                      <option key={laboratory.id} value={laboratory.id}>
                        {laboratory.name}
                      </option>
                    ),
                )}
              </select>

              <FieldError>{errors.laboratorio?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor="tipo-evento">
                Selecciona el tipo de evento
              </FieldLabel>

              <select
                id="tipo de evento"
                {...register("type_event")}
                className={`${stepsView && "text-gray-150 cursor-not-allowed bg-gray-100 text-gray-400"} w-full rounded-md border p-2`}
                disabled={stepsView}
              >
                <option value="">Selecciona</option>
                {stateTypeEvent.map((state) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>

              <FieldError>{errors.type_event?.message}</FieldError>
            </Field>

            <Field>
              <FieldLabel htmlFor={`${formId}-time`}>
                Selecciona la hora a reservar
              </FieldLabel>
              <Input
                list="horas-disponibles"
                type="time"
                {...register("start_time")}
              />
              <FieldError>{errors.start_time?.message}</FieldError>
              <datalist id="horas-disponibles">
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </datalist>
            </Field>
            <Field>
              <FieldLabel htmlFor={`${formId}-time`}>
                Selecciona la hora de finalizacion
              </FieldLabel>
              <Input
                list="horas-disponibles"
                type="time"
                {...register("end_time")}
              />
              <FieldError>{errors.end_time?.message}</FieldError>
              <datalist id="horas-disponibles">
                {availableHours.map((hour) => (
                  <option key={hour} value={hour}>
                    {hour}
                  </option>
                ))}
              </datalist>
            </Field>
            <Field>
              <FieldLabel htmlFor="message">
                Escribe una descripcion del motivo de reserva
              </FieldLabel>
              <Textarea
                id="message"
                {...register("description")}
                rows={4}
                placeholder="Escribe por que necesitas reservar este espacio"
                className={`${stepsView && "cursor-not-allowed bg-gray-100"}`}
                disabled={stepsView}
              />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
          </FieldGroup>
          <FieldError>{errors.root?.message}</FieldError>
          <Field
            orientation="horizontal"
            className="flex-col items-stretch justify-end md:flex-row md:items-center"
          >
            <Button asChild type="button" variant="secondary">
              <Link to="/reservas">Cancelar</Link>
            </Button>

            {stepsView === false ? (
              <Button type="button" onClick={() => handleNextStep()}>
                Siguiente
              </Button>
            ) : (
              <Button type="submit" disabled={load || sendSuccess}>
                {load ? "cargando" : "confirmar"}
              </Button>
            )}
          </Field>
        </div>
      </div>
    </form>
  );
}

export default ReservationForm;
