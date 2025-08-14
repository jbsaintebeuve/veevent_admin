"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { useCategoriesCards } from "@/hooks/data-cards/use-categories-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { CreateCategoryDialog } from "@/components/create-dialogs/create-category-dialog";
import {
  fetchCategories,
  deleteCategory,
  fetchCategoriesCounts,
} from "@/lib/fetch-categories";
import { useAuth } from "@/hooks/use-auth";
import { CategoriesApiResponse } from "@/types/category";
import { CategoriesTable } from "@/components/tables/categories-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { getDeleteErrorMessage, EntityTypes } from "@/lib/error-messages";

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const token = useMemo(() => getToken() || undefined, [getToken]);

  const {
    data: categoriesResponse,
    isLoading,
    error,
  } = useQuery<CategoriesApiResponse>({
    queryKey: ["categories", currentPage],
    queryFn: () => fetchCategories(token, currentPage - 1, pageSize),
  });

  const {
    data: categoriesCounts,
    isLoading: isLoadingCounts,
    error: errorCounts,
  } = useQuery<Record<string, number>>({
    queryKey: ["categories-counts"],
    queryFn: () => fetchCategoriesCounts(token),
  });

  const categories = categoriesResponse?._embedded?.categories || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: (deleteUrl: string) => deleteCategory(deleteUrl, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Catégorie supprimée avec succès");
    },
    onError: (error: Error) => {
      console.error("Erreur de suppression:", error);
      const errorMessage = getDeleteErrorMessage(error, EntityTypes.CATEGORY);
      toast.error(errorMessage);
    },
  });

  const handleDelete = useCallback(
    (deleteUrl: string, name: string) => {
      console.log(
        `🗑️ Tentative de suppression de la catégorie "${name}" via URL:`,
        deleteUrl
      );
      deleteMutation.mutate(deleteUrl);
    },
    [deleteMutation]
  );

  const { trendingCount, standardCount, totalCategories } = useMemo(() => {
    const trending = categories?.filter((c) => c.trending).length || 0;
    const standard = (categories?.length || 0) - trending;
    const total =
      categoriesResponse?.page?.totalElements ?? categories.length ?? 0;
    return {
      trendingCount: trending,
      standardCount: standard,
      totalCategories: total,
    };
  }, [categories, categoriesResponse]);

  const cardsData = useCategoriesCards({
    totalCategories,
    trendingCount,
    standardCount,
  });

  if (isLoading || isLoadingCounts) {
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

  if (error || errorCounts) {
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
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

            <SectionCards cards={cardsData} gridCols={3} className="mb-2" />

            <CategoriesTable
              data={categories}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={deleteMutation.isPending}
              eventCounts={categoriesCounts}
            />

            {categoriesResponse?.page &&
              categoriesResponse.page.totalPages > 1 && (
                <div className="flex justify-center px-4 lg:px-6">
                  <PaginationWrapper
                    currentPage={currentPage}
                    totalPages={categoriesResponse.page.totalPages}
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
