"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Tag,
  TrendingUp,
  Hash,
  AlertCircle,
  FileText,
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
import { CreateCategoryDialog } from "@/components/create-category-dialog";

interface Category {
  name: string;
  description: string;
  key: string;
  trending: boolean;
}

interface ApiResponse {
  _embedded: {
    categories: Category[];
  };
  _links: any;
  page: any;
}

async function fetchCategories(): Promise<Category[]> {
  const res = await fetch("http://localhost:8090/categories");
  if (!res.ok) throw new Error("Erreur lors du chargement des catégories");
  const data: ApiResponse = await res.json();

  // ✅ Filtrer les doublons par clé unique
  const categories = data._embedded?.categories || [];
  const uniqueCategories = categories.filter(
    (category, index, arr) =>
      arr.findIndex((c) => c.key === category.key) === index
  );

  return uniqueCategories;
}

async function deleteCategory(key: string): Promise<void> {
  const res = await fetch(`http://localhost:8090/categories/${key}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Erreur lors de la suppression");
}

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const {
    data: categories,
    isLoading,
    error,
  } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = (key: string, name: string) => {
    deleteMutation.mutate(key);
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter(
        (category) =>
          category.name.toLowerCase().includes(search.toLowerCase()) ||
          category.description.toLowerCase().includes(search.toLowerCase()) ||
          category.key.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const getTrendingBadge = (trending: boolean) => {
    return trending ? (
      <Badge variant="default" className="gap-1">
        <TrendingUp className="h-3 w-3" />
        Tendance
      </Badge>
    ) : (
      <Badge variant="secondary">Standard</Badge>
    );
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
              Erreur lors du chargement des catégories. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  const trendingCount = categories?.filter((c) => c.trending).length || 0;
  const standardCount = (categories?.length || 0) - trendingCount;

  // ✅ Données pour SectionCards
  const cardsData: CardData[] = [
    {
      id: "categories",
      title: "Total catégories",
      description: "Total catégories",
      value: categories?.length || 0,
      trend: {
        value:
          categories && categories.length > 15
            ? 15.2
            : categories && categories.length > 8
            ? 8.7
            : categories && categories.length > 3
            ? 3.4
            : -1.2,
        isPositive: !!(categories && categories.length > 3),
        label:
          categories && categories.length > 15
            ? "Excellent catalogue"
            : categories && categories.length > 8
            ? "Bon catalogue"
            : categories && categories.length > 3
            ? "En développement"
            : "Catalogue à enrichir",
      },
      footer: {
        primary:
          categories && categories.length > 15
            ? "Excellent catalogue"
            : categories && categories.length > 8
            ? "Bon catalogue"
            : categories && categories.length > 3
            ? "En développement"
            : "Catalogue à enrichir",
        secondary:
          categories?.length === 1
            ? "catégorie disponible"
            : "catégories disponibles",
      },
    },
    {
      id: "trending",
      title: "En tendance",
      description: "Catégories populaires",
      value: trendingCount,
      trend: {
        value:
          trendingCount > 5
            ? 22.3
            : trendingCount > 2
            ? 12.5
            : trendingCount > 0
            ? 5.1
            : 0,
        isPositive: trendingCount > 0,
        label:
          trendingCount > 5
            ? "Forte attraction"
            : trendingCount > 2
            ? "Bonne popularité"
            : trendingCount > 0
            ? "Émergent"
            : "Aucune tendance",
      },
      footer: {
        primary:
          trendingCount > 5
            ? "Forte attraction"
            : trendingCount > 2
            ? "Bonne popularité"
            : trendingCount > 0
            ? "Émergent"
            : "Aucune tendance",
        secondary: "catégories populaires",
      },
    },
    {
      id: "standard",
      title: "Standards",
      description: "Catégories standard",
      value: standardCount,
      trend: {
        value:
          standardCount > 10
            ? 8.9
            : standardCount > 5
            ? 4.2
            : standardCount > 0
            ? 1.8
            : 0,
        isPositive: standardCount > 0,
        label:
          standardCount > 10
            ? "Base solide"
            : standardCount > 5
            ? "Fondation stable"
            : standardCount > 0
            ? "Base établie"
            : "Aucune base",
      },
      footer: {
        primary:
          standardCount > 10
            ? "Base solide"
            : standardCount > 5
            ? "Fondation stable"
            : standardCount > 0
            ? "Base établie"
            : "Aucune base",
        secondary: "catégories standard",
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
                  Catégories
                </h1>
                <p className="text-muted-foreground">
                  Gérez toutes les catégories d'événements
                </p>
              </div>
              <CreateCategoryDialog />
            </div>

            {/* ✅ SectionCards au lieu des cards manuelles */}
            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            {/* Search Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des catégories</CardTitle>
                  <CardDescription>
                    Filtrez par nom, description ou clé
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, description ou clé..."
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
                  <CardTitle>Liste des catégories</CardTitle>
                  <CardDescription>
                    {search ? (
                      <>
                        {filteredCategories.length} résultat(s) trouvé(s) pour "
                        {search}"
                      </>
                    ) : (
                      <>Toutes les catégories d'événements</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredCategories && filteredCategories.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead>Clé</TableHead>
                          <TableHead className="text-center">Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredCategories.map((category, index) => (
                          <TableRow key={`category-${category.key}-${index}`}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                  <Tag className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {category.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    Catégorie #{category.key}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm max-w-xs truncate">
                                  {category.description || "Aucune description"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">
                                  {category.key}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getTrendingBadge(category.trending)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link
                                    href={`/categories/${category.key}/edit`}
                                  >
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
                                        Supprimer la catégorie
                                      </AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Êtes-vous sûr de vouloir supprimer la
                                        catégorie "{category.name}" ? Cette
                                        action est irréversible et pourrait
                                        affecter les événements associés.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>
                                        Annuler
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() =>
                                          handleDelete(
                                            category.key,
                                            category.name
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
                  ) : (
                    <div className="text-center py-8">
                      {search ? (
                        <>
                          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun résultat trouvé
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Aucune catégorie ne correspond à votre recherche "
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
                          <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucune catégorie
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Commencez par créer votre première catégorie.
                          </p>
                          <CreateCategoryDialog />
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
