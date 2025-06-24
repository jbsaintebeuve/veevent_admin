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
  Globe,
  AlertCircle,
  Building,
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
import { CreateCityDialog } from "@/components/create-city-dialog";

interface City {
  id: number;
  name: string;
  region: string;
  country: string;
  postalCode: string;
  eventsCount: number;
}

interface ApiResponse {
  _embedded: {
    cityResponses: City[];
  };
  _links: any;
  page: any;
}

async function fetchCities(): Promise<City[]> {
  const res = await fetch("http://localhost:8090/cities");
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  const data: ApiResponse = await res.json();
  return data._embedded?.cityResponses || [];
}

async function deleteCity(id: number): Promise<void> {
  const res = await fetch(`http://localhost:8090/cities/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

export default function CitiesPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: cities,
    isLoading,
    error,
  } = useQuery<City[]>({
    queryKey: ["cities"],
    queryFn: fetchCities,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cities"] });
      toast.success("Ville supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = (id: number, name: string) => {
    deleteMutation.mutate(id);
  };

  // ✅ Filtrage des villes avec recherche
  const filteredCities = Array.isArray(cities)
    ? cities.filter(
        (city) =>
          city.name.toLowerCase().includes(search.toLowerCase()) ||
          city.region.toLowerCase().includes(search.toLowerCase()) ||
          city.country.toLowerCase().includes(search.toLowerCase()) ||
          city.postalCode.toLowerCase().includes(search.toLowerCase())
      )
    : [];

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

  // Error state
  if (error) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des villes. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const totalEvents =
    cities?.reduce((sum, city) => sum + city.eventsCount, 0) || 0;
  const totalCountries = new Set(cities?.map((city) => city.country)).size;

  // ✅ Données pour SectionCards
  const cardsData: CardData[] = [
    {
      id: "cities",
      title: "Total des villes",
      description: "Total des villes",
      value: cities?.length || 0,
      trend: {
        value:
          cities && cities.length > 10
            ? 12.5
            : cities && cities.length > 5
            ? 5.2
            : -2.1,
        isPositive: !!(cities && cities.length > 5),
        label:
          cities && cities.length > 10
            ? "Croissance stable"
            : cities && cities.length > 5
            ? "En développement"
            : "Besoin d'extension",
      },
      footer: {
        primary:
          cities && cities.length > 10
            ? "Croissance stable"
            : cities && cities.length > 5
            ? "En développement"
            : "Besoin d'extension",
        secondary:
          cities?.length === 1 ? "ville disponible" : "villes disponibles",
      },
    },
    {
      id: "events",
      title: "Événements totaux",
      description: "Événements totaux",
      value: totalEvents,
      trend: {
        value: totalEvents > 50 ? 8.3 : totalEvents > 20 ? 3.7 : -1.5,
        isPositive: totalEvents > 20,
        label:
          totalEvents > 50
            ? "Performance excellente"
            : totalEvents > 20
            ? "Bonne activité"
            : "Activation nécessaire",
      },
      footer: {
        primary:
          totalEvents > 50
            ? "Performance excellente"
            : totalEvents > 20
            ? "Bonne activité"
            : "Activation nécessaire",
        secondary: "événements dans toutes les villes",
      },
    },
    {
      id: "countries",
      title: "Pays couverts",
      description: "Pays couverts",
      value: totalCountries,
      trend: {
        value: totalCountries > 3 ? 15.0 : totalCountries > 1 ? 8.5 : 0,
        isPositive: totalCountries > 1,
        label:
          totalCountries > 3
            ? "Expansion géographique"
            : totalCountries > 1
            ? "Diversification"
            : "Marché local",
      },
      footer: {
        primary:
          totalCountries > 3
            ? "Expansion géographique"
            : totalCountries > 1
            ? "Diversification"
            : "Marché local",
        secondary: totalCountries === 1 ? "pays couvert" : "pays différents",
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
                <h1 className="text-3xl font-bold tracking-tight">Villes</h1>
                <p className="text-muted-foreground">
                  Gérez les villes où se déroulent vos événements
                </p>
              </div>
              <CreateCityDialog />
            </div>

            {/* ✅ SectionCards au lieu des cards manuelles */}
            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            {/* ✅ Search Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des villes</CardTitle>
                  <CardDescription>
                    Filtrez par nom, région, pays ou code postal
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, région, pays ou code postal..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ Data Table */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des villes</CardTitle>
                  <CardDescription>
                    {search ? (
                      <>
                        {filteredCities.length} résultat(s) trouvé(s) pour "
                        {search}"
                      </>
                    ) : (
                      <>Toutes vos villes et leurs statistiques d'événements</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredCities && filteredCities.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nom</TableHead>
                          <TableHead>Région</TableHead>
                          <TableHead>Pays</TableHead>
                          <TableHead>Code postal</TableHead>
                          <TableHead className="text-center">
                            Événements
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCities.map((city) => (
                          <TableRow key={city.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                {city.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {city.region}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{city.country}</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {city.postalCode}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  city.eventsCount > 0 ? "default" : "outline"
                                }
                              >
                                {city.eventsCount}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/cities/${city.id}/edit`}>
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
                                        Supprimer la ville
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer "
                                        {city.name}" ? Cette action est
                                        irréversible.
                                        {city.eventsCount > 0 && (
                                          <span className="block mt-2 text-destructive font-medium">
                                            ⚠️ Cette ville a {city.eventsCount}{" "}
                                            événement(s).
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
                                          handleDelete(city.id, city.name)
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
                  ) : (
                    <div className="text-center py-8">
                      {search ? (
                        <>
                          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun résultat trouvé
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Aucune ville ne correspond à votre recherche "
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
                          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucune ville
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Commencez par créer votre première ville.
                          </p>
                          <CreateCityDialog />
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
