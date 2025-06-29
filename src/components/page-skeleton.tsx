"use client";

import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PageSkeletonProps {
  title?: string;
  description?: string;
  showActionButton?: boolean;
  cardsCount?: number;
  tableRowsCount?: number;
  tableColumnsCount?: number;
  showSearchBar?: boolean;
  showTableActions?: boolean;
  showAvatars?: boolean;
}

export function PageSkeleton({
  title = "Chargement...",
  description = "Chargement en cours...",
  showActionButton = true,
  cardsCount = 4,
  tableRowsCount = 5,
  tableColumnsCount = 6,
  showSearchBar = true,
  showTableActions = true,
  showAvatars = false,
}: PageSkeletonProps) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* Header Section */}
            <div className="flex items-center justify-between px-4 lg:px-6">
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
            <div className="px-4 lg:px-6">
              {/* Table Header with Search and Actions */}
              {(showSearchBar || showTableActions) && (
                <div className="flex items-center justify-between mb-4">
                  {showSearchBar && <Skeleton className="h-9 w-64" />}
                  {showTableActions && (
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  )}
                </div>
              )}

              {/* Table */}
              <Card className="shadow-xs">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    {[...Array(tableRowsCount)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        {showAvatars && (
                          <Skeleton className="h-10 w-10 rounded-full" />
                        )}
                        {[...Array(tableColumnsCount)].map((_, j) => (
                          <Skeleton
                            key={j}
                            className={
                              j === 0
                                ? "h-4 flex-1"
                                : j === tableColumnsCount - 1
                                ? "h-8 w-16"
                                : "h-4 w-24"
                            }
                          />
                        ))}
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
