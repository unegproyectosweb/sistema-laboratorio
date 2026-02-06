import ReservationForm from "@/components/reservas/reservation-form";
import { AvailableHours } from "@/components/reservas/reservation-form/schema";
import { apiClient } from "@/lib/api";
import { useEffect, useState } from "react";
import type { Route } from "./+types/nueva";

export async function clientLoader() {
  return {
    availableHours: AvailableHours,
  };
}

export default function NuevaReserva({ loaderData }: Route.ComponentProps) {
  const [laboratorys, setLaboratorys] = useState<any[]>([]);
  const [stateEventType, setEventType] = useState<any[]>([]);
  const [reserved, sethoursReserved] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const fetchData = async <T,>(route: string) => {
    try {
      const res = await apiClient.get(route, { throwHttpErrors: true });
      const data = await res.json<T>();

      return { data };
    } catch (error: any) {
      return { error: error as Error };
    }
  };

  useEffect(() => {
    const initReservation = async () => {
      try {
        const [resLabs, resTypes, resReserved, user] = await Promise.all([
          fetchData<any[]>("laboratories"),
          fetchData<any[]>("reserve-types"),
          fetchData<any[]>("reservations"),
          fetchData<any[]>("users"),
        ]);

        if (resLabs.error || resTypes.error || resReserved.error) {
          console.error("¡Una petición falló!", {
            resLabs,
            resTypes,
            resReserved,
          });
          return;
        }

        const reservation = resReserved.data;
        setLaboratorys(resLabs.data);
        setEventType(resTypes.data);

        setUsers(
          user.data!.map((reser: any) => ({
            uuid: reser.uuid,
            username: reser.username,
          })),
        );

        sethoursReserved(
          reservation.data.map((reser: any) => ({
            startDate: reser.startDate,
            defaultEndTime: reser.defaultEndTime,
            defaultStartTime: reser.defaultStartTime,
            rrule: reser.rrule,
          })),
        );
      } catch (err) {
        console.error("Error crítico en initReservation:", err);
        throw err;
      }
    };

    initReservation();
  }, []);

  return (
    <ReservationForm
      availableHours={loaderData.availableHours}
      availableLaboratory={laboratorys}
      stateTypeEvent={stateEventType}
      reserved={reserved}
      users={users}
    />
  );
}
