"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchUserEvents } from "@/services/event-service";
import { useAuth } from "@/hooks/use-auth";
import { EventsApiResponse } from "@/types/event";
import { EventsTable } from "@/components/tables/events-table";
import { Button } from "@/components/ui/button";
import { PageSkeleton } from "@/components/page-skeleton";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { useMyEventsCards } from "@/hooks/data-cards/use-my-events-cards";

export default function MyEventsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const { user, token } = useAuth();

  const userEventsUrl = user?._links?.events?.href;

  const pageSize = 10;

  const {
    data: eventsResponse,
    isLoading,
    error,
    refetch,
  } = useQuery<EventsApiResponse>({
    queryKey: ["my-events", user?.id],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchUserEvents(userEventsUrl, token, 0, 1000);
    },
    enabled: !!token && !!user?.id && !!userEventsUrl,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];
  const pageInfo = eventsResponse?.page;

  const apiSupportsPagination =
    pageInfo && pageInfo.totalElements !== undefined;

  const paginatedEvents = useMemo(() => {
    if (apiSupportsPagination) {
      return events;
    }

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return events.slice(startIndex, endIndex);
  }, [events, currentPage, pageSize, apiSupportsPagination]);

  const clientSidePagination = useMemo(() => {
    if (apiSupportsPagination) return null;

    const totalPages = Math.ceil(events.length / pageSize);
    return {
      totalPages,
      totalElements: events.length,
      currentPage,
    };
  }, [events.length, pageSize, currentPage, apiSupportsPagination]);

  const { totalEvents, upcomingCount, completedCount, averageParticipants } =
    useMemo(() => {
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

  const cardsData = useMyEventsCards({
    totalEvents,
    upcomingCount,
    averageParticipants,
    completedCount,
  });

  const handleDelete = (deleteUrl: string, name: string) => {
    console.log("Supprimer événement:", name, deleteUrl);
  };


  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!userEventsUrl) {
    return null;
  }

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
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

            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            <EventsTable
              data={paginatedEvents || []}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={false}
              hideDelete={true}
            />

            {(() => {
              if (apiSupportsPagination) {
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
