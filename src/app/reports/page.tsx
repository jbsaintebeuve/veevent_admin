"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchReports } from "@/lib/fetch-reports";
import { Report, ReportsApiResponse } from "@/types/report";
import { useAuth } from "@/hooks/use-auth";
import { ReportsTable } from "@/components/tables/reports-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { getToken } = useAuth();

  const {
    data: reportsResponse,
    isLoading,
    error,
  } = useQuery<ReportsApiResponse>({
    queryKey: ["reports", currentPage],
    queryFn: () =>
      fetchReports(getToken() || undefined, currentPage - 1, pageSize),
  });

  const reports = reportsResponse?._embedded?.reports || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Filtrage des signalements avec recherche
  const filteredReports = useMemo(() => {
    if (!Array.isArray(reports)) return [];

    if (!search.trim()) return reports;

    const searchLower = search.toLowerCase();
    return reports.filter(
      (report) =>
        report.reportType.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower)
    );
  }, [reports, search]);

  // Statistiques des signalements
  const {
    totalReports,
    inappropriateContentCount,
    spamCount,
    harassmentCount,
    otherCount,
  } = useMemo(() => {
    const stats = {
      totalReports: 0,
      inappropriateContentCount: 0,
      spamCount: 0,
      harassmentCount: 0,
      otherCount: 0,
    };

    reports?.forEach((report) => {
      stats.totalReports++;
      switch (report.reportType.toUpperCase()) {
        case "INAPPROPRIATE_CONTENT":
          stats.inappropriateContentCount++;
          break;
        case "SPAM":
          stats.spamCount++;
          break;
        case "HARASSMENT":
          stats.harassmentCount++;
          break;
        default:
          stats.otherCount++;
          break;
      }
    });

    return stats;
  }, [reports]);

  // Données pour SectionCards
  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "total",
        title: "Total signalements",
        description: "Tous les signalements",
        value: totalReports,
        trend: {
          value:
            totalReports > 50
              ? 15.2
              : totalReports > 20
              ? 8.7
              : totalReports > 5
              ? 3.4
              : 0,
          isPositive: totalReports > 0,
          label:
            totalReports > 50
              ? "Beaucoup de signalements"
              : totalReports > 20
              ? "Signalements modérés"
              : totalReports > 5
              ? "Quelques signalements"
              : "Aucun signalement",
        },
        footer: {
          primary:
            totalReports > 50
              ? "Beaucoup de signalements"
              : totalReports > 20
              ? "Signalements modérés"
              : totalReports > 5
              ? "Quelques signalements"
              : "Aucun signalement",
          secondary: totalReports === 1 ? "signalement" : "signalements",
        },
      },
      {
        id: "inappropriate",
        title: "Contenu inapproprié",
        description: "Signalements de contenu inapproprié",
        value: inappropriateContentCount,
        trend: {
          value:
            inappropriateContentCount > 10
              ? 12.8
              : inappropriateContentCount > 5
              ? 6.3
              : inappropriateContentCount > 0
              ? 2.1
              : 0,
          isPositive: inappropriateContentCount > 0,
          label:
            inappropriateContentCount > 10
              ? "Problème important"
              : inappropriateContentCount > 5
              ? "Problème modéré"
              : inappropriateContentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
        },
        footer: {
          primary:
            inappropriateContentCount > 10
              ? "Problème important"
              : inappropriateContentCount > 5
              ? "Problème modéré"
              : inappropriateContentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
          secondary:
            inappropriateContentCount === 1 ? "signalement" : "signalements",
        },
      },
      {
        id: "spam",
        title: "Spam",
        description: "Signalements de spam",
        value: spamCount,
        trend: {
          value:
            spamCount > 15
              ? 18.5
              : spamCount > 8
              ? 10.2
              : spamCount > 0
              ? 4.7
              : 0,
          isPositive: spamCount > 0,
          label:
            spamCount > 15
              ? "Spam important"
              : spamCount > 8
              ? "Spam modéré"
              : spamCount > 0
              ? "Quelques spams"
              : "Aucun spam",
        },
        footer: {
          primary:
            spamCount > 15
              ? "Spam important"
              : spamCount > 8
              ? "Spam modéré"
              : spamCount > 0
              ? "Quelques spams"
              : "Aucun spam",
          secondary: spamCount === 1 ? "signalement" : "signalements",
        },
      },
      {
        id: "harassment",
        title: "Harcèlement",
        description: "Signalements de harcèlement",
        value: harassmentCount,
        trend: {
          value:
            harassmentCount > 5
              ? 14.3
              : harassmentCount > 2
              ? 7.8
              : harassmentCount > 0
              ? 3.2
              : 0,
          isPositive: harassmentCount > 0,
          label:
            harassmentCount > 5
              ? "Harcèlement important"
              : harassmentCount > 2
              ? "Harcèlement modéré"
              : harassmentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
        },
        footer: {
          primary:
            harassmentCount > 5
              ? "Harcèlement important"
              : harassmentCount > 2
              ? "Harcèlement modéré"
              : harassmentCount > 0
              ? "Quelques cas"
              : "Aucun cas",
          secondary: harassmentCount === 1 ? "signalement" : "signalements",
        },
      },
    ],
    [totalReports, inappropriateContentCount, spamCount, harassmentCount]
  );

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={4}
        tableRowsCount={5}
        tableColumnsCount={6}
        showSearchBar={true}
        showTableActions={true}
        showActionButton={false}
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
              Erreur lors du chargement des signalements. Veuillez réessayer.
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
                  Signalements
                </h1>
                <p className="text-muted-foreground">
                  Gérez tous les signalements de votre plateforme
                </p>
              </div>
            </div>

            {/* SectionCards */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* Nouveau tableau */}
            <ReportsTable
              data={reports || []}
              search={search}
              onSearchChange={setSearch}
            />

            {/* Pagination */}
            {reportsResponse?.page && reportsResponse.page.totalPages > 1 && (
              <div className="flex justify-center px-4 lg:px-6">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={reportsResponse.page.totalPages}
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
