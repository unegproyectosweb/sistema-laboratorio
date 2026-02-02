import { reservationsService } from "@/services/reservations";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const STATUS_IDS = {
  APROBADO: 2,
  RECHAZADO: 3,
};

export function useUpdateReservationState() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, stateId }: { id: number; stateId: number }) =>
      reservationsService.updateState(id, stateId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["reservations"] });

      const isApprove = variables.stateId === STATUS_IDS.APROBADO;
      toast.success(`Se ${isApprove ? "aprobó" : "rechazó"} exitosamente`);
    },
    onError: (error, variables) => {
      const isApprove = variables.stateId === STATUS_IDS.APROBADO;
      toast.error(
        `Ocurrió un error al intentar ${isApprove ? "aprobar" : "rechazar"} la solicitud`,
      );
      console.error(error);
    },
  });
}
