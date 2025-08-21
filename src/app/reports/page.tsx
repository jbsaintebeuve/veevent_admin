"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { fetchReports } from "@/services/report-service";
import { Report, ReportsApiResponse } from "@/types/report";
import { useAuth } from "@/hooks/use-auth";
import { ReportsTable } from "@/components/tables/reports-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { useReportsCards } from "@/hooks/data-cards/use-reports-cards";

export default function ReportsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { token } = useAuth();

  const {
    data: reportsResponse,
    isLoading,
    error,
  } = useQuery<ReportsApiResponse>({
    queryKey: ["reports", currentPage],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchReports(token, currentPage - 1, pageSize);
    },
  });

  const reports = reportsResponse?._embedded?.reports || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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

  const cardsData = useReportsCards({
    totalReports,
    inappropriateContentCount,
    spamCount,
    harassmentCount,
  });

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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Signalements
                </h1>
                <p className="text-muted-foreground">
                  Gérez tous les signalements de votre plateforme
                </p>
              </div>
            </div>

            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            <ReportsTable
              data={reports || []}
              search={search}
              onSearchChange={setSearch}
            />

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
