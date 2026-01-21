import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
import { apiClient, extractErrorMessages } from "@/lib/api";
import { Edit2, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useRevalidator } from "react-router";
import { z } from "zod";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { useMediaQuery } from "@/hooks/use-media-query";

export const LaboratorySchema = z.object({
  id: z.number(),
  name: z.string(),
  number: z.number(),
  active: z.boolean(),
});

export type Laboratory = z.infer<typeof LaboratorySchema>;

type LaboratoryDraft = {
  name: string;
  number: string;
  active: boolean;
};

export function LaboratoriesManager({
  laboratories,
}: {
  laboratories: Laboratory[];
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const revalidator = useRevalidator();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedId, setSelectedId] = useState<number | null>(
    laboratories[0]?.id ?? null,
  );
  const [draft, setDraft] = useState<LaboratoryDraft | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDraft, setCreateDraft] = useState<LaboratoryDraft>({
    name: "",
    number: "",
    active: true,
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!selectedId && laboratories.length > 0) {
      setSelectedId(laboratories[0].id);
    }
  }, [laboratories, selectedId]);

  useEffect(() => {
    const selected = laboratories.find((lab) => lab.id === selectedId) ?? null;
    if (selected) {
      setDraft({
        name: selected.name,
        number: String(selected.number),
        active: selected.active,
      });
      setErrorMessage(null);
    }
  }, [laboratories, selectedId]);

  const filteredLabs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return laboratories.filter((lab) => {
      const matchesQuery = normalized
        ? `${lab.name} ${lab.number}`.toLowerCase().includes(normalized)
        : true;
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && lab.active) ||
        (filter === "inactive" && !lab.active);
      return matchesQuery && matchesFilter;
    });
  }, [laboratories, query, filter]);

  const selectedLab = laboratories.find((lab) => lab.id === selectedId) ?? null;
  const isDirty =
    !!selectedLab &&
    !!draft &&
    (draft.name.trim() !== selectedLab.name ||
      Number(draft.number) !== selectedLab.number ||
      draft.active !== selectedLab.active);

  const canSave =
    !!draft &&
    draft.name.trim().length >= 3 &&
    Number.isFinite(Number(draft.number)) &&
    Number(draft.number) > 0 &&
    isDirty &&
    !isSaving;

  const handleSave = async () => {
    if (!selectedLab || !draft) return;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const payload = {
        name: draft.name.trim(),
        number: Number(draft.number),
        active: draft.active,
      };
      await apiClient
        .patch(`laboratories/${selectedLab.id}`, { json: payload })
        .json()
        .then(LaboratorySchema.parse);
      revalidator.revalidate();
    } catch (error) {
      const [message] = await extractErrorMessages(error);
      setErrorMessage(message ?? "No se pudo guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (!selectedLab) return;
    setDraft({
      name: selectedLab.name,
      number: String(selectedLab.number),
      active: selectedLab.active,
    });
    setErrorMessage(null);
  };

  const handleDelete = async () => {
    if (!selectedLab) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await apiClient.delete(`laboratories/${selectedLab.id}`).json();
      setDeleteOpen(false);
      setEditOpen(false);
      setSelectedId(null);
      revalidator.revalidate();
    } catch (error) {
      const [message] = await extractErrorMessages(error);
      setDeleteError(message ?? "No se pudo eliminar el laboratorio.");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetCreateDraft = () => {
    setCreateDraft({ name: "", number: "", active: true });
    setCreateError(null);
  };

  const canCreate =
    createDraft.name.trim().length >= 3 &&
    Number.isFinite(Number(createDraft.number)) &&
    Number(createDraft.number) > 0 &&
    !isCreating;

  const handleCreate = async () => {
    if (!canCreate) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const payload = {
        name: createDraft.name.trim(),
        number: Number(createDraft.number),
        active: createDraft.active,
      };
      const created = await apiClient
        .post("laboratories", { json: payload })
        .json()
        .then(LaboratorySchema.parse);
      revalidator.revalidate();
      setSelectedId(created.id);
      setEditOpen(true);
      setCreateOpen(false);
      resetCreateDraft();
    } catch (error) {
      const [message] = await extractErrorMessages(error);
      setCreateError(message ?? "No se pudo crear el laboratorio.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <section className="min-h-full bg-linear-to-br from-gray-50 to-gray-100 text-slate-900">
      <div className="relative flex h-full flex-col">
        <header className="border-b bg-white px-8 py-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Configuración de Laboratorios
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gestión simplificada de espacios y disponibilidad.
              </p>
            </div>
            <Dialog
              open={createOpen}
              onOpenChange={(open) => {
                setCreateOpen(open);
                if (!open) resetCreateDraft();
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">
                      Nombre del Laboratorio
                    </label>
                    <Input
                      value={createDraft.name}
                      onChange={(event) =>
                        setCreateDraft((prev) => ({
                          ...prev,
                          name: event.target.value,
                        }))
                      }
                      placeholder="Laboratorio de Redes"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-900">
                      Número de Laboratorio
                    </label>
                    <Input
                      type="number"
                      min={1}
                      value={createDraft.number}
                      onChange={(event) =>
                        setCreateDraft((prev) => ({
                          ...prev,
                          number: event.target.value,
                        }))
                      }
                      placeholder="201"
                    />
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
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={createDraft.active}
                        onCheckedChange={(value) =>
                          setCreateDraft((prev) => ({
                            ...prev,
                            active: Boolean(value),
                          }))
                        }
                      />
                      <span className="text-xs text-slate-400">
                        {createDraft.active ? "Activo" : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {createError && (
                    <p className="text-destructive text-sm">{createError}</p>
                  )}
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancelar
                    </Button>
                  </DialogClose>
                  <Button
                    type="button"
                    onClick={handleCreate}
                    disabled={!canCreate}
                  >
                    {isCreating ? "Creando..." : "Crear Laboratorio"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="bg-linear-to-br from-gray-50 to-gray-100 px-8 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                className="w-full pl-10"
                placeholder="Buscar laboratorio..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>

            <div className="flex w-full gap-2 overflow-x-auto pb-1 lg:w-auto">
              {(
                [
                  { value: "all", label: "Todos" },
                  { value: "active", label: "Activos" },
                  { value: "inactive", label: "Inactivos" },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setFilter(item.value)}
                  className={
                    item.value === filter
                      ? "bg-primary rounded-full px-4 py-1.5 text-xs font-medium text-white shadow-sm"
                      : "rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  }
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative px-8 pt-2 pb-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredLabs.map((lab) => {
              const isSelected = lab.id === selectedId;
              return (
                <button
                  key={lab.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(lab.id);
                    setEditOpen(true);
                  }}
                  className="text-left"
                >
                  <div
                    className={
                      "group hover:border-primary/50 relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md " +
                      (isSelected
                        ? "border-primary ring-primary/10 shadow-md ring-2"
                        : "border-slate-200")
                    }
                  >
                    <div className="absolute top-3 right-3 z-10">
                      <Badge
                        className={
                          lab.active
                            ? "bg-green-100 text-green-800"
                            : "bg-slate-100 text-slate-600"
                        }
                      >
                        {lab.active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <div
                      className={
                        "h-32 w-full bg-linear-to-br from-slate-200 via-slate-100 to-slate-300 " +
                        (lab.active ? "" : "grayscale")
                      }
                    />
                    <div className="p-4">
                      <div className="mb-1 flex items-center justify-between">
                        <h3
                          className={
                            "text-base font-bold transition-colors " +
                            (isSelected
                              ? "text-primary"
                              : "group-hover:text-primary text-slate-900")
                          }
                        >
                          {lab.name}
                        </h3>
                        {isSelected && (
                          <Edit2 className="text-primary size-4" />
                        )}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        <span className="font-medium">Número:</span>
                        <span
                          className={
                            "ml-2 rounded px-2 py-0.5 font-mono text-xs " +
                            (isSelected
                              ? "bg-primary/10 text-primary"
                              : "bg-slate-100 text-slate-700")
                          }
                        >
                          {lab.number}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-center">
            <p className="text-sm text-slate-500">
              Mostrando {filteredLabs.length} de {laboratories.length}{" "}
              laboratorios
            </p>
          </div>
        </div>

        <Drawer
          open={editOpen}
          onOpenChange={setEditOpen}
          direction={isDesktop ? "right" : "bottom"}
        >
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Edición rápida</DrawerTitle>
              <DrawerDescription>
                {selectedLab
                  ? `Laboratorio ${selectedLab.name}`
                  : "Selecciona un laboratorio para editar"}
              </DrawerDescription>
            </DrawerHeader>

            {selectedLab && draft ? (
              <div className="space-y-4 p-4">
                <div className="text-xs text-slate-500">
                  ID: {selectedLab.id}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-900">
                    Nombre del Laboratorio
                  </label>
                  <Input
                    value={draft.name}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev ? { ...prev, name: event.target.value } : prev,
                      )
                    }
                  />
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
                    min={1}
                    value={draft.number}
                    onChange={(event) =>
                      setDraft((prev) =>
                        prev ? { ...prev, number: event.target.value } : prev,
                      )
                    }
                  />
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
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={draft.active}
                      onCheckedChange={(value) =>
                        setDraft((prev) =>
                          prev ? { ...prev, active: Boolean(value) } : prev,
                        )
                      }
                    />
                    <span className="text-xs text-slate-400">
                      {draft.active ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-destructive text-sm">{errorMessage}</p>
                )}
                {deleteError && (
                  <p className="text-destructive text-sm">{deleteError}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                Selecciona un laboratorio para ver su configuración.
              </p>
            )}

            <DrawerFooter>
              <Button
                variant="destructive"
                type="button"
                disabled={!selectedLab || isDeleting}
                onClick={() => setDeleteOpen(true)}
              >
                Eliminar
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancelar
                </Button>
              </DrawerClose>
              <Button type="button" onClick={handleSave} disabled={!canSave}>
                {isSaving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          setDeleteOpen(open);
          if (!open) setDeleteError(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar laboratorio</DialogTitle>
            <DialogDescription>
              {selectedLab
                ? `Se eliminará "${selectedLab.name}" y esta acción no se puede deshacer.`
                : "Selecciona un laboratorio para eliminar."}
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
              onClick={handleDelete}
              disabled={!selectedLab || isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
