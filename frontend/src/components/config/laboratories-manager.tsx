import { Badge } from "@/components/ui/badge";
import { laboratoriesService, type Laboratory } from "@/services/laboratories";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Edit2, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { CreateLaboratoryModal } from "./create-laboratory-modal";
import { EditLaboratoryDrawer } from "./edit-laboratory-drawer";

export function LaboratoriesManager() {
  const { data: labs } = useSuspenseQuery({
    queryKey: ["laboratories"],
    queryFn: () => laboratoriesService.getAll(),
  });

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const filteredLabs = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return labs.filter((lab: Laboratory) => {
      const matchesQuery = normalized
        ? `${lab.name} ${lab.number}`.toLowerCase().includes(normalized)
        : true;
      const matchesFilter =
        filter === "all" ||
        (filter === "active" && lab.active) ||
        (filter === "inactive" && !lab.active);
      return matchesQuery && matchesFilter;
    });
  }, [labs, query, filter]);

  const selectedLab = useMemo(
    () => labs.find((lab: Laboratory) => lab.id === selectedId) ?? null,
    [labs, selectedId],
  );

  return (
    <section className="min-h-full bg-linear-to-br from-gray-50 to-gray-100 text-slate-900 dark:from-[#0f1720] dark:to-[#111318] dark:text-slate-100">
      <div className="relative flex h-full flex-col">
        <header className="border-b bg-white px-8 py-5 dark:border-gray-700 dark:bg-[#111318]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Configuración de Laboratorios
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gestión simplificada de espacios y disponibilidad.
              </p>
            </div>
            <CreateLaboratoryModal
              onCreated={(id) => {
                setSelectedId(id);
                setEditOpen(true);
              }}
            />
          </div>
        </header>

        <div className="bg-linear-to-br from-gray-50 to-gray-100 px-8 py-4 dark:from-[#0f1720] dark:to-[#1e232e]">
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
                        "h-32 w-full bg-linear-to-br from-slate-200 via-slate-100 to-slate-300 dark:from-[#262a2f] dark:via-[#1f2428] dark:to-[#14161a] " +
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
              Mostrando {filteredLabs.length} de {labs.length} laboratorios
            </p>
          </div>
        </div>

        <EditLaboratoryDrawer
          key={selectedLab?.id ?? "no-lab"}
          laboratory={selectedLab}
          open={editOpen}
          onOpenChange={setEditOpen}
          onDeleted={() => setSelectedId(null)}
        />
      </div>
    </section>
  );
}
