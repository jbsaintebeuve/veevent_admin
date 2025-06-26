"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Building2,
  MapPin,
  Calendar,
  CalendarX,
  Edit,
  Trash2,
  AlertCircle,
  Search,
} from "lucide-react";
import { CreatePlaceDialog } from "@/components/create-dialogs/create-place-dialog";
import { ModifyPlaceDialog } from "@/components/modify-dialogs/modify-place-dialog";
import { fetchPlaces, deletePlace } from "@/lib/fetch-places";
import { useAuth } from "@/hooks/use-auth";

import { Place, PlacesApiResponse } from "@/types/place";

export default function PlacesPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: placesResponse,
    isLoading,
    error,
  } = useQuery<PlacesApiResponse>({
    queryKey: ["places"],
    queryFn: () => fetchPlaces(getToken() || undefined),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const places = placesResponse?._embedded?.placeResponses || [];

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => deletePlace(deleteUrl, getToken() || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] });
      toast.success("Lieu supprimé avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = (deleteUrl: string, name: string) => {
    deleteMutation.mutate(deleteUrl);
  };

  // Désactivation temporaire du filtrage pour diagnostic
  const filteredPlaces = Array.isArray(places) ? places : [];

  // Loading state (reste identique)
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
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                {[...Array(3)].map((_, i) => (
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
                          <Skeleton className="h-4 w-20" />
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

  // Error state (reste identique)
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

  const totalEvents =
    places?.reduce((sum, place) => sum + place.eventsCount, 0) || 0;
  const totalPastEvents =
    places?.reduce((sum, place) => sum + place.eventsPastCount, 0) || 0;
  const activePlaces =
    places?.filter((place) => place.eventsCount > 0).length || 0;

  // ✅ Données pour SectionCards (reste identique)
  const cardsData: CardData[] = [
    {
      id: "total",
      title: "Total des lieux",
      description: "Tous les lieux disponibles",
      value: places?.length || 0,
      trend: {
        value:
          places && places.length > 50
            ? 18.7
            : places && places.length > 25
            ? 12.4
            : places && places.length > 10
            ? 8.1
            : places && places.length > 3
            ? 4.5
            : places && places.length > 0
            ? 2.1
            : 0,
        isPositive: !!(places && places.length > 0),
        label:
          places && places.length > 50
            ? "Réseau très développé"
            : places && places.length > 25
            ? "Bon réseau de lieux"
            : places && places.length > 10
            ? "Réseau en croissance"
            : places && places.length > 3
            ? "Base de lieux solide"
            : places && places.length > 0
            ? "Premiers lieux"
            : "Aucun lieu",
      },
      footer: {
        primary:
          places && places.length > 50
            ? "Réseau très développé"
            : places && places.length > 25
            ? "Bon réseau de lieux"
            : places && places.length > 10
            ? "Réseau en croissance"
            : places && places.length > 3
            ? "Base de lieux solide"
            : places && places.length > 0
            ? "Premiers lieux"
            : "Aucun lieu",
        secondary:
          places?.length === 1 ? "lieu disponible" : "lieux disponibles",
      },
    },
    {
      id: "active",
      title: "Lieux actifs",
      description: "Avec événements en cours",
      value: activePlaces,
      trend: {
        value:
          activePlaces > 20
            ? 25.3
            : activePlaces > 10
            ? 16.8
            : activePlaces > 5
            ? 9.4
            : activePlaces > 0
            ? 5.2
            : 0,
        isPositive: activePlaces > 0,
        label:
          activePlaces > 20
            ? "Très actif"
            : activePlaces > 10
            ? "Bonne activité"
            : activePlaces > 5
            ? "Activité modérée"
            : activePlaces > 0
            ? "Quelques lieux actifs"
            : "Aucun lieu actif",
      },
      footer: {
        primary:
          activePlaces > 20
            ? "Très actif"
            : activePlaces > 10
            ? "Bonne activité"
            : activePlaces > 5
            ? "Activité modérée"
            : activePlaces > 0
            ? "Quelques lieux actifs"
            : "Aucun lieu actif",
        secondary: "lieux avec événements",
      },
    },
    {
      id: "events",
      title: "Événements totaux",
      description: "Tous événements confondus",
      value: totalEvents + totalPastEvents,
      trend: {
        value:
          totalEvents + totalPastEvents > 200
            ? 22.9
            : totalEvents + totalPastEvents > 100
            ? 15.6
            : totalEvents + totalPastEvents > 50
            ? 10.3
            : totalEvents + totalPastEvents > 10
            ? 6.7
            : totalEvents + totalPastEvents > 0
            ? 3.1
            : 0,
        isPositive: totalEvents + totalPastEvents > 0,
        label:
          totalEvents + totalPastEvents > 200
            ? "Très forte utilisation"
            : totalEvents + totalPastEvents > 100
            ? "Bonne utilisation"
            : totalEvents + totalPastEvents > 50
            ? "Usage régulier"
            : totalEvents + totalPastEvents > 10
            ? "Usage modéré"
            : totalEvents + totalPastEvents > 0
            ? "Premiers événements"
            : "Aucun événement",
      },
      footer: {
        primary:
          totalEvents + totalPastEvents > 200
            ? "Très forte utilisation"
            : totalEvents + totalPastEvents > 100
            ? "Bonne utilisation"
            : totalEvents + totalPastEvents > 50
            ? "Usage régulier"
            : totalEvents + totalPastEvents > 10
            ? "Usage modéré"
            : totalEvents + totalPastEvents > 0
            ? "Premiers événements"
            : "Aucun événement",
        secondary: "événements organisés",
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
                <h1 className="text-3xl font-bold tracking-tight">Lieux</h1>
                <p className="text-muted-foreground">
                  Gérez les lieux où se déroulent vos événements
                </p>
              </div>
              <CreatePlaceDialog />
            </div>

            {/* ✅ SectionCards au lieu des cards manuelles */}
            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            {/* ✅ Search Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des lieux</CardTitle>
                  <CardDescription>
                    Filtrez par nom, adresse, ville, type ou description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, adresse, ville, type..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ Data Table avec colonnes mises à jour */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des lieux</CardTitle>
                  <CardDescription>
                    {search ? (
                      <>
                        {filteredPlaces.length} résultat(s) trouvé(s) pour "
                        {search}"
                      </>
                    ) : (
                      <>Tous vos lieux et leurs statistiques d'événements</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredPlaces && filteredPlaces.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Nom</TableHead>
                            <TableHead className="w-[120px]">Type</TableHead>
                            <TableHead className="w-[200px] hidden md:table-cell">
                              Adresse
                            </TableHead>
                            <TableHead className="w-[120px]">Ville</TableHead>
                            <TableHead className="text-center w-[100px]">
                              <span className="hidden sm:inline">
                                Événements
                              </span>
                              <span className="sm:hidden">Actifs</span>
                            </TableHead>
                            <TableHead className="text-center w-[100px] hidden lg:table-cell">
                              <span className="hidden xl:inline">
                                Événements passés
                              </span>
                              <span className="xl:hidden">Passés</span>
                            </TableHead>
                            <TableHead className="text-right w-[120px]">
                              Actions
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredPlaces.map((place) => (
                            <TableRow key={place.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                  <span className="truncate">{place.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {place.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-muted-foreground hidden md:table-cell">
                                <span
                                  className="truncate block max-w-[180px]"
                                  title={place.address}
                                >
                                  {place.address}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-xs">
                                  {place.cityName}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center">
                                <Badge
                                  variant={
                                    place.eventsCount > 0
                                      ? "default"
                                      : "outline"
                                  }
                                  className="text-xs min-w-[2rem] justify-center"
                                >
                                  {place.eventsCount}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-center hidden lg:table-cell">
                                <Badge
                                  variant="outline"
                                  className="text-xs min-w-[2rem] justify-center"
                                >
                                  {place.eventsPastCount}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <ModifyPlaceDialog place={place} />

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
                                          Supprimer le lieu
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Êtes-vous sûr de vouloir supprimer "
                                          {place.name}" ? Cette action est
                                          irréversible.
                                          {place.eventsCount > 0 && (
                                            <span className="block mt-2 text-destructive font-medium">
                                              ⚠️ Ce lieu a {place.eventsCount}{" "}
                                              événement(s) actif(s).
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
                                              place._links?.self?.href,
                                              place.name
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
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      {search ? (
                        <>
                          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun résultat trouvé
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Aucun lieu ne correspond à votre recherche "{search}
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
                          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun lieu
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Commencez par créer votre premier lieu.
                          </p>
                          <CreatePlaceDialog />
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
