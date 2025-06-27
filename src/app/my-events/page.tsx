"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
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
import { AlertCircle, Search, MapPin, CalendarDays } from "lucide-react";
import { fetchUserEvents } from "@/lib/fetch-events";
import { useAuth } from "@/hooks/use-auth";
import { Event, EventsApiResponse } from "@/types/event";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { ModifyEventDialog } from "@/components/modify-dialogs/modify-event-dialog";
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

  // Filtrage des événements avec recherche - optimisé avec useMemo
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(events)) return [];

    if (!search.trim()) return events;

    const searchLower = search.toLowerCase();
    return events.filter(
      (event: Event) =>
        event.name.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.cityName.toLowerCase().includes(searchLower) ||
        event.placeName.toLowerCase().includes(searchLower) ||
        event.categories.some((cat: { name: string }) =>
          cat.name.toLowerCase().includes(searchLower)
        )
    );
  }, [events, search]);

  const getStatusBadge = useCallback((status: string) => {
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
  }, []);

  const formatDateTime = useCallback((dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString("fr-FR"),
      time: date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

  // Statistiques optimisées avec useMemo - une seule boucle au lieu de 4
  const { totalEvents, upcomingCount, ongoingCount, completedCount } =
    useMemo(() => {
      const stats = {
        totalEvents: events.length,
        upcomingCount: 0,
        ongoingCount: 0,
        completedCount: 0,
      };

      events.forEach((event: Event) => {
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
            <div className="flex items-center justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Mes événements
                </h1>
                <p className="text-muted-foreground">
                  Retrouvez ici tous les événements que vous organisez
                </p>
              </div>
              <div className="flex items-center gap-2">
                <CreateEventDialog />
              </div>
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
                      onChange={handleSearchChange}
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
                      <>Tous vos événements avec leurs détails et statuts</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredEvents && filteredEvents.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Date/Heure</TableHead>
                          <TableHead>Lieu</TableHead>
                          <TableHead>Catégories</TableHead>
                          <TableHead className="text-center">
                            Participants
                          </TableHead>
                          <TableHead className="text-center">Prix</TableHead>
                          <TableHead className="text-center">Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredEvents.map((event, index) => {
                          const { date, time } = formatDateTime(event.date);
                          return (
                            <TableRow key={`event-${event.id}-${index}`}>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span>{event.name}</span>
                                  {event.isTrending && (
                                    <Badge
                                      variant="secondary"
                                      className="w-fit text-xs mt-1"
                                    >
                                      Tendance
                                    </Badge>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                <div className="flex flex-col text-sm">
                                  <span>{date}</span>
                                  <span className="text-xs">{time}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                  <div className="flex flex-col text-sm">
                                    <span>{event.placeName}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {event.cityName}
                                    </span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {event.categories.map((category, index) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {category.name}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col text-sm">
                                  <span className="font-medium">
                                    {event.currentParticipants}/
                                    {event.maxCustomers}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {Math.round(
                                      (event.currentParticipants /
                                        event.maxCustomers) *
                                        100
                                    )}
                                    %
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="font-medium">
                                  {event.price === 0
                                    ? "Gratuit"
                                    : `${event.price}€`}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
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
                          <Button variant="outline" onClick={handleClearSearch}>
                            Effacer la recherche
                          </Button>
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
