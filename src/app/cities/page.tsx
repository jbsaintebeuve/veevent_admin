"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CreateCityDialog } from "@/components/create-dialogs/create-city-dialog";
import { fetchCities, deleteCity } from "@/lib/fetch-cities";
import { useAuth } from "@/hooks/use-auth";
import { ModifyCityDialog } from "@/components/modify-dialogs/modify-city-dialog";
import { City, CitiesApiResponse } from "@/types/city";
import { CitiesTable } from "@/components/tables/cities-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { getDeleteErrorMessage, EntityTypes } from "@/lib/error-messages";

export default function CitiesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: citiesResponse,
    isLoading,
    error,
  } = useQuery<CitiesApiResponse>({
    queryKey: ["cities", currentPage],
    queryFn: () =>
      fetchCities(getToken() || undefined, currentPage - 1, pageSize),
  });

  const cities = citiesResponse?._embedded?.cityResponses || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) =>
      deleteCity(deleteUrl, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville supprimée avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur de suppression:", error);
      const errorMessage = getDeleteErrorMessage(error, EntityTypes.CITY);
      toast.error(errorMessage);
    },
  });

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
      console.log(
        `🗑️ Tentative de suppression de "${name}" via URL:`,
        deleteUrl
      );
      deleteMutation.mutate(deleteUrl);
    },
    [deleteMutation]
  );

  // Calculs optimisés avec useMemo - une seule boucle au lieu de 4
  const { totalEvents, totalPastEvents, totalCountries, activeCities } =
    useMemo(() => {
      const stats = {
        totalEvents: 0,
        totalPastEvents: 0,
        totalCountries: 0,
        activeCities: 0,
      };

      const countries = new Set<string>();

      cities.forEach((city: City) => {
        stats.totalEvents += city.eventsCount;
        stats.totalPastEvents += city.eventsPastCount;
        countries.add(city.country);
        if (city.eventsCount > 0) {
          stats.activeCities++;
        }
      });

      stats.totalCountries = countries.size;

      return stats;
    }, [cities]);

  // Données pour SectionCards optimisées avec useMemo
  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "cities",
        title: "Total des villes",
        description: "Toutes les villes disponibles",
        value: citiesResponse?.page?.totalElements || 0,
        trend: {
          value:
            (citiesResponse?.page?.totalElements || 0) > 20
              ? 18.7
              : (citiesResponse?.page?.totalElements || 0) > 10
              ? 12.5
              : (citiesResponse?.page?.totalElements || 0) > 5
              ? 5.2
              : (citiesResponse?.page?.totalElements || 0) > 0
              ? 2.1
              : 0,
          isPositive: !!(
            citiesResponse?.page?.totalElements &&
            citiesResponse.page.totalElements > 0
          ),
          label:
            (citiesResponse?.page?.totalElements || 0) > 20
              ? "Réseau très développé"
              : (citiesResponse?.page?.totalElements || 0) > 10
              ? "Croissance stable"
              : (citiesResponse?.page?.totalElements || 0) > 5
              ? "En développement"
              : (citiesResponse?.page?.totalElements || 0) > 0
              ? "Premières villes"
              : "Aucune ville",
        },
        footer: {
          primary:
            (citiesResponse?.page?.totalElements || 0) > 20
              ? "Réseau très développé"
              : (citiesResponse?.page?.totalElements || 0) > 10
              ? "Croissance stable"
              : (citiesResponse?.page?.totalElements || 0) > 5
              ? "En développement"
              : (citiesResponse?.page?.totalElements || 0) > 0
              ? "Premières villes"
              : "Aucune ville",
          secondary:
            (citiesResponse?.page?.totalElements || 0) === 1
              ? "ville"
              : "villes",
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
    [cities, totalEvents, totalCountries]
  );

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={3}
        tableRowsCount={5}
        tableColumnsCount={6}
        showSearchBar={true}
        showTableActions={true}
      />
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des villes. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Villes</h1>
                <p className="text-muted-foreground">
                  Gérez les villes où se déroulent vos événements
                </p>
              </div>
              <CreateCityDialog cities={cities} />
            </div>

            {/* SectionCards */}
            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            {/* Nouveau tableau */}
            <CitiesTable
              data={cities}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
            />

            {/* Pagination */}
            {citiesResponse?.page && citiesResponse.page.totalPages > 1 && (
              <div className="flex justify-center px-4 lg:px-6">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={citiesResponse.page.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
