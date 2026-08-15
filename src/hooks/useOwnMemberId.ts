import { useEffect, useState } from "react";
import { apiClient } from "@/api/client";
import { useAuth } from "@/auth/useAuth";

type BootstrapStatus = "loading" | "resolved" | "unavailable";

/**
 * A MEMBER's own member_id is never in /auth/me, and GET /members (list) is
 * 403 for that role, so there's no direct lookup. GET /payments and
 * GET /routines both auto-resolve "self" server-side for a MEMBER when
 * member_id is omitted, and echo it back in each row — payments almost always
 * has data first (a member pays before any trainer ever touches their
 * account), routines is the fallback. If both come back empty, status stays
 * "unavailable" and callers should degrade gracefully rather than guess an id.
 */
export function useOwnMemberId() {
  const { user } = useAuth();
  const [memberId, setMemberId] = useState<number | null>(null);
  const [status, setStatus] = useState<BootstrapStatus>("loading");

  useEffect(() => {
    let cancelled = false;

    async function resolve() {
      if (!user || user.role !== "MEMBER") {
        setStatus("unavailable");
        return;
      }

      for (const path of ["/payments", "/routines"]) {
        try {
          const { data } = await apiClient.get(path, { params: { page: 0, size: 1 } });
          const resolvedId: number | undefined = data?.content?.[0]?.member_id;

          if (resolvedId) {
            if (!cancelled) {
              setMemberId(resolvedId);
              setStatus("resolved");
            }
            return;
          }
        } catch {
          // try the next source
        }
      }

      if (!cancelled) {
        setStatus("unavailable");
      }
    }

    void resolve();

    return () => {
      cancelled = true;
    };
  }, [user]);

  return { memberId, status };
}
