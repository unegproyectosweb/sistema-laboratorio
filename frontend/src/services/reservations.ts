import { apiClient } from "@/lib/api";
import { PaginationSchema } from "@uneg-lab/api-types/pagination";
import { ReservationSchema } from "@uneg-lab/api-types/reservation";
import type { ReserveTypeName } from "@uneg-lab/api-types/reserve-type";
import { StatsSchema } from "@uneg-lab/api-types/stats";

const ReservationPaginated = PaginationSchema(ReservationSchema);

export const reservationsService = {
  search: async (
    params?: {
      search?: string;
      page?: number;
      limit?: number;
      state?: string;
      type?: ReserveTypeName;
      laboratoryId?: number;
    },
    signal?: AbortSignal,
  ) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set("search", params.search);
    if (params?.page) searchParams.set("page", String(params.page));
    if (params?.limit) searchParams.set("limit", String(params.limit));
    if (params?.state)
      searchParams.set("filter.state.name", `$eq:${params.state}`);
    if (params?.type)
      searchParams.set("filter.type.name", `$eq:${params.type}`);
    if (params?.laboratoryId)
      searchParams.set("filter.laboratory.id", `$eq:${params.laboratoryId}`);

    return apiClient
      .get("reservations", { searchParams, signal })
      .json()
      .then(ReservationPaginated.parse);
  },

  getById: async (id: number) => {
    return apiClient
      .get(`reservations/${id}`)
      .json()
      .then(ReservationSchema.parse);
  },

  stats: async (signal?: AbortSignal) => {
    return apiClient
      .get("reservations/stats", { signal })
      .json()
      .then(StatsSchema.parse);
  },

  update: async (
    id: number,
    payload: {
      name?: string;
      startDate?: string;
      endDate?: string;
      rrule?: string | null;
      defaultStartTime?: string;
      defaultEndTime?: string;
      laboratoryId?: number;
      typeId?: number;
      userId?: string;
    },
  ) => {
    return apiClient
      .patch(`reservations/${id}`, { json: payload })
      .json()
      .then(ReservationSchema.parse);
  },

  updateState: async (id: number, stateId: number) => {
    return apiClient.patch(`reservations/${id}/state`, { json: { stateId } });
  },

  delete: async (id: number) => {
    return apiClient.delete(`reservations/${id}`).json();
  },

  create: async (payload: any) => {
    return apiClient.post("reservations", { json: payload });
  },
};
