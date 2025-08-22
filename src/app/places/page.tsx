"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CreatePlaceDialog } from "@/components/create-dialogs/create-place-dialog";
import { fetchPlaces, deletePlace } from "@/services/place-service";
import { useAuth } from "@/hooks/use-auth";
import { PlacesApiResponse } from "@/types/place";
import { PlacesTable } from "@/components/tables/places-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { getDeleteErrorMessage, EntityTypes } from "@/utils/error-messages";
import { usePlacesCards } from "@/hooks/data-cards/use-places-cards";

export default function PlacesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { token } = useAuth();

  const {
    data: placesResponse,
    isLoading,
    error,
  } = useQuery<PlacesApiResponse>({
    queryKey: ["places", currentPage],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchPlaces(token, currentPage - 1, pageSize);
    },
    staleTime: 5 * 60 * 1000,
  });

  const places = placesResponse?._embedded?.placeResponses || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => deletePlace(deleteUrl, token || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu supprimé avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur de suppression:", error);
      const errorMessage = getDeleteErrorMessage(error, EntityTypes.PLACE);
      toast.error(errorMessage);
    },
  });

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
      console.log(
        `🗑️ Tentative de suppression du lieu "${name}" via URL:`,
        deleteUrl
      );
      deleteMutation.mutate(deleteUrl);
    },
    [deleteMutation]
  );

  const { totalEvents, totalPastEvents, activePlaces } = useMemo(() => {
    const totalEvents =
      places?.reduce((sum, place) => sum + place.eventsCount, 0) || 0;
    const totalPastEvents =
      places?.reduce((sum, place) => sum + place.eventsPastCount, 0) || 0;
    const activePlaces =
      places?.filter((place) => place.eventsCount > 0).length || 0;
    return { totalEvents, totalPastEvents, activePlaces };
  }, [places]);

  const cardsData = usePlacesCards({
    totalPlaces: placesResponse?.page?.totalElements || 0,
    activePlaces,
    totalEvents,
    totalPastEvents,
  });

  if (isLoading) {
    return <PageSkeleton />;
  }

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Lieux</h1>
                <p className="text-muted-foreground">
                  Gérez les lieux où se déroulent vos événements
                </p>
              </div>
              <CreatePlaceDialog />
            </div>

            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            <PlacesTable
              data={places}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
            />

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
