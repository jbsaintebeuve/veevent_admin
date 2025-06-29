"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CreateCategoryDialog } from "@/components/create-dialogs/create-category-dialog";
import { fetchCategories, deleteCategory } from "@/lib/fetch-categories";
import { useAuth } from "@/hooks/use-auth";
import { CategoriesApiResponse } from "@/types/category";
import { CategoriesTable } from "@/components/tables/categories-table";
import { PageSkeleton } from "@/components/page-skeleton";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const {
    data: categoriesResponse,
    isLoading,
    error,
  } = useQuery<CategoriesApiResponse>({
    queryKey: ["categories"],
    queryFn: () => fetchCategories(getToken() || undefined),
  });

  const categories = categoriesResponse?._embedded?.categories || [];

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) =>
      deleteCategory(deleteUrl, getToken() || ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression");
      console.error(error);
    },
  });

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
      deleteMutation.mutate(deleteUrl);
    },
    [deleteMutation]
  );

  // Statistiques optimisées avec useMemo
  const { trendingCount, standardCount } = useMemo(() => {
    const trending = categories?.filter((c) => c.trending).length || 0;
    const standard = (categories?.length || 0) - trending;
    return { trendingCount: trending, standardCount: standard };
  }, [categories]);

  // Données pour SectionCards optimisées avec useMemo
  const cardsData: CardData[] = useMemo(
    () => [
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
              : categories && categories.length > 0
              ? 1.2
              : 0,
          isPositive: !!(categories && categories.length > 0),
          label:
            categories && categories.length > 15
              ? "Très diversifié"
              : categories && categories.length > 8
              ? "Bonne variété"
              : categories && categories.length > 3
              ? "Quelques catégories"
              : categories && categories.length > 0
              ? "Démarrage"
              : "Aucune catégorie",
        },
        footer: {
          primary:
            categories && categories.length > 15
              ? "Très diversifié"
              : categories && categories.length > 8
              ? "Bonne variété"
              : categories && categories.length > 3
              ? "Quelques catégories"
              : categories && categories.length > 0
              ? "Démarrage"
              : "Aucune catégorie",
          secondary: "catégories créées",
        },
      },
      {
        id: "trending",
        title: "Tendances",
        description: "Catégories populaires",
        value: trendingCount,
        trend: {
          value:
            trendingCount > 5
              ? 12.8
              : trendingCount > 2
              ? 7.4
              : trendingCount > 0
              ? 3.1
              : 0,
          isPositive: trendingCount > 0,
          label:
            trendingCount > 5
              ? "Très populaire"
              : trendingCount > 2
              ? "Populaire"
              : trendingCount > 0
              ? "Quelques tendances"
              : "Aucune tendance",
        },
        footer: {
          primary:
            trendingCount > 5
              ? "Très populaire"
              : trendingCount > 2
              ? "Populaire"
              : trendingCount > 0
              ? "Quelques tendances"
              : "Aucune tendance",
          secondary: "catégories tendance",
        },
      },
      {
        id: "standard",
        title: "Standard",
        description: "Catégories classiques",
        value: standardCount,
        trend: {
          value:
            standardCount > 10
              ? 8.9
              : standardCount > 5
              ? 5.2
              : standardCount > 0
              ? 2.1
              : 0,
          isPositive: standardCount > 0,
          label:
            standardCount > 10
              ? "Bien établi"
              : standardCount > 5
              ? "Établi"
              : standardCount > 0
              ? "Quelques standards"
              : "Aucun standard",
        },
        footer: {
          primary:
            standardCount > 10
              ? "Bien établi"
              : standardCount > 5
              ? "Établi"
              : standardCount > 0
              ? "Quelques standards"
              : "Aucun standard",
          secondary: "catégories standard",
        },
      },
    ],
    [categories, trendingCount, standardCount]
  );

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={3}
        tableRowsCount={5}
        tableColumnsCount={5}
        showSearchBar={true}
        showTableActions={true}
      />
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

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header Section */}
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

            {/* SectionCards */}
            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            {/* Nouveau tableau */}
            <CategoriesTable
              data={categories}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
            />
          </div>
        </div>
      </div>
    </>
  );
}
