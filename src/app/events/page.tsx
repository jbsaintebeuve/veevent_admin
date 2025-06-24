"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
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
import { CreateEventDialog } from "@/components/create-event-dialog";

// Interface mise à jour selon la nouvelle structure API
interface Event {
  id: number;
  name: string;
  description: string;
  date: string; // Date et heure combinées
  address: string;
  maxCustomers: number;
  currentParticipants: number;
  price: number;
  status: "NOT_STARTED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  isTrending: boolean;
  isFirstEdition: boolean;
  imageUrl: string;
  cityName: string;
  placeName: string;
  categories: Array<{
    name: string;
    key: string;
  }>;
  organizer: {
    pseudo: string;
    lastName: string;
    firstName: string;
    imageUrl: string | null;
    note: number | null;
  };
}

interface ApiResponse {
  _embedded: {
    eventSummaryResponses: Event[]; // Nom correct de la propriété
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("http://localhost:8090/events");
  if (!res.ok) throw new Error("Erreur lors du chargement des événements");
  const data: ApiResponse = await res.json();
  return data._embedded?.eventSummaryResponses || []; // Propriété corrigée
}

async function deleteEvent(id: number): Promise<void> {
  const res = await fetch(`http://localhost:8090/events/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

export default function EventsPage() {
  const queryClient = useQueryClient();

  const {
    data: events,
    isLoading,
    error,
  } = useQuery<Event[]>({
    queryKey: ["events"],
    queryFn: fetchEvents,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      toast.success("Événement supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = (id: number, name: string) => {
    deleteMutation.mutate(id);
  };

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

  // Loading state (inchangé)
  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Error state (inchangé)
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
  const totalParticipants =
    events?.reduce((sum, event) => sum + event.currentParticipants, 0) || 0; // currentParticipants au lieu de participantsCount

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
            <p className="text-muted-foreground">
              Gérez tous vos événements et leurs participants
            </p>
          </div>
          <CreateEventDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total événements
              </CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{events?.length || 0}</div>
              <p className="text-xs text-muted-foreground">événements créés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À venir</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                événements programmés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ongoingEvents}</div>
              <p className="text-xs text-muted-foreground">événements actifs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Participants
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalParticipants}</div>
              <p className="text-xs text-muted-foreground">
                participants inscrits
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Table - Mise à jour avec les nouveaux champs */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des événements</CardTitle>
            <CardDescription>
              Tous vos événements avec leurs détails et statuts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events && events.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date/Heure</TableHead>
                    <TableHead>Lieu</TableHead>
                    <TableHead>Catégories</TableHead>
                    <TableHead className="text-center">Participants</TableHead>
                    <TableHead className="text-center">Prix</TableHead>
                    <TableHead className="text-center">Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => {
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
                              {event.currentParticipants}/{event.maxCustomers}
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
                            {event.price === 0 ? "Gratuit" : `${event.price}€`}
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

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  disabled={deleteMutation.isPending}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Supprimer</span>
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
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleDelete(event.id, event.name)
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
                <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucun événement</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez par créer votre premier événement.
                </p>
                <CreateEventDialog />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
