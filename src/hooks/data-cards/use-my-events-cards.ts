import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UseMyEventsCardsProps {
  totalEvents: number;
  upcomingCount: number;
  averageParticipants: number;
  completedCount: number;
}

export function useMyEventsCards({
  totalEvents,
  upcomingCount,
  averageParticipants,
  completedCount,
}: UseMyEventsCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "total",
        title: "Total événements",
        description: "Nombre total d'événements organisés",
        value: totalEvents,
        trend: {
          value: totalEvents > 10 ? 12.5 : totalEvents > 0 ? 3.2 : 0,
          isPositive: totalEvents > 0,
          label:
            totalEvents > 10
              ? "Organisateur actif"
              : totalEvents > 0
              ? "Quelques événements"
              : "Aucun événement",
        },
        footer: {
          primary: totalEvents === 1 ? "événement" : "événements",
          secondary: "organisés par vous",
        },
      },
      {
        id: "upcoming",
        title: "À venir",
        description: "Événements à venir",
        value: upcomingCount,
        trend: {
          value: upcomingCount > 5 ? 8.7 : upcomingCount > 0 ? 2.1 : 0,
          isPositive: upcomingCount > 0,
          label:
            upcomingCount > 5
              ? "Beaucoup à venir"
              : upcomingCount > 0
              ? "Préparez-vous"
              : "Aucun à venir",
        },
        footer: {
          primary: upcomingCount === 1 ? "événement" : "événements",
          secondary: "à venir",
        },
      },
      {
        id: "average-participants",
        title: "Participants moyens",
        description: "Moyenne de participants par événement",
        value: averageParticipants,
        trend: {
          value: averageParticipants,
          isPositive: averageParticipants > 0,
          label:
            averageParticipants > 100
              ? "Très populaire"
              : averageParticipants > 50
              ? "Bonne affluence"
              : averageParticipants > 10
              ? "Participation correcte"
              : averageParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
        },
        footer: {
          primary: averageParticipants === 1 ? "participant" : "participants",
          secondary: "par événement",
        },
      },
      {
        id: "completed",
        title: "Terminés",
        description: "Événements terminés",
        value: completedCount,
        trend: {
          value: completedCount > 2 ? 4.2 : completedCount > 0 ? 1.1 : 0,
          isPositive: completedCount > 0,
          label:
            completedCount > 2
              ? "Bravo !"
              : completedCount > 0
              ? "Quelques succès"
              : "Aucun terminé",
        },
        footer: {
          primary: completedCount === 1 ? "événement" : "événements",
          secondary: "terminés",
        },
      },
    ],
    [totalEvents, upcomingCount, averageParticipants, completedCount]
  );
}
