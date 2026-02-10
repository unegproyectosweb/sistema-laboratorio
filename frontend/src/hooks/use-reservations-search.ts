import { reservationsService } from "@/services/reservations";
import { queryOptions } from "@tanstack/react-query";

type SearchParams = Parameters<typeof reservationsService.search>[0];
type SearchResult = Awaited<ReturnType<typeof reservationsService.search>>;
type ReservationsQueryKey = readonly ["reservations", SearchParams | undefined];

export function reservationsSearchQueryOptions(params?: SearchParams) {
  return queryOptions<SearchResult, Error, SearchResult, ReservationsQueryKey>({
    queryKey: ["reservations", params],
    queryFn: ({ signal }) => reservationsService.search(params, signal),
  });
}
