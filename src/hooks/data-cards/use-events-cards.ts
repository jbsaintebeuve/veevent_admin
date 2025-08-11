import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UseEventsCardsProps {
  totalEvents: number;
  upcomingEvents: number;
  averageParticipants: number;
  totalParticipants: number;
}

export function useEventsCards({
  totalEvents,
  upcomingEvents,
  averageParticipants,
  totalParticipants,
}: UseEventsCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "total",
        title: "Total événements",
        description: "Tous les événements",
        value: totalEvents,
        trend: {
          value:
            totalEvents > 50
              ? 18.5
              : totalEvents > 20
              ? 12.3
              : totalEvents > 5
              ? 6.8
              : totalEvents > 0
              ? 2.1
              : 0,
          isPositive: !!(totalEvents && totalEvents > 0),
          label:
            totalEvents > 50
              ? "Plateforme très active"
              : totalEvents > 20
              ? "Bonne activité"
              : totalEvents > 5
              ? "Activité modérée"
              : totalEvents > 0
              ? "Démarrage"
              : "Aucun événement",
        },
        footer: {
          primary:
            totalEvents > 50
              ? "Plateforme très active"
              : totalEvents > 20
              ? "Bonne activité"
              : totalEvents > 5
              ? "Activité modérée"
              : totalEvents > 0
              ? "Démarrage"
              : "Aucun événement",
          secondary: "événements créés",
        },
      },
      {
        id: "upcoming",
        title: "À venir",
        description: "Événements programmés",
        value: upcomingEvents,
        trend: {
          value:
            upcomingEvents > 20
              ? 25.4
              : upcomingEvents > 10
              ? 15.7
              : upcomingEvents > 3
              ? 8.2
              : upcomingEvents > 0
              ? 3.1
              : 0,
          isPositive: upcomingEvents > 0,
          label:
            upcomingEvents > 20
              ? "Calendrier très chargé"
              : upcomingEvents > 10
              ? "Planning rempli"
              : upcomingEvents > 3
              ? "Prochains événements"
              : upcomingEvents > 0
              ? "Quelques événements"
              : "Aucun événement prévu",
        },
        footer: {
          primary:
            upcomingEvents > 20
              ? "Calendrier très chargé"
              : upcomingEvents > 10
              ? "Planning rempli"
              : upcomingEvents > 3
              ? "Prochains événements"
              : upcomingEvents > 0
              ? "Quelques événements"
              : "Aucun événement prévu",
          secondary: "événements programmés",
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
        id: "participants",
        title: "Participants",
        description: "Total des inscriptions",
        value: totalParticipants,
        trend: {
          value:
            totalParticipants > 1000
              ? 22.8
              : totalParticipants > 500
              ? 16.4
              : totalParticipants > 100
              ? 9.7
              : totalParticipants > 0
              ? 4.3
              : 0,
          isPositive: totalParticipants > 0,
          label:
            totalParticipants > 1000
              ? "Très populaire"
              : totalParticipants > 500
              ? "Bonne affluence"
              : totalParticipants > 100
              ? "Participation correcte"
              : totalParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
        },
        footer: {
          primary:
            totalParticipants > 1000
              ? "Très populaire"
              : totalParticipants > 500
              ? "Bonne affluence"
              : totalParticipants > 100
              ? "Participation correcte"
              : totalParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
          secondary: "participants inscrits",
        },
      },
    ],
    [totalEvents, upcomingEvents, averageParticipants, totalParticipants]
  );
}
