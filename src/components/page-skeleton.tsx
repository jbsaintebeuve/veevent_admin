"use client";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  showActionButton?: boolean;
  cardsCount?: number;
  tableRowsCount?: number;
  showSearchBar?: boolean;
  showTableActions?: boolean;
}

export function PageSkeleton({
  showActionButton = true,
  cardsCount = 4,
  tableRowsCount = 5,
  showSearchBar = true,
  showTableActions = true,
}: PageSkeletonProps) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-6 py-4 md:py-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
              <div>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
              {showActionButton && <Skeleton className="h-10 w-32" />}
            </div>

            {/* Stats Cards Skeleton */}
            {cardsCount > 0 && (
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {[...Array(cardsCount)].map((_, i) => (
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
            )}

            {/* Table Section */}
            <div className="px-4 lg:px-6 flex flex-col gap-6">
              {/* Table Header with Search and Actions */}
              {(showSearchBar || showTableActions) && (
                <div className="flex gap-2 items-center justify-between">
                  {showSearchBar && <Skeleton className="h-9 w-64" />}
                  {showTableActions && <Skeleton className="h-9 w-32" />}
                </div>
              )}

              {/* Table */}
              <Card className="shadow-xs">
                <CardContent>
                  <div className="space-y-6">
                    {[...Array(tableRowsCount)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
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
