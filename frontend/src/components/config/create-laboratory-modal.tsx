import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { extractErrorMessages } from "@/lib/api";
import {
  CreateLaboratorySchema,
  laboratoriesService,
  type CreateLaboratoryDto,
} from "@/services/laboratories";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useId, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Label } from "../ui/label";

interface CreateLaboratoryModalProps {
  onCreated: (id: number) => void;
}

export function CreateLaboratoryModal({
  onCreated,
}: CreateLaboratoryModalProps) {
  const formId = useId();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateLaboratoryDto>({
    resolver: zodResolver(CreateLaboratorySchema),
    defaultValues: {
      name: "",
      number: 0,
      active: true,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateLaboratoryDto) => laboratoriesService.create(data),
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["laboratories"] });
      onCreated(created.id);
      setOpen(false);
      reset();
    },
    onError: async (err) => {
      const [message] = await extractErrorMessages(err);
      setError(message ?? "No se pudo crear el laboratorio.");
    },
  });

  const onSubmit = (data: CreateLaboratoryDto) => {
    setError(null);
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) {
          reset();
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2" type="button">
          <Plus className="size-4" />
          Añadir Nuevo Laboratorio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo laboratorio</DialogTitle>
          <DialogDescription>
            Registra un laboratorio y su disponibilidad.
          </DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Nombre del Laboratorio
            </Label>
            <Input {...register("name")} placeholder="Laboratorio de Redes" />
            {errors.name && (
              <p className="text-destructive text-xs">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground text-sm font-medium">
              Número de Laboratorio
            </Label>
            <Input
              type="number"
              {...register("number", { valueAsNumber: true })}
              placeholder="201"
            />
            {errors.number && (
              <p className="text-destructive text-xs">
                {errors.number.message}
              </p>
            )}
          </div>

          <div className="bg-card border-border flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Estado del Laboratorio</p>
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
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit" disabled={mutation.isPending} form={formId}>
            {mutation.isPending ? "Creando..." : "Crear Laboratorio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
