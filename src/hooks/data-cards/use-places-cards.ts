import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UsePlacesCardsProps {
  totalPlaces: number;
  activePlaces: number;
  totalEvents: number;
  totalPastEvents: number;
}

export function usePlacesCards({
  totalPlaces,
  activePlaces,
  totalEvents,
  totalPastEvents,
}: UsePlacesCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "total",
        title: "Total des lieux",
        description: "Tous les lieux disponibles",
        value: totalPlaces,
        trend: {
          value:
            totalPlaces > 50
              ? 18.7
              : totalPlaces > 25
              ? 12.4
              : totalPlaces > 10
              ? 8.1
              : totalPlaces > 3
              ? 4.5
              : totalPlaces > 0
              ? 2.1
              : 0,
          isPositive: totalPlaces > 0,
          label:
            totalPlaces > 50
              ? "Réseau très développé"
              : totalPlaces > 25
              ? "Bon réseau de lieux"
              : totalPlaces > 10
              ? "Réseau en croissance"
              : totalPlaces > 3
              ? "Base de lieux solide"
              : totalPlaces > 0
              ? "Premiers lieux"
              : "Aucun lieu",
        },
        footer: {
          primary:
            totalPlaces > 50
              ? "Réseau très développé"
              : totalPlaces > 25
              ? "Bon réseau de lieux"
              : totalPlaces > 10
              ? "Réseau en croissance"
              : totalPlaces > 3
              ? "Base de lieux solide"
              : totalPlaces > 0
              ? "Premiers lieux"
              : "Aucun lieu",
          secondary:
            totalPlaces === 1 ? "lieu disponible" : "lieux disponibles",
        },
      },
      {
        id: "active",
        title: "Lieux actifs",
        description: "Avec événements en cours",
        value: activePlaces,
        trend: {
          value:
            activePlaces > 20
              ? 25.3
              : activePlaces > 10
              ? 16.8
              : activePlaces > 5
              ? 9.4
              : activePlaces > 0
              ? 5.2
              : 0,
          isPositive: activePlaces > 0,
          label:
            activePlaces > 20
              ? "Très actif"
              : activePlaces > 10
              ? "Bonne activité"
              : activePlaces > 5
              ? "Activité modérée"
              : activePlaces > 0
              ? "Quelques lieux actifs"
              : "Aucun lieu actif",
        },
        footer: {
          primary:
            activePlaces > 20
              ? "Très actif"
              : activePlaces > 10
              ? "Bonne activité"
              : activePlaces > 5
              ? "Activité modérée"
              : activePlaces > 0
              ? "Quelques lieux actifs"
              : "Aucun lieu actif",
          secondary: "lieux avec événements",
        },
      },
      {
        id: "events",
        title: "Événements totaux",
        description: "Tous événements confondus",
        value: totalEvents + totalPastEvents,
        trend: {
          value:
            totalEvents + totalPastEvents > 200
              ? 22.9
              : totalEvents + totalPastEvents > 100
              ? 15.6
              : totalEvents + totalPastEvents > 50
              ? 10.3
              : totalEvents + totalPastEvents > 10
              ? 6.7
              : totalEvents + totalPastEvents > 0
              ? 3.1
              : 0,
          isPositive: totalEvents + totalPastEvents > 0,
          label:
            totalEvents + totalPastEvents > 200
              ? "Très forte utilisation"
              : totalEvents + totalPastEvents > 100
              ? "Bonne utilisation"
              : totalEvents + totalPastEvents > 50
              ? "Usage régulier"
              : totalEvents + totalPastEvents > 10
              ? "Usage modéré"
              : totalEvents + totalPastEvents > 0
              ? "Premiers événements"
              : "Aucun événement",
        },
        footer: {
          primary:
            totalEvents + totalPastEvents > 200
              ? "Très forte utilisation"
              : totalEvents + totalPastEvents > 100
              ? "Bonne utilisation"
              : totalEvents + totalPastEvents > 50
              ? "Usage régulier"
              : totalEvents + totalPastEvents > 10
              ? "Usage modéré"
              : totalEvents + totalPastEvents > 0
              ? "Premiers événements"
              : "Aucun événement",
          secondary: "événements organisés",
        },
      },
    ],
    [totalPlaces, activePlaces, totalEvents, totalPastEvents]
  );
}
