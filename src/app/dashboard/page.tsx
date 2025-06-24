import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards, type CardData } from "@/components/section-cards"; // ✅ Import du type
import { SiteHeader } from "@/components/site-header";

import data from "./data.json";

export default function Page() {
  // ✅ Fausses données pour le dashboard
  const dashboardCardsData: CardData[] = [
    {
      id: "total-revenue",
      title: "Revenus totaux",
      description: "Revenus totaux",
      value: "€45,231.89",
      trend: {
        value: 20.1,
        isPositive: true,
        label: "Croissance mensuelle",
      },
      footer: {
        primary: "Croissance mensuelle",
        secondary: "par rapport au mois dernier",
      },
    },
    {
      id: "total-users",
      title: "Utilisateurs",
      description: "Utilisateurs totaux",
      value: 2350,
      trend: {
        value: 15.3,
        isPositive: true,
        label: "Nouveaux utilisateurs",
      },
      footer: {
        primary: "Nouveaux utilisateurs",
        secondary: "utilisateurs enregistrés",
      },
    },
    {
      id: "total-events",
      title: "Événements",
      description: "Événements totaux",
      value: 156,
      trend: {
        value: 8.7,
        isPositive: true,
        label: "Événements actifs",
      },
      footer: {
        primary: "Événements actifs",
        secondary: "événements programmés",
      },
    },
    {
      id: "conversion-rate",
      title: "Taux de conversion",
      description: "Taux de conversion",
      value: "12.5%",
      trend: {
        value: -2.4,
        isPositive: false,
        label: "Optimisation nécessaire",
      },
      footer: {
        primary: "Optimisation nécessaire",
        secondary: "visiteurs convertis en clients",
      },
    },
  ];

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* ✅ SectionCards avec les données */}
            <SectionCards
              cards={dashboardCardsData}
              gridCols={4}
              className="mb-2"
            />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  );
}
