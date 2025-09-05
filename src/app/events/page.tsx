"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { useEventsCards } from "@/hooks/data-cards/use-events-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { fetchEvents, deleteEvent } from "@/services/event-service";
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
  const { token } = useAuth();

  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useQuery<EventsApiResponse>({
    queryKey: ["events", currentPage],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchEvents(token, currentPage - 1, pageSize);
    },
  });

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => {
      if (!token) throw new Error("Token manquant");
      return deleteEvent(deleteUrl, token);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement supprimé avec succès");
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de la suppression de l'événement");
    },
  });

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
      deleteMutation.mutate(deleteUrl);
    },
    [deleteMutation]
  );

  const { upcomingEvents, totalParticipants, averageParticipants } =
    useMemo(() => {
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

  const totalEvents = eventsResponse?.page?.totalElements || 0;

  const cardsData = useEventsCards({
    totalEvents,
    upcomingEvents,
    averageParticipants,
    totalParticipants,
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
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

            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            <EventsTable
              data={events}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
            />

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
