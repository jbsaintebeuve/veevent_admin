import { useEffect, useState, useMemo } from "react";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Créer une clé stable pour détecter les changements réels
  const invitationsKey = useMemo(() => {
    return invitations.map((inv) => `${inv.id}-${inv.status}`).join("|");
  }, [invitations]);

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

            // Vérifier si l'invitation a déjà un participant pour éviter les re-fetch
            if (inv.participant) return inv;

            try {
              const participant = await fetchInvitationParticipant(
                selfHref,
                token
              );
              return { ...inv, participant };
            } catch (e) {
              return inv; // Retourner l'invitation originale sans modification
            }
          })
        );

        if (isMounted) {
          // Comparer avec l'état précédent pour éviter les re-rendus inutiles
          setEnriched((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(enrichedList)) {
              return prev; // Retourner la même référence si les données sont identiques
            }
            return enrichedList;
          });
        }
      } catch (e: any) {
        if (isMounted) setError(e);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    if (invitations.length > 0) {
      enrich();
    } else {
      setEnriched([]);
      setLoading(true); // loading reste à true tant que la query principale n'a pas fini
    }

    return () => {
      isMounted = false;
    };
  }, [invitationsKey, token]);

  return { invitations: enriched, loading, error };
}
