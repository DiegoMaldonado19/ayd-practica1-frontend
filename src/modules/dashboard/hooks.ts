import { useQuery } from "@tanstack/react-query";
import { getVisits, getGuestPasses } from "@/modules/access/services";
import type { VisitListParams, GuestPassListParams } from "@/modules/access/types";

// access has no hooks.ts of its own (its pages call the services directly) —
// these two thin wrappers exist here because the dashboard needs them as
// cached queries, not because access should have owned them.
export function useVisits(params: VisitListParams) {
  return useQuery({
    queryKey: ["access", "visits", params],
    queryFn: () => getVisits(params),
  });
}

export function useGuestPasses(params: GuestPassListParams) {
  return useQuery({
    queryKey: ["access", "guest-passes", params],
    queryFn: () => getGuestPasses(params),
  });
}
