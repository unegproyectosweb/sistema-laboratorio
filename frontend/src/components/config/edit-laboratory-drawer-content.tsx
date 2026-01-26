import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { extractErrorMessages } from "@/lib/api";
import {
  laboratoriesService,
  UpdateLaboratorySchema,
  type Laboratory,
  type UpdateLaboratoryDto,
} from "@/services/laboratories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useId, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

interface Props {
  laboratory: Laboratory | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
}

export function EditLaboratoryDrawerContent({
  laboratory,
  open,
  onOpenChange,
  onDeleted,
}: Props) {
  const formId = useId();
  const queryClient = useQueryClient();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const labQuery = useQuery({
    queryKey: ["laboratory", laboratory?.id],
    queryFn: async () => {
      if (!laboratory?.id) throw new Error("No laboratory id provided");
      return laboratoriesService.getById(laboratory.id);
    },
    enabled: open && !!laboratory?.id,
    refetchOnMount: true,
  });

  const currentLab = labQuery.data ?? laboratory;
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty },
  } = useForm({
    resolver: zodResolver(UpdateLaboratorySchema),
    values: currentLab ?? undefined,
  });

  const labId = currentLab?.id;
  const name = useWatch({ control, name: "name" });

  const getLabId = () => {
    if (!labId) throw new Error("No laboratory id available");
    return labId;
  };

  const updateMutation = useMutation({
    mutationFn: (data: UpdateLaboratoryDto) =>
      laboratoriesService.update(getLabId(), data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laboratories"] });
      onOpenChange(false);
    },
    onError: async (err) => {
      const [message] = await extractErrorMessages(err);
      setError(message ?? "No se pudo actualizar el laboratorio.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => laboratoriesService.delete(getLabId()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laboratories"] });
      setDeleteOpen(false);
      onOpenChange(false);
      onDeleted();
    },
    onError: async (err) => {
      const [message] = await extractErrorMessages(err);
      setDeleteError(message ?? "No se pudo eliminar el laboratorio.");
    },
  });

  const onSubmit = (data: UpdateLaboratoryDto) => {
    setError(null);
    updateMutation.mutate(data);
  };

  return (
    <>
      <DrawerHeader>
        <DrawerTitle>Edición rápida</DrawerTitle>
        <DrawerDescription>
          {labQuery.isLoading ? "Cargando..." : `Laboratorio ${name || "-"}`}
        </DrawerDescription>
      </DrawerHeader>

      {labQuery.isLoading ? (
        <div className="p-4">Cargando datos...</div>
      ) : labQuery.isError ? (
        <div className="text-destructive p-4">
          No se pudieron cargar los datos del laboratorio.
        </div>
      ) : (
        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 p-4 text-left"
        >
          <div className="text-xs text-slate-500">ID: {labId}</div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Nombre del Laboratorio
            </label>
            <Input {...register("name")} />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
            <p className="text-xs text-slate-500">
              Nombre descriptivo visible para los usuarios.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-900">
              Número de Laboratorio
            </label>
            <Input
              type="number"
              {...register("number", { valueAsNumber: true })}
            />
            {errors.number && (
              <p className="text-destructive text-xs">
                {errors.number.message}
              </p>
            )}
            <p className="text-xs text-slate-500">
              Código único de identificación de sala.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-sm font-medium text-slate-900">
                Estado del Laboratorio
              </p>
              <p className="text-xs text-slate-500">
                Habilitar acceso y reservas
              </p>
            </div>
            <Controller
              control={control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <span className="text-xs text-slate-400">
                    {field.value ? "Activo" : "Inactivo"}
                  </span>
                </div>
              )}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}
        </form>
      )}

      <DrawerFooter>
        <Button
          variant="destructive"
          type="button"
          disabled={deleteMutation.isPending}
          onClick={() => setDeleteOpen(true)}
        >
          Eliminar
        </Button>
        <Button
          variant="outline"
          type="button"
          disabled={updateMutation.isPending}
          onClick={() => onOpenChange(false)}
        >
          Cancelar
        </Button>
        <Button
          form={formId}
          type="submit"
          disabled={!isDirty || updateMutation.isPending}
        >
          {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </DrawerFooter>

      <Dialog
        open={deleteOpen}
        onOpenChange={(val) => {
          setDeleteOpen(val);
          if (!val) setDeleteError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar laboratorio</DialogTitle>
            <DialogDescription>
              {currentLab
                ? `Se eliminará "${currentLab.name}" y esta acción no se puede deshacer.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {deleteError && (
            <p className="text-destructive text-sm">{deleteError}</p>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
