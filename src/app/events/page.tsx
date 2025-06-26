"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import {
  Search,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  CalendarClock,
  Users,
  AlertCircle,
  CalendarDays,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { fetchEvents, deleteEvent } from "@/lib/fetch-events";
import { useAuth } from "@/hooks/use-auth";
import { Event, EventsApiResponse } from "@/types/event";
import { ModifyEventDialog } from "@/components/modify-dialogs/modify-event-dialog";

export default function EventsPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: eventsResponse,
    isLoading,
    error,
  } = useQuery<EventsApiResponse>({
    queryKey: ["events"],
    queryFn: () => fetchEvents(getToken() || undefined),
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

  const handleDelete = (deleteUrl: string, name: string) => {
    deleteMutation.mutate(deleteUrl);
  };

  // ✅ Filtrage des événements avec recherche
  const filteredEvents = Array.isArray(events)
    ? events.filter(
        (event) =>
          event.name.toLowerCase().includes(search.toLowerCase()) ||
          event.description.toLowerCase().includes(search.toLowerCase()) ||
          event.cityName.toLowerCase().includes(search.toLowerCase()) ||
          event.placeName.toLowerCase().includes(search.toLowerCase()) ||
          event.categories.some((cat) =>
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
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Stats Cards Skeleton */}
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
              Erreur lors du chargement des événements. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  // Calculs des statistiques mis à jour
  const upcomingEvents =
    events?.filter((e) => e.status === "NOT_STARTED").length || 0;
  const ongoingEvents =
    events?.filter((e) => e.status === "ONGOING").length || 0;
  const completedEvents =
    events?.filter((e) => e.status === "COMPLETED").length || 0;
  const totalParticipants =
    events?.reduce((sum, event) => sum + event.currentParticipants, 0) || 0;

  // ✅ Données pour SectionCards
  const cardsData: CardData[] = [
    {
      id: "total",
      title: "Total événements",
      description: "Tous les événements",
      value: events?.length || 0,
      trend: {
        value:
          events && events.length > 50
            ? 18.5
            : events && events.length > 20
            ? 12.3
            : events && events.length > 5
            ? 6.8
            : events && events.length > 0
            ? 2.1
            : 0,
        isPositive: !!(events && events.length > 0),
        label:
          events && events.length > 50
            ? "Plateforme très active"
            : events && events.length > 20
            ? "Bonne activité"
            : events && events.length > 5
            ? "Activité modérée"
            : events && events.length > 0
            ? "Démarrage"
            : "Aucun événement",
      },
      footer: {
        primary:
          events && events.length > 50
            ? "Plateforme très active"
            : events && events.length > 20
            ? "Bonne activité"
            : events && events.length > 5
            ? "Activité modérée"
            : events && events.length > 0
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
      id: "ongoing",
      title: "En cours",
      description: "Événements actifs",
      value: ongoingEvents,
      trend: {
        value:
          ongoingEvents > 5
            ? 30.2
            : ongoingEvents > 2
            ? 20.1
            : ongoingEvents > 0
            ? 10.5
            : 0,
        isPositive: ongoingEvents > 0,
        label:
          ongoingEvents > 5
            ? "Très actif"
            : ongoingEvents > 2
            ? "Bonne activité"
            : ongoingEvents > 0
            ? "En cours"
            : "Aucun événement actif",
      },
      footer: {
        primary:
          ongoingEvents > 5
            ? "Très actif"
            : ongoingEvents > 2
            ? "Bonne activité"
            : ongoingEvents > 0
            ? "En cours"
            : "Aucun événement actif",
        secondary: "événements actifs",
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
  ];

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

            {/* ✅ Search Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des événements</CardTitle>
                  <CardDescription>
                    Filtrez par nom, description, ville, lieu ou catégorie
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, lieu, catégorie..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ Data Table - Mise à jour avec les nouveaux champs */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des événements</CardTitle>
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
                        {filteredEvents.map((event) => {
                          const { date, time } = formatDateTime(event.date);
                          return (
                            <TableRow key={event.id}>
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
                                  <Button variant="outline" size="sm" asChild>
                                    <Link href={`/events/${event.id}/edit`}>
                                      <Edit className="h-4 w-4" />
                                      <span className="sr-only">Modifier</span>
                                    </Link>
                                  </Button>

                                  <ModifyEventDialog event={event} />

                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive hover:text-destructive"
                                        disabled={deleteMutation.isPending}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">
                                          Supprimer
                                        </span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>
                                          Supprimer l'événement
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer "
                                          {event.name}" ? Cette action est
                                          irréversible.
                                          {event.currentParticipants > 0 && (
                                            <span className="block mt-2 text-destructive font-medium">
                                              ⚠️ Cet événement a{" "}
                                              {event.currentParticipants}{" "}
                                              participant(s) inscrit(s).
                                            </span>
                                          )}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>
                                          Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() =>
                                            handleDelete(
                                              event._links?.self?.href,
                                              event.name
                                            )
                                          }
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Supprimer
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
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
                            {search}
                            ".
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setSearch("")}
                          >
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
