"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CreatePlaceDialog } from "@/components/create-dialogs/create-place-dialog";
import { ModifyPlaceDialog } from "@/components/modify-dialogs/modify-place-dialog";
import { fetchPlaces, deletePlace } from "@/lib/fetch-places";
import { useAuth } from "@/hooks/use-auth";
import { PlacesApiResponse } from "@/types/place";
import { PlacesTable } from "@/components/tables/places-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";

export default function PlacesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: placesResponse,
    isLoading,
    error,
  } = useQuery<PlacesApiResponse>({
    queryKey: ["places", currentPage],
    queryFn: () =>
      fetchPlaces(getToken() || undefined, currentPage - 1, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const places = placesResponse?._embedded?.placeResponses || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => deletePlace(deleteUrl, getToken() || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = (deleteUrl: string, name: string) => {
    deleteMutation.mutate(deleteUrl);
  };

  // Calculs optimisés avec useMemo
  const { totalEvents, totalPastEvents, activePlaces } = useMemo(() => {
    const totalEvents =
      places?.reduce((sum, place) => sum + place.eventsCount, 0) || 0;
    const totalPastEvents =
      places?.reduce((sum, place) => sum + place.eventsPastCount, 0) || 0;
    const activePlaces =
      places?.filter((place) => place.eventsCount > 0).length || 0;
    return { totalEvents, totalPastEvents, activePlaces };
  }, [places]);

  // Données pour SectionCards
  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "total",
        title: "Total des lieux",
        description: "Tous les lieux disponibles",
        value: placesResponse?.page?.totalElements || 0,
        trend: {
          value:
            (placesResponse?.page?.totalElements || 0) > 50
              ? 18.7
              : (placesResponse?.page?.totalElements || 0) > 25
              ? 12.4
              : (placesResponse?.page?.totalElements || 0) > 10
              ? 8.1
              : (placesResponse?.page?.totalElements || 0) > 3
              ? 4.5
              : (placesResponse?.page?.totalElements || 0) > 0
              ? 2.1
              : 0,
          isPositive: !!(
            placesResponse?.page?.totalElements &&
            placesResponse.page.totalElements > 0
          ),
          label:
            (placesResponse?.page?.totalElements || 0) > 50
              ? "Réseau très développé"
              : (placesResponse?.page?.totalElements || 0) > 25
              ? "Bon réseau de lieux"
              : (placesResponse?.page?.totalElements || 0) > 10
              ? "Réseau en croissance"
              : (placesResponse?.page?.totalElements || 0) > 3
              ? "Base de lieux solide"
              : (placesResponse?.page?.totalElements || 0) > 0
              ? "Premiers lieux"
              : "Aucun lieu",
        },
        footer: {
          primary:
            (placesResponse?.page?.totalElements || 0) > 50
              ? "Réseau très développé"
              : (placesResponse?.page?.totalElements || 0) > 25
              ? "Bon réseau de lieux"
              : (placesResponse?.page?.totalElements || 0) > 10
              ? "Réseau en croissance"
              : (placesResponse?.page?.totalElements || 0) > 3
              ? "Base de lieux solide"
              : (placesResponse?.page?.totalElements || 0) > 0
              ? "Premiers lieux"
              : "Aucun lieu",
          secondary:
            (placesResponse?.page?.totalElements || 0) === 1
              ? "lieu disponible"
              : "lieux disponibles",
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
    [places, activePlaces, totalEvents, totalPastEvents]
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
              Erreur lors du chargement des lieux. Veuillez réessayer.
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
                <h1 className="text-3xl font-bold tracking-tight">Lieux</h1>
                <p className="text-muted-foreground">
                  Gérez les lieux où se déroulent vos événements
                </p>
              </div>
              <CreatePlaceDialog />
            </div>

            {/* SectionCards */}
            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            {/* Nouveau tableau */}
            <PlacesTable
              data={places}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
            />

            {/* Pagination */}
            {placesResponse?.page && placesResponse.page.totalPages > 1 && (
              <div className="flex justify-center px-4 lg:px-6">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={placesResponse.page.totalPages}
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
