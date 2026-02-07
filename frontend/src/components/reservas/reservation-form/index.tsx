import {
  Field,
  FieldContent,
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
import { addYears, formatDate } from "date-fns";
import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { RadioGroup, RadioGroupItem } from "../../ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { Textarea } from "../../ui/textarea";
import CalendarReservation from "../calendar-reservation";
import { reservationFormSchema, type ReservationFormValues } from "./schema";
import {
  reservationFormSchemaRecurring,
  type ReservationFormRecurringValues,
} from "./schemaReservationRecurring";
import RecurringCalendarPreview from "./recurring-calendar-preview";
import { Label } from "@/components/ui/label";

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
    control: controlRecurring,
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
  const todayDate = formatDate(new Date(), "yyyy-MM-dd");
  const maxDate = formatDate(addYears(new Date(), 1), "yyyy-MM-dd");

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

  const selectedDay = useWatch({ control: controlRecurring, name: "days" });
  const selectedWeek = useWatch({
    control: controlRecurring,
    name: "WeeksReservations",
  });
  const startDateRecurring = useWatch({
    control: controlRecurring,
    name: "date",
  });
  const endDateRecurring = useWatch({
    control: controlRecurring,
    name: "dateFinally",
  });

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

          <RadioGroup
            value={tipoReserva}
            onValueChange={setTipoReserva}
            className="flex items-center gap-8"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem id="tipo-reserva-unica" value="unica" />
              <label
                htmlFor="tipo-reserva-unica"
                className="text-sm text-gray-700 md:text-base"
              >
                Reserva única
              </label>
            </div>

            <div className="flex items-center gap-2">
              <RadioGroupItem id="tipo-reserva-recurrente" value="recurrente" />
              <label
                htmlFor="tipo-reserva-recurrente"
                className="text-sm text-gray-700 md:text-base"
              >
                Reserva recurrente (semestre)
              </label>
            </div>
          </RadioGroup>
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

                  <Controller
                    control={control}
                    name="laboratorio"
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() ?? ""}
                        onValueChange={field.onChange}
                        disabled={stepsView}
                      >
                        <SelectTrigger id="laboratorio-selection">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableLaboratory.map(
                            (laboratory) =>
                              laboratory.active === true && (
                                <SelectItem
                                  key={laboratory.id}
                                  value={laboratory.id.toString()}
                                >
                                  {laboratory.name}
                                </SelectItem>
                              ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <FieldError>{errors.laboratorio?.message}</FieldError>
                </Field>

                <Field>
                  <FieldLabel htmlFor="tipo-evento">
                    Selecciona el tipo de evento
                  </FieldLabel>

                  <Controller
                    control={control}
                    name="type_event"
                    render={({ field }) => (
                      <Select
                        value={field.value?.toString() ?? ""}
                        onValueChange={field.onChange}
                        disabled={stepsView}
                      >
                        <SelectTrigger id="tipo-evento">
                          <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                          {stateTypeEvent.map((state) => (
                            <SelectItem
                              key={state.id}
                              value={state.id.toString()}
                            >
                              {state.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

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
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <div className="flex flex-col gap-2">
                <FieldLabel>Periodo del semestre</FieldLabel>

                <div className="animate-fadeIn flex w-full flex-wrap gap-6">
                  <div className="flex flex-col">
                    <Field orientation="horizontal">
                      <FieldLabel className="whitespace-nowrap text-[#1a3a5a]">
                        Inicio del semestre:
                      </FieldLabel>
                      <div>
                        <Input
                          type="date"
                          {...registerRecurring("date")}
                          min={todayDate}
                          max={
                            endDateRecurring
                              ? formatDate(endDateRecurring, "yyyy-MM-dd")
                              : maxDate
                          }
                        />
                        <FieldError>{errorsRecurring.date?.message}</FieldError>
                      </div>
                    </Field>
                  </div>

                  <div className="flex flex-col">
                    <Field orientation="horizontal">
                      <FieldLabel className="whitespace-nowrap text-[#1a3a5a]">
                        Fin del semestre:
                      </FieldLabel>
                      <div>
                        <Input
                          type="date"
                          {...registerRecurring("dateFinally")}
                          min={
                            startDateRecurring
                              ? formatDate(startDateRecurring, "yyyy-MM-dd")
                              : todayDate
                          }
                          max={maxDate}
                        />
                        <FieldError>
                          {errorsRecurring.dateFinally?.message}
                        </FieldError>
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[15px]">Días de la semana:</label>
                <Controller
                  control={controlRecurring}
                  name="days"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        setDiaSeleccionado(value);
                      }}
                      className="flex flex-wrap gap-6"
                    >
                      {dias.map((dia) => (
                        <div key={dia} className="flex items-center gap-2">
                          <RadioGroupItem id={`dia-${dia}`} value={dia} />
                          <Label htmlFor={`dia-${dia}`}>{dia}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              </div>

              <div className="space-y-3 pt-2">
                <label className="block text-[15px]">Aplicar en:</label>
                <Controller
                  control={controlRecurring}
                  name="WeeksReservations"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="flex flex-wrap gap-8"
                    >
                      {weeks.map((week) => (
                        <div
                          key={week.type}
                          className="flex items-center gap-2"
                        >
                          <RadioGroupItem
                            id={`semana-${week.type}`}
                            value={week.type}
                          />
                          <Label htmlFor={`semana-${week.type}`}>
                            {week.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
                <FieldError>
                  {errorsRecurring.WeeksReservations?.message}
                </FieldError>
              </div>

              <div className="lg:hidden">
                <RecurringCalendarPreview
                  startDate={startDateRecurring}
                  endDate={endDateRecurring}
                  selectedDay={selectedDay ?? diaSeleccionado}
                  selectedWeek={selectedWeek}
                />
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
                            <RadioGroup
                              value={reservaPara}
                              onValueChange={setReservaPara}
                              className="flex flex-wrap gap-8"
                            >
                              <div className="flex items-center gap-2">
                                <RadioGroupItem
                                  id="reserva-para-mi"
                                  value="mi"
                                />
                                <label
                                  htmlFor="reserva-para-mi"
                                  className="text-[15px] text-gray-700"
                                >
                                  Para mí
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                <RadioGroupItem
                                  id="reserva-para-alguien"
                                  value="alguien"
                                />
                                <label
                                  htmlFor="reserva-para-alguien"
                                  className="text-[15px] text-gray-700"
                                >
                                  Para alguien
                                </label>
                              </div>
                            </RadioGroup>
                          </div>

                          {reservaPara === "alguien" && (
                            <div className="animate-fadeIn space-y-2">
                              <FieldLabel htmlFor="profesor-select">
                                Selecciona al profesor
                              </FieldLabel>
                              <Field className="w-full">
                                <Controller
                                  control={controlRecurring}
                                  name="whomYouReserved"
                                  render={({ field }) => (
                                    <Select
                                      value={field.value ?? ""}
                                      onValueChange={field.onChange}
                                    >
                                      <SelectTrigger
                                        id="profesor-select"
                                        className="w-full"
                                      >
                                        <SelectValue placeholder="Selecciona un profesor" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {users.map((user: any) => (
                                          <SelectItem
                                            key={user.id}
                                            value={user.id}
                                          >
                                            {user.username}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}
                                />
                              </Field>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <FieldLabel htmlFor="laboratorio-selection">
                      Selecciona un laboratorio
                    </FieldLabel>

                    <Controller
                      control={controlRecurring}
                      name="laboratorio"
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() ?? ""}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            id="laboratorio-selection"
                            className="w-full"
                          >
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableLaboratory.map(
                              (laboratory: any) =>
                                laboratory.active === true && (
                                  <SelectItem
                                    key={laboratory.id}
                                    value={laboratory.id.toString()}
                                  >
                                    {laboratory.name}
                                  </SelectItem>
                                ),
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    <FieldError>
                      {errorsRecurring.laboratorio?.message}
                    </FieldError>
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="tipo-evento">
                      Selecciona el tipo de evento
                    </FieldLabel>
                    <Controller
                      control={controlRecurring}
                      name="type_event"
                      render={({ field }) => (
                        <Select
                          value={field.value?.toString() ?? ""}
                          onValueChange={field.onChange}
                          disabled={true}
                        >
                          <SelectTrigger
                            id="tipo-evento"
                            className="w-full bg-gray-200 text-gray-500"
                          >
                            <SelectValue placeholder="Selecciona" />
                          </SelectTrigger>
                          <SelectContent>
                            {stateTypeEvent.map((state) => (
                              <SelectItem
                                key={state.id}
                                value={state.id.toString()}
                              >
                                {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />

                    <FieldError>
                      {errorsRecurring.type_event?.message}
                    </FieldError>
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
                    <FieldError>
                      {errorsRecurring.start_time?.message}
                    </FieldError>
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

            <div className="hidden lg:block">
              <div className="lg:sticky lg:top-4">
                <RecurringCalendarPreview
                  startDate={startDateRecurring}
                  endDate={endDateRecurring}
                  selectedDay={selectedDay ?? diaSeleccionado}
                  selectedWeek={selectedWeek}
                  maxHeightClassName="max-h-[420px]"
                />
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}

export default ReservationForm;
