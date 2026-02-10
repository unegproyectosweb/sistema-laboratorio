import { reservationsService } from "@/services/reservations";
import { queryOptions } from "@tanstack/react-query";

type SearchParams = Parameters<typeof reservationsService.search>[0];

export function reservationsSearchQueryOptions(params?: SearchParams) {
  return queryOptions({
    queryKey: ["reservations", params] as const,
    queryFn: ({ signal }) => reservationsService.search(params, signal),
  });
}
