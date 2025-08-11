import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UseCategoriesCardsProps {
  totalCategories: number;
  trendingCount: number;
  standardCount: number;
}

export function useCategoriesCards({
  totalCategories,
  trendingCount,
  standardCount,
}: UseCategoriesCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "categories",
        title: "Total catégories",
        description: "Total catégories",
        value: totalCategories,
        trend: {
          value:
            totalCategories > 15
              ? 15.2
              : totalCategories > 8
              ? 8.7
              : totalCategories > 3
              ? 3.4
              : totalCategories > 0
              ? 1.2
              : 0,
          isPositive: !!(totalCategories && totalCategories > 0),
          label:
            totalCategories > 15
              ? "Très diversifié"
              : totalCategories > 8
              ? "Bonne variété"
              : totalCategories > 3
              ? "Quelques catégories"
              : totalCategories > 0
              ? "Démarrage"
              : "Aucune catégorie",
        },
        footer: {
          primary:
            totalCategories > 15
              ? "Très diversifié"
              : totalCategories > 8
              ? "Bonne variété"
              : totalCategories > 3
              ? "Quelques catégories"
              : totalCategories > 0
              ? "Démarrage"
              : "Aucune catégorie",
          secondary: "catégories créées",
        },
      },
      {
        id: "trending",
        title: "Tendances",
        description: "Catégories populaires",
        value: trendingCount,
        trend: {
          value:
            trendingCount > 5
              ? 12.8
              : trendingCount > 2
              ? 7.4
              : trendingCount > 0
              ? 3.1
              : 0,
          isPositive: trendingCount > 0,
          label:
            trendingCount > 5
              ? "Très populaire"
              : trendingCount > 2
              ? "Populaire"
              : trendingCount > 0
              ? "Quelques tendances"
              : "Aucune tendance",
        },
        footer: {
          primary:
            trendingCount > 5
              ? "Très populaire"
              : trendingCount > 2
              ? "Populaire"
              : trendingCount > 0
              ? "Quelques tendances"
              : "Aucune tendance",
          secondary: "catégories tendance",
        },
      },
      {
        id: "standard",
        title: "Standard",
        description: "Catégories classiques",
        value: standardCount,
        trend: {
          value:
            standardCount > 10
              ? 8.9
              : standardCount > 5
              ? 5.2
              : standardCount > 0
              ? 2.1
              : 0,
          isPositive: standardCount > 0,
          label:
            standardCount > 10
              ? "Bien établi"
              : standardCount > 5
              ? "Établi"
              : standardCount > 0
              ? "Quelques standards"
              : "Aucun standard",
        },
        footer: {
          primary:
            standardCount > 10
              ? "Bien établi"
              : standardCount > 5
              ? "Établi"
              : standardCount > 0
              ? "Quelques standards"
              : "Aucun standard",
          secondary: "catégories standard",
        },
      },
    ],
    [totalCategories, trendingCount, standardCount]
  );
}
