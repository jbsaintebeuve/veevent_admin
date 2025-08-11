import { useMemo } from "react";
import { CardData } from "@/components/section-cards";
import { Invitation } from "@/types/invitation";

interface UseInvitationsCardsProps {
  invitations: Invitation[];
  totalInvitations: number;
  pendingCount: number;
  acceptedCount: number;
  rejectedCount: number;
}

export function useInvitationsCards({
  invitations,
  totalInvitations,
  pendingCount,
  acceptedCount,
  rejectedCount,
}: UseInvitationsCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "total",
        title: "Total invitations",
        description: "Nombre total d'invitations reçues",
        value: totalInvitations,
        trend: {
          value: totalInvitations > 10 ? 12.5 : totalInvitations > 0 ? 3.2 : 0,
          isPositive: totalInvitations > 0,
          label:
            totalInvitations > 10
              ? "Très sollicité"
              : totalInvitations > 0
              ? "Quelques invitations"
              : "Aucune invitation",
        },
        footer: {
          primary: totalInvitations === 1 ? "invitation" : "invitations",
          secondary: "reçues au total",
        },
      },
      {
        id: "pending",
        title: "En attente",
        description: "Invitations en attente de réponse",
        value: pendingCount,
        trend: {
          value: pendingCount > 5 ? 8.7 : pendingCount > 0 ? 2.1 : 0,
          isPositive: pendingCount > 0,
          label:
            pendingCount > 5
              ? "Beaucoup en attente"
              : pendingCount > 0
              ? "À traiter"
              : "Aucune en attente",
        },
        footer: {
          primary: pendingCount === 1 ? "invitation" : "invitations",
          secondary: "en attente",
        },
      },
      {
        id: "accepted",
        title: "Acceptées",
        description: "Invitations acceptées",
        value: acceptedCount,
        trend: {
          value: acceptedCount > 2 ? 5.4 : acceptedCount > 0 ? 1.2 : 0,
          isPositive: acceptedCount > 0,
          label:
            acceptedCount > 2
              ? "Très actif"
              : acceptedCount > 0
              ? "Participant"
              : "Aucune acceptée",
        },
        footer: {
          primary: acceptedCount === 1 ? "invitation" : "invitations",
          secondary: "acceptées",
        },
      },
      {
        id: "rejected",
        title: "Refusées",
        description: "Invitations refusées",
        value: rejectedCount,
        trend: {
          value: rejectedCount > 2 ? 4.2 : rejectedCount > 0 ? 1.1 : 0,
          isPositive: rejectedCount > 0,
          label:
            rejectedCount > 2
              ? "Sélectif"
              : rejectedCount > 0
              ? "Quelques refus"
              : "Aucune refusée",
        },
        footer: {
          primary: rejectedCount === 1 ? "invitation" : "invitations",
          secondary: "refusées",
        },
      },
    ],
    [totalInvitations, pendingCount, acceptedCount, rejectedCount]
  );
}
