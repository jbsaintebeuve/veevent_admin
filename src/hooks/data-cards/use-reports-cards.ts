import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UseReportsCardsProps {
  totalReports: number;
  inappropriateContentCount: number;
  spamCount: number;
  harassmentCount: number;
}

export function useReportsCards({
  totalReports,
  inappropriateContentCount,
  spamCount,
  harassmentCount,
}: UseReportsCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "total",
        title: "Total signalements",
        description: "Tous les signalements",
        value: totalReports,
        trend: {
          value:
            totalReports > 50
              ? 15.2
              : totalReports > 20
              ? 8.7
              : totalReports > 5
              ? 3.4
              : 0,
          isPositive: totalReports > 0,
          label:
            totalReports > 50
              ? "Beaucoup de signalements"
              : totalReports > 20
              ? "Signalements modérés"
              : totalReports > 5
              ? "Quelques signalements"
              : "Aucun signalement",
        },
        footer: {
          primary:
            totalReports > 50
              ? "Beaucoup de signalements"
              : totalReports > 20
              ? "Signalements modérés"
              : totalReports > 5
              ? "Quelques signalements"
              : "Aucun signalement",
          secondary: totalReports === 1 ? "signalement" : "signalements",
        },
      },
      {
        id: "inappropriate",
        title: "Contenu inapproprié",
        description: "Signalements de contenu inapproprié",
        value: inappropriateContentCount,
        trend: {
          value:
            inappropriateContentCount > 10
              ? 12.8
              : inappropriateContentCount > 5
              ? 6.3
              : inappropriateContentCount > 0
              ? 2.1
              : 0,
          isPositive: inappropriateContentCount > 0,
          label:
            inappropriateContentCount > 10
              ? "Problème important"
              : inappropriateContentCount > 5
              ? "Problème modéré"
              : inappropriateContentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
        },
        footer: {
          primary:
            inappropriateContentCount > 10
              ? "Problème important"
              : inappropriateContentCount > 5
              ? "Problème modéré"
              : inappropriateContentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
          secondary:
            inappropriateContentCount === 1 ? "signalement" : "signalements",
        },
      },
      {
        id: "spam",
        title: "Spam",
        description: "Signalements de spam",
        value: spamCount,
        trend: {
          value:
            spamCount > 15
              ? 18.5
              : spamCount > 8
              ? 10.2
              : spamCount > 0
              ? 4.7
              : 0,
          isPositive: spamCount > 0,
          label:
            spamCount > 15
              ? "Spam important"
              : spamCount > 8
              ? "Spam modéré"
              : spamCount > 0
              ? "Quelques spams"
              : "Aucun spam",
        },
        footer: {
          primary:
            spamCount > 15
              ? "Spam important"
              : spamCount > 8
              ? "Spam modéré"
              : spamCount > 0
              ? "Quelques spams"
              : "Aucun spam",
          secondary: spamCount === 1 ? "signalement" : "signalements",
        },
      },
      {
        id: "harassment",
        title: "Harcèlement",
        description: "Signalements de harcèlement",
        value: harassmentCount,
        trend: {
          value:
            harassmentCount > 5
              ? 14.3
              : harassmentCount > 2
              ? 7.8
              : harassmentCount > 0
              ? 3.2
              : 0,
          isPositive: harassmentCount > 0,
          label:
            harassmentCount > 5
              ? "Harcèlement important"
              : harassmentCount > 2
              ? "Harcèlement modéré"
              : harassmentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
        },
        footer: {
          primary:
            harassmentCount > 5
              ? "Harcèlement important"
              : harassmentCount > 2
              ? "Harcèlement modéré"
              : harassmentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
          secondary: harassmentCount === 1 ? "signalement" : "signalements",
        },
      },
    ],
    [totalReports, inappropriateContentCount, spamCount, harassmentCount]
  );
}
