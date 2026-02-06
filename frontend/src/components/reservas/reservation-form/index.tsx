import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { setErrorFromServer } from "@/lib/api";
import { useUser } from "@/lib/auth";
import { reservationsService } from "@/services/reservations";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { RoleEnum } from "@uneg-lab/api-types/auth";
import {
  ReservationStateEnum,
  TypeReservation,
} from "@uneg-lab/api-types/reservation";
import { formatDate } from "date-fns";
import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Textarea } from "../../ui/textarea";
import CalendarReservation from "../calendar-reservation";
import { reservationFormSchema, type ReservationFormValues } from "./schema";
import {
  reservationFormSchemaRecurring,
  type ReservationFormRecurringValues,
} from "./schemaReservationRecurring";

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
    defaultEndTime: string;
    rrule: string;
  }[];
  users: {
    username: string;
    id: string;
  }[];
}

function ReservationForm({
  users,
  reserved,
  availableHours,
  availableLaboratory,
  stateTypeEvent,
}: ModalReservasionProps) {
  const { user } = useUser();

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const formId = useId();

  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationFormSchema as any),
  });

  const formRecurring = useForm<ReservationFormRecurringValues>({
    resolver: zodResolver(reservationFormSchemaRecurring as any),
    defaultValues: {
      type_event: TypeReservation.CLASE,
    },
  });

  const [load, setLoad] = useState(false);
  const { register, handleSubmit, formState, setError, control, trigger } =
    form;

  const {
    register: registerRecurring,
    handleSubmit: handleSubmitRecurring,
    formState: formStateRecurring,
    watch: watchRecurring,
  } = formRecurring;

  const { errors } = formState;
  const { errors: errorsRecurring } = formStateRecurring;

  const [reservaPara, setReservaPara] = useState("mi");
  const [stepsView, setStepsView] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [tipoReserva, setTipoReserva] = useState("unica");
  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
  const weeks = [
    { name: "Todas las semanas", type: "semanal" },
    { name: "Solo semanas impares", type: "impares" },
    { name: "Solo semanas pares", type: "pares" },
  ];
  const [diaSeleccionado, setDiaSeleccionado] = useState("Lunes");
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

  const handleChange = (e: any) => {
    setTipoReserva(e.target.value);
  };

  const selectedDay = watchRecurring("days");
  const selectedWeek = watchRecurring("WeeksReservations");

  const filteredHours = availableHours.filter((hour) => {
    const isBlocked = reserved.some((reserve) => {
      const [partFreq, partDays] = reserve.rrule?.split(";") || [];
      const weeksDB = partFreq?.split("=")[1];
      const daysDB = partDays?.split("=")[1];

      const isSameDay = selectedDay === daysDB;

      const isSameWeek =
        selectedWeek === weeksDB ||
        weeksDB === "todas" ||
        selectedWeek === "todas";

      if (isSameDay && isSameWeek) {
        const startDB = reserve.defaultStartTime.slice(0, 5);
        const endDB = reserve.defaultEndTime.slice(0, 5);
        return hour >= startDB && hour < endDB;
      }
      return false;
    });

    return !isBlocked;
  });

  return (
    <div className="p-4 md:h-full md:w-auto">
      <div className="flex w-full justify-center">
        <div className="max-w-2xl bg-white p-8">
          <h2 className="mb-6 text-[26px] text-[#1a3a5a]">
            <span className="font-bold">Reserva</span>{" "}
            {tipoReserva === "unica" ? "única" : "recurrente"} de
            Laboratorio{" "}
          </h2>

          <div className="flex items-center gap-8">
            <label className="group flex cursor-pointer items-center">
              <input
                type="radio"
                name="tipo_reserva"
                value="unica"
                checked={tipoReserva === "unica"}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 md:text-base">
                Reserva única
              </span>
            </label>

            <label className="group flex cursor-pointer items-center">
              <input
                type="radio"
                name="tipo_reserva"
                value="recurrente"
                checked={tipoReserva === "recurrente"}
                onChange={handleChange}
                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700 md:text-base">
                Reserva recurrente (semestre)
              </span>
            </label>
          </div>
        </div>
      </div>

      {tipoReserva === "unica" ? (
        <form
          noValidate
          onSubmit={handleSubmit(async (data) => {
            setLoad(true);

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
                name: data.description,
                startDate: data.date.toISOString().split("T")[0],
                endDate: data.dateFinally.toISOString().split("T")[0],
                rrule: null,
                defaultStartTime: data.start_time + ":00",
                defaultEndTime: data.end_time + ":00",
                laboratoryId: Number(data.laboratorio),
                stateId: ReservationStateEnum.PENDIENTE, //estado en PROCESO
                typeId: Number(data.type_event),
              };
              await reservationsService.create(sendData);

              queryClient.invalidateQueries({ queryKey: ["reservations"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });

              setSendSuccess(true);
              toast.success("Registro de reserva exitoso");
            } catch (error) {
              toast.error("Error al crear la reservación");
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
                      <span>Nota:</span> Las reservas tienen una duración de 2
                      horas
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
              <div className="bg-card w-96 self-center rounded-lg border p-5 text-center shadow-md">
                <h2 className="text-xl font-semibold">
                  {dateValue
                    ? "Seleccionaste " +
                      formatDate(dateValue, "d 'de' MMMM yyyy")
                    : "Selecciona una fecha"}
                </h2>
                {dateValue !== undefined &&
                  (reserved.length > 0 ? (
                    (() => {
                      const filteredByDate = reserved.filter(
                        (res) =>
                          dateValue.toISOString().split("T")[0] ===
                          res.startDate,
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
                    id="tipo-evento"
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
                  <FieldLabel htmlFor={`${formId}-start-time`}>
                    Selecciona la hora a reservar
                  </FieldLabel>
                  <Input
                    id={`${formId}-start-time`}
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
                  <FieldLabel htmlFor={`${formId}-end-time`}>
                    Selecciona la hora de finalizacion
                  </FieldLabel>
                  <Input
                    id={`${formId}-end-time`}
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
      ) : (
        <form
          noValidate
          onSubmit={handleSubmitRecurring(async (data) => {
            setLoad(true);

            for (const reserve of reserved) {
              const [partFreq, partDays] = reserve.rrule?.split(";") || [];
              if (!partFreq || !partDays) continue;

              const weeksDB = partFreq.split("=")[1];
              const daysDB = partDays.split("=")[1];

              const startDB = reserve.defaultStartTime.slice(0, 5);
              const endDB = reserve.defaultEndTime.slice(0, 5);

              const isSameDay = data.days === daysDB;
              const isSameWeek =
                data.WeeksReservations === weeksDB || weeksDB === "todas";

              if (isSameWeek && isSameDay) {
                if (startDB === data.start_time && endDB === data.end_time) {
                  alert(
                    `Selecciona otra hora de reserva que no inicie en ${startDB} y termine en ${endDB}`,
                  );
                  setLoad(false);
                  return;
                }

                if (data.start_time < endDB && data.end_time > startDB) {
                  alert(
                    `Conflicto: Hay una clase activa de ${startDB} a ${endDB}.`,
                  );
                  setLoad(false);
                  return;
                }
              }
            }

            try {
              const sendData: any = {
                name: data.description,
                startDate: data.date.toISOString().split("T")[0],
                endDate: data.dateFinally.toISOString().split("T")[0],
                rrule: `FREQ=${data.WeeksReservations};BYDAY=${data.days}`,
                defaultStartTime: data.start_time + ":00",
                defaultEndTime: data.end_time + ":00",
                laboratoryId: Number(data.laboratorio),
                stateId: ReservationStateEnum.PENDIENTE,
                typeId: Number(data.type_event),
              };

              if (reservaPara === "alguien" && data.whomYouReserved) {
                sendData.userId = data.whomYouReserved;
              }

              await reservationsService.create(sendData);

              queryClient.invalidateQueries({ queryKey: ["reservations"] });
              queryClient.invalidateQueries({ queryKey: ["dashboard"] });

              setSendSuccess(true);
            } catch (error) {
              toast.error("Error al crear la reservación");
              setErrorFromServer(setError, error);
              console.log(error);
              return;
            } finally {
              setLoad(false);
              navigate("/reservas");
            }
          })}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr]">
            <div className="flex flex-col gap-2">
              <FieldLabel>Periodo del semestre</FieldLabel>

              <div className="animate-fadeIn flex w-full flex-wrap gap-6">
                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <label className="text-[15px] text-[#1a3a5a]">
                      Inicio del semestre:
                    </label>
                    <input
                      type="date"
                      {...registerRecurring("date")}
                      className="rounded-[4px] border border-[#d1d5db] px-3 py-1.5 text-[#1a3a5a] transition-colors focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <FieldError>{errorsRecurring.date?.message}</FieldError>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-3">
                    <label className="text-[15px] text-[#1a3a5a]">
                      Fin del semestre:
                    </label>
                    <input
                      type="date"
                      {...registerRecurring("dateFinally")}
                      className="rounded-[4px] border border-[#d1d5db] px-3 py-1.5 text-[#1a3a5a] transition-colors focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <FieldError>
                    {errorsRecurring.dateFinally?.message}
                  </FieldError>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[15px]">Días de la semana:</label>
              <div className="flex flex-wrap gap-6">
                {dias.map((dia) => (
                  <label
                    key={dia}
                    className="group flex cursor-pointer items-center"
                  >
                    <div className="relative flex items-center">
                      <input
                        type="radio"
                        {...registerRecurring("days")}
                        value={dia}
                        checked={diaSeleccionado === dia}
                        onChange={() => setDiaSeleccionado(dia)}
                        className="h-5 w-5 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white opacity-0 peer-checked:opacity-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    </div>
                    <span className="ml-2 text-[15px] text-[#1a3a5a]">
                      {dia}
                    </span>

                    <FieldError>{errorsRecurring.days?.message}</FieldError>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="block text-[15px]">Aplicar en:</label>
              <div className="flex flex-wrap gap-8">
                {weeks.map((week) => (
                  <label
                    key={week.type}
                    className="flex cursor-pointer items-center"
                  >
                    <input
                      type="radio"
                      value={week.type}
                      {...registerRecurring("WeeksReservations")}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-[15px]">{week.name}</span>
                  </label>
                ))}
              </div>
              <FieldError>
                {errorsRecurring.WeeksReservations?.message}
              </FieldError>
            </div>

            <div className="flex flex-col items-stretch gap-4">
              <FieldGroup>
                <Field>
                  {user?.role === RoleEnum.ADMIN && (
                    <div className="border-rounded mt-2 border-2 border-gray-200 p-2">
                      <div className="space-y-4 pt-4">
                        <div className="space-y-3">
                          <label className="block text-[15px] font-medium text-[#1a3a5a]">
                            ¿A quién le harás la reserva?
                          </label>
                          <div className="flex flex-wrap gap-8">
                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                name="reserva-tipo"
                                value="mi"
                                checked={reservaPara === "mi"}
                                onChange={(e) => setReservaPara(e.target.value)}
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-[15px] text-gray-700">
                                Para mí
                              </span>
                            </label>

                            <label className="flex cursor-pointer items-center">
                              <input
                                type="radio"
                                name="reserva-tipo"
                                value="alguien"
                                checked={reservaPara === "alguien"}
                                onChange={(e) => setReservaPara(e.target.value)}
                                className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="ml-2 text-[15px] text-gray-700">
                                Para alguien
                              </span>
                            </label>
                          </div>
                        </div>

                        {reservaPara === "alguien" && (
                          <div className="animate-fadeIn space-y-2">
                            <FieldLabel htmlFor="profesor-select">
                              Selecciona al profesor
                            </FieldLabel>
                            <Field className="w-full">
                              <select
                                id="profesor-select"
                                className="w-full rounded-md border border-gray-300 p-2 text-black"
                                {...registerRecurring("whomYouReserved")}
                              >
                                <option value="">Selecciona un profesor</option>
                                {users.map((user: any) => (
                                  <option
                                    key={user.id}
                                    value={user.id}
                                    className="text-black"
                                  >
                                    {user.username}
                                  </option>
                                ))}
                              </select>
                            </Field>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  <FieldLabel htmlFor="laboratorio-selection">
                    Selecciona un laboratorio
                  </FieldLabel>

                  <select
                    id="laboratorio-selection"
                    {...registerRecurring("laboratorio")}
                    className={`w-full rounded-md border p-2`}
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

                  <FieldError>
                    {errorsRecurring.laboratorio?.message}
                  </FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="tipo-evento">
                    Selecciona el tipo de evento
                  </FieldLabel>
                  <select
                    id="tipo-evento"
                    {...registerRecurring("type_event")}
                    className={`w-full rounded-md border bg-gray-200 p-2 text-gray-500`}
                    disabled={true}
                    defaultValue={TypeReservation.CLASE}
                  >
                    <option value="">Selecciona</option>
                    {stateTypeEvent.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>

                  <FieldError>{errorsRecurring.type_event?.message}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${formId}-start-time`}>
                    Selecciona la hora a reservar
                  </FieldLabel>
                  <Input
                    id={`${formId}-start-time`}
                    list="horas-disponibles"
                    type="time"
                    {...registerRecurring("start_time")}
                  />
                  <FieldError>{errorsRecurring.start_time?.message}</FieldError>
                  <datalist id="horas-disponibles">
                    {filteredHours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </datalist>
                </Field>
                <Field>
                  <FieldLabel htmlFor={`${formId}-end-time`}>
                    Selecciona la hora de finalizacion
                  </FieldLabel>
                  <Input
                    id={`${formId}-end-time`}
                    list="horas-disponibles"
                    type="time"
                    {...registerRecurring("end_time")}
                  />
                  <FieldError>{errorsRecurring.end_time?.message}</FieldError>
                  <datalist id="horas-disponibles">
                    {filteredHours.map((hour) => (
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
                    {...registerRecurring("description")}
                    rows={4}
                    placeholder="Escribe por que necesitas reservar este espacio"
                    className={`${stepsView && "cursor-not-allowed bg-gray-100"}`}
                    disabled={stepsView}
                  />
                  <FieldError>
                    {errorsRecurring.description?.message}
                  </FieldError>
                </Field>
              </FieldGroup>
              <FieldError>{errorsRecurring.root?.message}</FieldError>
              <Field
                orientation="horizontal"
                className="flex-col items-stretch justify-end md:flex-row md:items-center"
              >
                <Button asChild type="button" variant="secondary">
                  <Link to="/reservas">Cancelar</Link>
                </Button>

                <Button disabled={load} type="submit">
                  {load ? "cargando" : "confirmar"}
                </Button>
              </Field>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReservationForm;
