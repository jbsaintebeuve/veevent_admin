import { useEffect, useState } from "react";
import { Invitation } from "@/types/invitation";
import { fetchInvitationParticipant } from "@/lib/fetch-invitations";
import { User } from "@/types/user";

interface UseEnrichedInvitationsResult {
  invitations: Invitation[];
  loading: boolean;
  error: Error | null;
}

export function useEnrichedInvitations(
  invitations: Invitation[],
  token?: string
): UseEnrichedInvitationsResult {
  const [enriched, setEnriched] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function enrich() {
      setLoading(true);
      setError(null);
      try {
        const enrichedList = await Promise.all(
          invitations.map(async (inv) => {
            const selfHref = inv._links?.self?.href;
            if (!selfHref) return inv;
            try {
              const participant = await fetchInvitationParticipant(
                selfHref,
                token
              );
              return { ...inv, participant };
            } catch (e) {
              return { ...inv };
            }
          })
        );
        if (isMounted) setEnriched(enrichedList);
      } catch (e: any) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (invitations.length > 0) enrich();
    else setEnriched([]);
    return () => {
      isMounted = false;
    };
  }, [invitations, token]);

  return { invitations: enriched, loading, error };
}
