"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Search,
  MapPin,
  Calendar,
  CalendarClock,
  Users,
  CalendarDays,
} from "lucide-react";
import { fetchUserEvents } from "@/lib/fetch-events";
import { useAuth } from "@/hooks/use-auth";
import { Event, EventsApiResponse } from "@/types/event";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { ModifyEventDialog } from "@/components/modify-dialogs/modify-event-dialog";

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
  } = useQuery<EventsApiResponse>({
    queryKey: ["my-events", userEventsUrl],
    queryFn: () =>
      userEventsUrl
        ? fetchUserEvents(userEventsUrl, getToken() || undefined)
        : Promise.resolve(emptyEventsApiResponse),
    enabled: !!userEventsUrl,
  });

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];

  // Filtrage des événements avec recherche
  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event: Event) =>
          event.name.toLowerCase().includes(search.toLowerCase()) ||
          event.description.toLowerCase().includes(search.toLowerCase()) ||
          event.cityName.toLowerCase().includes(search.toLowerCase()) ||
          event.placeName.toLowerCase().includes(search.toLowerCase()) ||
          event.categories.some((cat: { name: string }) =>
            cat.name.toLowerCase().includes(search.toLowerCase())
          )
      )
    : [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return <Badge variant="default">À venir</Badge>;
      case "ONGOING":
        return <Badge variant="secondary">En cours</Badge>;
      case "COMPLETED":
        return <Badge variant="outline">Terminé</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Annulé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("fr-FR"),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

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
                  <Card key={i} className="@container/card">
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16 mb-4" />
                      <Skeleton className="h-6 w-20" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="px-4 lg:px-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
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
              Erreur lors du chargement de vos événements. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  // Statistiques pour SectionCards (exemple simple)
  const totalEvents = events.length;
  const upcomingCount = events.filter(
    (e: Event) => e.status === "NOT_STARTED"
  ).length;
  const ongoingCount = events.filter(
    (e: Event) => e.status === "ONGOING"
  ).length;
  const completedCount = events.filter(
    (e: Event) => e.status === "COMPLETED"
  ).length;

  const cardsData: CardData[] = [
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
  ];

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
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
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher un événement</CardTitle>
                  <CardDescription>
                    Filtrez par nom, description, lieu, ville ou catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste de mes événements</CardTitle>
                  <CardDescription>
                    {search ? (
                      <>
                        {filteredEvents.length} résultat(s) trouvé(s) pour "
                        {search}"
                      </>
                    ) : (
                      <>Tous vos événements</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredEvents && filteredEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Ville</TableHead>
                          <TableHead>Lieu</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Statut</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event, index) => {
                          const { date, time } = formatDateTime(event.date);
                          return (
                            <TableRow key={`event-${event.id}-${index}`}>
                              <TableCell className="font-medium">
                                {event.name}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {event.description}
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  {event.cityName}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                                  {event.placeName}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="flex flex-col">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {date}
                                  </span>
                                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <CalendarClock className="h-3 w-3" />
                                    {time}
                                  </span>
                                </span>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(event.status)}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <ModifyEventDialog event={event} />
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      {search ? (
                        <>
                          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun résultat trouvé
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Aucun événement ne correspond à votre recherche "
                            {search}"
                          </p>
                          <button
                            className="border rounded px-4 py-2 text-sm"
                            onClick={() => setSearch("")}
                          >
                            Effacer la recherche
                          </button>
                        </>
                      ) : (
                        <>
                          <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun événement
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Commencez par créer votre premier événement.
                          </p>
                          <CreateEventDialog />
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
