import {
  LaboratoriesManager,
  LaboratorySchema,
} from "@/components/config/laboratories-manager";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { Suspense } from "react";
import { Await } from "react-router";
import type { Route } from "./+types/config";

export function clientLoader({ request: { signal } }: Route.ClientLoaderArgs) {
  return {
    laboratories: apiClient
      .get("laboratories", { signal })
      .json()
      .then(LaboratorySchema.array().parse),
  };
}

export default function Config({ loaderData }: Route.ComponentProps) {
  return (
    <Suspense fallback={<Skeleton className="h-125" />}>
      <Await resolve={loaderData.laboratories}>
        {(laboratories) => (
          <LaboratoriesManager laboratories={laboratories} />
        )}
      </Await>
    </Suspense>
  );
}
