"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
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

export default function CitiesPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: citiesResponse,
    isLoading,
    error,
  } = useQuery<CitiesApiResponse>({
    queryKey: ["cities"],
    queryFn: () => fetchCities(getToken() || undefined),
  });

  const cities = citiesResponse?._embedded?.cityResponses || [];

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) =>
      deleteCity(deleteUrl, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
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
        value: cities?.length || 0,
        trend: {
          value:
            cities && cities.length > 20
              ? 18.7
              : cities && cities.length > 10
              ? 12.5
              : cities && cities.length > 5
              ? 5.2
              : cities && cities.length > 0
              ? 2.1
              : 0,
          isPositive: !!(cities && cities.length > 0),
          label:
            cities && cities.length > 20
              ? "Réseau très développé"
              : cities && cities.length > 10
              ? "Croissance stable"
              : cities && cities.length > 5
              ? "En développement"
              : cities && cities.length > 0
              ? "Premières villes"
              : "Aucune ville",
        },
        footer: {
          primary:
            cities && cities.length > 20
              ? "Réseau très développé"
              : cities && cities.length > 10
              ? "Croissance stable"
              : cities && cities.length > 5
              ? "En développement"
              : cities && cities.length > 0
              ? "Premières villes"
              : "Aucune ville",
          secondary: cities?.length === 1 ? "ville" : "villes",
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
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg border p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-4" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>

              <div className="px-4 lg:px-6">
                <div className="bg-card rounded-lg border p-6">
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 flex-1" />
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
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
          </div>
        </div>
      </div>
    </>
  );
}
