"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { fetchEvents, deleteEvent } from "@/lib/fetch-events";
import { useAuth } from "@/hooks/use-auth";
import { EventsApiResponse } from "@/types/event";
import { EventsTable } from "@/components/tables/events-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useQuery<EventsApiResponse>({
    queryKey: ["events", currentPage],
    queryFn: () =>
      fetchEvents(getToken() || undefined, currentPage - 1, pageSize),
  });

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => deleteEvent(deleteUrl, getToken() || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // ✅ Filtrage des événements avec recherche - optimisé avec useMemo
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    if (!search.trim()) return events;

    const searchLower = search.toLowerCase();
    return events.filter(
      (event) =>
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.cityName.toLowerCase().includes(searchLower) ||
        event.placeName.toLowerCase().includes(searchLower) ||
        event.categories.some((cat) =>
          cat.name.toLowerCase().includes(searchLower)
        )
    );
  }, [events, search]);

  const formatDateTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("fr-FR"),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  }, []);

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
      deleteMutation.mutate(deleteUrl);
    },
    [deleteMutation]
  );

  // Calculs des statistiques optimisés avec useMemo - une seule boucle au lieu de 4
  const {
    upcomingEvents,
    completedEvents,
    totalParticipants,
    averageParticipants,
  } = useMemo(() => {
    const stats = {
      upcomingEvents: 0,
      completedEvents: 0,
      totalParticipants: 0,
      averageParticipants: 0,
    };
    let eventCount = 0;
    events.forEach((event) => {
      switch (event.status) {
        case "NOT_STARTED":
          stats.upcomingEvents++;
          break;
        case "COMPLETED":
          stats.completedEvents++;
          break;
      }
      stats.totalParticipants += event.currentParticipants;
      eventCount++;
    });
    stats.averageParticipants =
      eventCount > 0 ? Math.round(stats.totalParticipants / eventCount) : 0;
    return stats;
  }, [events]);

  // ✅ Données pour SectionCards optimisées avec useMemo
  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "total",
        title: "Total événements",
        description: "Tous les événements",
        value: eventsResponse?.page?.totalElements || 0,
        trend: {
          value:
            (eventsResponse?.page?.totalElements || 0) > 50
              ? 18.5
              : (eventsResponse?.page?.totalElements || 0) > 20
              ? 12.3
              : (eventsResponse?.page?.totalElements || 0) > 5
              ? 6.8
              : (eventsResponse?.page?.totalElements || 0) > 0
              ? 2.1
              : 0,
          isPositive: !!(
            eventsResponse?.page?.totalElements &&
            eventsResponse.page.totalElements > 0
          ),
          label:
            (eventsResponse?.page?.totalElements || 0) > 50
              ? "Plateforme très active"
              : (eventsResponse?.page?.totalElements || 0) > 20
              ? "Bonne activité"
              : (eventsResponse?.page?.totalElements || 0) > 5
              ? "Activité modérée"
              : (eventsResponse?.page?.totalElements || 0) > 0
              ? "Démarrage"
              : "Aucun événement",
        },
        footer: {
          primary:
            (eventsResponse?.page?.totalElements || 0) > 50
              ? "Plateforme très active"
              : (eventsResponse?.page?.totalElements || 0) > 20
              ? "Bonne activité"
              : (eventsResponse?.page?.totalElements || 0) > 5
              ? "Activité modérée"
              : (eventsResponse?.page?.totalElements || 0) > 0
              ? "Démarrage"
              : "Aucun événement",
          secondary: "événements créés",
        },
      },
      {
        id: "upcoming",
        title: "À venir",
        description: "Événements programmés",
        value: upcomingEvents,
        trend: {
          value:
            upcomingEvents > 20
              ? 25.4
              : upcomingEvents > 10
              ? 15.7
              : upcomingEvents > 3
              ? 8.2
              : upcomingEvents > 0
              ? 3.1
              : 0,
          isPositive: upcomingEvents > 0,
          label:
            upcomingEvents > 20
              ? "Calendrier très chargé"
              : upcomingEvents > 10
              ? "Planning rempli"
              : upcomingEvents > 3
              ? "Prochains événements"
              : upcomingEvents > 0
              ? "Quelques événements"
              : "Aucun événement prévu",
        },
        footer: {
          primary:
            upcomingEvents > 20
              ? "Calendrier très chargé"
              : upcomingEvents > 10
              ? "Planning rempli"
              : upcomingEvents > 3
              ? "Prochains événements"
              : upcomingEvents > 0
              ? "Quelques événements"
              : "Aucun événement prévu",
          secondary: "événements programmés",
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
        id: "participants",
        title: "Participants",
        description: "Total des inscriptions",
        value: totalParticipants,
        trend: {
          value:
            totalParticipants > 1000
              ? 22.8
              : totalParticipants > 500
              ? 16.4
              : totalParticipants > 100
              ? 9.7
              : totalParticipants > 0
              ? 4.3
              : 0,
          isPositive: totalParticipants > 0,
          label:
            totalParticipants > 1000
              ? "Très populaire"
              : totalParticipants > 500
              ? "Bonne affluence"
              : totalParticipants > 100
              ? "Participation correcte"
              : totalParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
        },
        footer: {
          primary:
            totalParticipants > 1000
              ? "Très populaire"
              : totalParticipants > 500
              ? "Bonne affluence"
              : totalParticipants > 100
              ? "Participation correcte"
              : totalParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
          secondary: "participants inscrits",
        },
      },
    ],
    [events, upcomingEvents, totalParticipants, averageParticipants]
  );

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={4}
        tableRowsCount={5}
        tableColumnsCount={8}
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
              Erreur lors du chargement des événements. Veuillez réessayer.
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
                  Événements
                </h1>
                <p className="text-muted-foreground">
                  Gérez tous vos événements et leurs participants
                </p>
              </div>
              <CreateEventDialog />
            </div>

            {/* ✅ SectionCards au lieu des cards manuelles */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            <EventsTable
              data={events}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
            />

            {/* Pagination */}
            {eventsResponse?.page && eventsResponse.page.totalPages > 1 && (
              <div className="flex justify-center px-4 lg:px-6">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={eventsResponse.page.totalPages}
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
