import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UseCitiesCardsProps {
  totalCities: number;
  totalEvents: number;
  totalCountries: number;
}

export function useCitiesCards({
  totalCities,
  totalEvents,
  totalCountries,
}: UseCitiesCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "cities",
        title: "Total des villes",
        description: "Toutes les villes disponibles",
        value: totalCities,
        trend: {
          value:
            totalCities > 20
              ? 18.7
              : totalCities > 10
              ? 12.5
              : totalCities > 5
              ? 5.2
              : totalCities > 0
              ? 2.1
              : 0,
          isPositive: !!(totalCities && totalCities > 0),
          label:
            totalCities > 20
              ? "Réseau très développé"
              : totalCities > 10
              ? "Croissance stable"
              : totalCities > 5
              ? "En développement"
              : totalCities > 0
              ? "Premières villes"
              : "Aucune ville",
        },
        footer: {
          primary:
            totalCities > 20
              ? "Réseau très développé"
              : totalCities > 10
              ? "Croissance stable"
              : totalCities > 5
              ? "En développement"
              : totalCities > 0
              ? "Premières villes"
              : "Aucune ville",
          secondary: totalCities === 1 ? "ville" : "villes",
        },
      },
      {
        id: "events",
        title: "Total événements",
        description: "Tous les événements",
        value: totalEvents,
        trend: {
          value:
            totalEvents > 100
              ? 25.4
              : totalEvents > 50
              ? 18.2
              : totalEvents > 20
              ? 12.1
              : totalEvents > 5
              ? 6.8
              : totalEvents > 0
              ? 2.1
              : 0,
          isPositive: totalEvents > 0,
          label:
            totalEvents > 100
              ? "Très actif"
              : totalEvents > 50
              ? "Bonne activité"
              : totalEvents > 20
              ? "Activité modérée"
              : totalEvents > 5
              ? "Démarrage"
              : totalEvents > 0
              ? "Premiers événements"
              : "Aucun événement",
        },
        footer: {
          primary:
            totalEvents > 100
              ? "Très actif"
              : totalEvents > 50
              ? "Bonne activité"
              : totalEvents > 20
              ? "Activité modérée"
              : totalEvents > 5
              ? "Démarrage"
              : totalEvents > 0
              ? "Premiers événements"
              : "Aucun événement",
          secondary: totalEvents === 1 ? "événement" : "événements",
        },
      },
      {
        id: "countries",
        title: "Pays couverts",
        description: "Nombre de pays",
        value: totalCountries,
        trend: {
          value:
            totalCountries > 10
              ? 15.7
              : totalCountries > 5
              ? 10.2
              : totalCountries > 2
              ? 5.8
              : totalCountries > 0
              ? 2.3
              : 0,
          isPositive: totalCountries > 0,
          label:
            totalCountries > 10
              ? "International"
              : totalCountries > 5
              ? "Multi-pays"
              : totalCountries > 2
              ? "Plusieurs pays"
              : totalCountries > 0
              ? "Un pays"
              : "Aucun pays",
        },
        footer: {
          primary:
            totalCountries > 10
              ? "International"
              : totalCountries > 5
              ? "Multi-pays"
              : totalCountries > 2
              ? "Plusieurs pays"
              : totalCountries > 0
              ? "Un pays"
              : "Aucun pays",
          secondary: totalCountries === 1 ? "pays" : "pays",
        },
      },
    ],
    [totalCities, totalEvents, totalCountries]
  );
}
