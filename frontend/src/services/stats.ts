import { apiClient } from "@/lib/api";
import { StatsSchema } from "@uneg-lab/api-types/stats";

export const statsService = {
  reservations: async () => {
    return apiClient.get("reservations/stats").json().then(StatsSchema.parse);
  },
};
