import { apiClient } from "@/lib/api";
import { PaginationSchema } from "@uneg-lab/api-types/pagination";
import { ReservationSchema } from "@uneg-lab/api-types/reservation";
import type { ReserveTypeName } from "@uneg-lab/api-types/reserve-type";
import { StatsSchema } from "@uneg-lab/api-types/stats";

const ReservationPaginated = PaginationSchema(ReservationSchema);

export const reservationsService = {
  search: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
    state?: string;
    type?: ReserveTypeName;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.state)
      searchParams.set("filter.state.name", `$eq:${params.state}`);
    if (params?.type)
      searchParams.set("filter.type.name", `$eq:${params.type}`);

    return apiClient
      .get("reservations", { searchParams })
      .json()
      .then(ReservationPaginated.parse);
  },

  getById: async (id: number) => {
    return apiClient
      .get(`reservations/${id}`)
      .json()
      .then(ReservationSchema.parse);
  },

  stats: async () => {
    return apiClient.get("reservations/stats").json().then(StatsSchema.parse);
  },

  update: async (id: number, payload: { stateId?: number }) => {
    return apiClient
      .patch(`reservations/${id}`, { json: payload })
      .json()
      .then(ReservationSchema.parse);
  },

  updateState: async (id: number, stateId: number) => {
    return apiClient
      .patch(`reservations/${id}/state`, { json: { stateId } })
      .json()
      .then(ReservationSchema.parse);
  },
};
