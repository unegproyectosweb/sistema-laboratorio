import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usersService, type User } from "@/services/users";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { CreateUserModal } from "./create-user-modal";
import { ViewUserDrawer } from "./view-user-drawer";

export function UsersManager() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: users } = useSuspenseQuery({
    queryKey: ["users"],
    queryFn: () => usersService.getAll(),
  });

  const handleSearch = async () => {
    setError(null);
    setResult(null);
    try {
      const user = await usersService.getByUsername(query.trim());
      setResult(user);
      setDrawerOpen(true);
    } catch (err: any) {
      setError(err?.message ?? "No se encontró el usuario");
    }
  };

  const searchQuery = useDeferredValue(query.trim().toLowerCase());

  const filteredUsers = !searchQuery
    ? users
    : users.filter((u) =>
        `${u.name} ${u.username} ${u.email ?? ""}`
          .toLowerCase()
          .includes(searchQuery),
      );
  return (
    <section className="min-h-full bg-linear-to-br from-gray-50 to-gray-100 text-slate-900 dark:from-[#0f1720] dark:to-[#111318] dark:text-slate-100">
      <div className="relative flex h-full flex-col">
        <header className="border-b bg-white px-8 py-5 dark:border-gray-700 dark:bg-[#111318]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Busca por nombre de usuario, crea nuevos usuarios y revisa sus
                detalles.
              </p>
            </div>
            <CreateUserModal
              onCreated={async (id) => {
                setQuery("");
                setError(null);
                try {
                  const u = await usersService.getById(id);
                  setResult(u);
                  setDrawerOpen(true);
                } catch {
                  setResult(null);
                }
              }}
            />
          </div>
        </header>

        <div className="bg-linear-to-br from-gray-50 to-gray-100 px-8 py-4 dark:from-[#0f1720] dark:to-[#1e232e]">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex w-full max-w-md gap-2">
              <Input
                className="w-full"
                placeholder="Buscar por username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handleSearch}>Buscar</Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setQuery("");
                    setResult(null);
                    setError(null);
                  }}
                >
                  Limpiar
                </Button>
              </div>
              {error && (
                <p className="text-destructive mt-2 text-sm">{error}</p>
              )}
            </div>
          </div>
        </div>

        <div className="relative px-8 pt-2 pb-8">
          <div className="grid grid-cols-1 justify-center gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setResult(u);
                  setDrawerOpen(true);
                }}
                className="text-left sm:max-w-md"
              >
                <div className="group hover:border-primary/50 relative overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
                  <div className="p-4">
                    <div className="mb-1 flex items-center justify-between">
                      <h3 className="text-base font-bold">{u.name}</h3>
                      <Badge className="bg-slate-100 text-slate-700">
                        @{u.username}
                      </Badge>
                    </div>

                    <div className="text-muted-foreground text-sm">
                      <div>
                        <span className="font-medium">Email:</span>
                        <span className="ml-2">{u.email ?? "—"}</span>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Rol:</span>
                        <span className="ml-2">{u.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <ViewUserDrawer
          userId={result?.id ?? null}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </section>
  );
}
