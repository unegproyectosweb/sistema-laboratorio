import { reservationsService } from "@/services/reservations";
import { ReservationStateEnum } from "@uneg-lab/api-types/reservation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useUpdateReservationState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stateId }: { id: number; stateId: number }) =>
      reservationsService.updateState(id, stateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({
        queryKey: ["reservation", variables.id],
      });

      let message = "";
      if (variables.stateId === ReservationStateEnum.APROBADO)
        message = "Se aprobó exitosamente";
      else if (variables.stateId === ReservationStateEnum.RECHAZADO)
        message = "Se rechazó exitosamente";
      else if (variables.stateId === ReservationStateEnum.CANCELADO)
        message = "Se canceló exitosamente";

      toast.success(message);
    },
    onError: (error, variables) => {
      let action = "procesar";
      if (variables.stateId === ReservationStateEnum.APROBADO)
        action = "aprobar";
      else if (variables.stateId === ReservationStateEnum.RECHAZADO)
        action = "rechazar";
      else if (variables.stateId === ReservationStateEnum.CANCELADO)
        action = "cancelar";

      toast.error(`Ocurrió un error al intentar ${action} la solicitud`);
      console.error(error);
    },
  });
}
