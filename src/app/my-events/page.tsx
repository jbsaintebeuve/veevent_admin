"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchUserEvents } from "@/lib/fetch-events";
import { useAuth } from "@/hooks/use-auth";
import { EventsApiResponse } from "@/types/event";
import { EventsTable } from "@/components/tables/events-table";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/page-skeleton";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";

export default function MyEventsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { user, getToken } = useAuth();

  // Récupérer le lien HAL des événements de l'utilisateur
  const userEventsUrl = user?._links?.events?.href;

  const pageSize = 10;

  const emptyEventsApiResponse: EventsApiResponse = {
    _embedded: { eventSummaryResponses: [] },
    _links: {},
    page: {
      size: 10,
      totalElements: 0,
      totalPages: 0,
      number: 0,
    },
  };

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<EventsApiResponse>({
    queryKey: ["my-events", user?.id],
    queryFn: () =>
      fetchUserEvents(userEventsUrl!, getToken() || undefined, 0, 1000), // Récupérer tous les événements
    enabled: !!user?.id && !!userEventsUrl,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];
  const pageInfo = eventsResponse?.page;

  // 🔧 Détection si l'API supporte la pagination ou non
  const apiSupportsPagination =
    pageInfo && pageInfo.totalElements !== undefined;

  // Si l'API ne supporte pas la pagination, on fait de la pagination côté client
  const paginatedEvents = useMemo(() => {
    if (apiSupportsPagination) {
      return events; // L'API gère déjà la pagination
    }

    // Pagination côté client
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return events.slice(startIndex, endIndex);
  }, [events, currentPage, pageSize, apiSupportsPagination]);

  // Calcul des pages pour pagination côté client
  const clientSidePagination = useMemo(() => {
    if (apiSupportsPagination) return null;

    const totalPages = Math.ceil(events.length / pageSize);
    return {
      totalPages,
      totalElements: events.length,
      currentPage,
    };
  }, [events.length, pageSize, currentPage, apiSupportsPagination]);

  // Statistiques optimisées avec useMemo - une seule boucle au lieu de 4
  const { totalEvents, upcomingCount, completedCount, averageParticipants } =
    useMemo(() => {
      // Utiliser tous les événements pour les stats, pas seulement la page courante
      const allEvents = apiSupportsPagination ? events : events;
      const stats = {
        totalEvents: apiSupportsPagination
          ? pageInfo?.totalElements || events.length
          : events.length,
        upcomingCount: 0,
        completedCount: 0,
        averageParticipants: 0,
      };
      let totalParticipants = 0;
      allEvents.forEach((event) => {
        switch (event.status) {
          case "NOT_STARTED":
            stats.upcomingCount++;
            break;
          case "COMPLETED":
            stats.completedCount++;
            break;
        }
        totalParticipants += event.currentParticipants;
      });
      stats.averageParticipants =
        allEvents.length > 0
          ? Math.round(totalParticipants / allEvents.length)
          : 0;
      return stats;
    }, [events, pageInfo?.totalElements, apiSupportsPagination]);

  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "total",
        title: "Total événements",
        description: "Nombre total d'événements organisés",
        value: totalEvents,
        trend: {
          value: totalEvents > 10 ? 12.5 : totalEvents > 0 ? 3.2 : 0,
          isPositive: totalEvents > 0,
          label:
            totalEvents > 10
              ? "Organisateur actif"
              : totalEvents > 0
              ? "Quelques événements"
              : "Aucun événement",
        },
        footer: {
          primary: totalEvents === 1 ? "événement" : "événements",
          secondary: "organisés par vous",
        },
      },
      {
        id: "upcoming",
        title: "À venir",
        description: "Événements à venir",
        value: upcomingCount,
        trend: {
          value: upcomingCount > 5 ? 8.7 : upcomingCount > 0 ? 2.1 : 0,
          isPositive: upcomingCount > 0,
          label:
            upcomingCount > 5
              ? "Beaucoup à venir"
              : upcomingCount > 0
              ? "Préparez-vous"
              : "Aucun à venir",
        },
        footer: {
          primary: upcomingCount === 1 ? "événement" : "événements",
          secondary: "à venir",
        },
      },
      {
        id: "average-participants",
        title: "Participants moyens",
        description: "Moyenne de participants par événement",
        value: averageParticipants,
        trend: {
          value: averageParticipants,
          isPositive: averageParticipants > 0,
          label:
            averageParticipants > 100
              ? "Très populaire"
              : averageParticipants > 50
              ? "Bonne affluence"
              : averageParticipants > 10
              ? "Participation correcte"
              : averageParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
        },
        footer: {
          primary: averageParticipants === 1 ? "participant" : "participants",
          secondary: "par événement",
        },
      },
      {
        id: "completed",
        title: "Terminés",
        description: "Événements terminés",
        value: completedCount,
        trend: {
          value: completedCount > 2 ? 4.2 : completedCount > 0 ? 1.1 : 0,
          isPositive: completedCount > 0,
          label:
            completedCount > 2
              ? "Bravo !"
              : completedCount > 0
              ? "Quelques succès"
              : "Aucun terminé",
        },
        footer: {
          primary: completedCount === 1 ? "événement" : "événements",
          secondary: "terminés",
        },
      },
    ],
    [totalEvents, upcomingCount, completedCount, averageParticipants]
  );

  const handleDelete = (deleteUrl: string, name: string) => {
    // TODO: Implémenter la suppression d'événement
    console.log("Supprimer événement:", name, deleteUrl);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Vérifier si le lien HAL est disponible (cas spécifique aux liens HAL)
  if (!userEventsUrl) {
    return null;
  }

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={4}
        tableRowsCount={5}
        tableColumnsCount={8}
        showSearchBar={true}
        showTableActions={true}
        showActionButton={false}
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
            <AlertDescription className="flex items-center justify-between">
              <span>
                Erreur lors du chargement de vos événements.
                {!userEventsUrl &&
                  " Impossible de récupérer le lien vers vos événements."}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-4"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
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
            {/* ✅ Header Section */}
            <div className="flex items-center justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Mes événements
                </h1>
                <p className="text-muted-foreground">
                  Retrouvez ici tous les événements que vous organisez
                </p>
              </div>
              <CreateEventDialog />
            </div>

            {/* ✅ SectionCards */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* ✅ Nouveau tableau */}
            <EventsTable
              data={paginatedEvents || []}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={false}
              hideDelete={true}
            />

            {/* Pagination adaptative */}
            {(() => {
              if (apiSupportsPagination) {
                // Pagination serveur
                return pageInfo && pageInfo.totalPages > 1 ? (
                  <div className="px-4 lg:px-6">
                    <PaginationWrapper
                      currentPage={currentPage}
                      totalPages={pageInfo.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                ) : null;
              } else {
                // Pagination client
                return clientSidePagination &&
                  clientSidePagination.totalPages > 1 ? (
                  <div className="px-4 lg:px-6">
                    <PaginationWrapper
                      currentPage={currentPage}
                      totalPages={clientSidePagination.totalPages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                ) : null;
              }
            })()}
          </div>
        </div>
      </div>
    </>
  );
}
