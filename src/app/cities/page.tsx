"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { useCitiesCards } from "@/hooks/data-cards/use-cities-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CreateCityDialog } from "@/components/create-dialogs/create-city-dialog";
import { fetchCities, deleteCity } from "@/services/city-service";
import { useAuth } from "@/hooks/use-auth";
import { City, CitiesApiResponse } from "@/types/city";
import { CitiesTable } from "@/components/tables/cities-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { getDeleteErrorMessage, EntityTypes } from "@/utils/error-messages";

export default function CitiesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const {
    data: citiesResponse,
    isLoading,
    error,
  } = useQuery<CitiesApiResponse>({
    queryKey: ["cities", currentPage],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchCities(token, currentPage - 1, pageSize);
    },
    enabled: !!token,
  });

  const cities = citiesResponse?._embedded?.cityResponses || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => {
      if (!token) throw new Error("Token manquant");
      return deleteCity(deleteUrl, token);
    },
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

  const totalCities = citiesResponse?.page?.totalElements || 0;

  const cardsData = useCitiesCards({
    totalCities,
    totalEvents,
    totalCountries,
  });

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Villes</h1>
                <p className="text-muted-foreground">
                  Gérez les villes où se déroulent vos événements
                </p>
              </div>
              <CreateCityDialog cities={cities} />
            </div>

            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            <CitiesTable
              data={cities}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
            />

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
