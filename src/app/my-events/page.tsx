"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchUserEvents } from "@/lib/fetch-events";
import { useAuth } from "@/hooks/use-auth";
import { EventsApiResponse } from "@/types/event";
import { EventsTable } from "@/components/tables/events-table";
import { Button } from "@/components/ui/button";

export default function MyEventsPage() {
  const [search, setSearch] = useState("");
  const { user, getToken } = useAuth();

  // Récupérer le lien HAL des événements de l'utilisateur
  const userEventsUrl = user?._links?.events?.href;

  const emptyEventsApiResponse: EventsApiResponse = {
    _embedded: { eventSummaryResponses: [] },
    _links: {},
    page: {},
  };

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<EventsApiResponse>({
    queryKey: ["my-events", user?.id],
    queryFn: () => fetchUserEvents(userEventsUrl!, getToken() || undefined),
    enabled: !!user?.id && !!userEventsUrl,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];

  // Statistiques optimisées avec useMemo - une seule boucle au lieu de 4
  const { totalEvents, upcomingCount, ongoingCount, completedCount } =
    useMemo(() => {
      const stats = {
        totalEvents: events.length,
        upcomingCount: 0,
        ongoingCount: 0,
        completedCount: 0,
      };

      events.forEach((event) => {
        switch (event.status) {
          case "NOT_STARTED":
            stats.upcomingCount++;
            break;
          case "ONGOING":
            stats.ongoingCount++;
            break;
          case "COMPLETED":
            stats.completedCount++;
            break;
        }
      });

      return stats;
    }, [events]);

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
        id: "ongoing",
        title: "En cours",
        description: "Événements en cours",
        value: ongoingCount,
        trend: {
          value: ongoingCount > 2 ? 5.4 : ongoingCount > 0 ? 1.2 : 0,
          isPositive: ongoingCount > 0,
          label:
            ongoingCount > 2
              ? "Très actif"
              : ongoingCount > 0
              ? "En direct"
              : "Aucun en cours",
        },
        footer: {
          primary: ongoingCount === 1 ? "événement" : "événements",
          secondary: "en cours",
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
    [totalEvents, upcomingCount, ongoingCount, completedCount]
  );

  const handleDelete = (deleteUrl: string, name: string) => {
    // TODO: Implémenter la suppression d'événement
    console.log("Supprimer événement:", name, deleteUrl);
  };

  // Vérifier si le lien HAL est disponible (cas spécifique aux liens HAL)
  if (!userEventsUrl) {
    return null;
  }

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
              </div>
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="@container/card">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-4" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
              <div className="px-4 lg:px-6">
                <Skeleton className="h-96 w-full" />
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
            </div>

            {/* ✅ SectionCards */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* ✅ Nouveau tableau */}
            <EventsTable
              data={events || []}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={false}
              hideDelete={true}
            />
          </div>
        </div>
      </div>
    </>
  );
}
