"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ModernPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  showInfo?: boolean;
  totalElements?: number;
  pageSize?: number;
}

export function ModernPagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showInfo = false,
  totalElements = 0,
  pageSize = 10,
}: ModernPaginationProps) {
  // Ne pas afficher la pagination s'il n'y a qu'une page ou moins
  if (totalPages <= 1) return null;

  // Générer les numéros de pages à afficher selon le pattern shadcn/ui
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si le total est petit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Pattern shadcn/ui : toujours 1, puis ellipses si nécessaire, pages autour de current, ellipses, dernière
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      // Pages autour de la page courante
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
      {showInfo && totalElements > 0 && (
        <div className="text-sm text-muted-foreground">
          Page {currentPage} sur {totalPages} ({totalElements} éléments au
          total)
        </div>
      )}

      <Pagination className={className}>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={handlePrevious}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {generatePageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              onClick={handleNext}
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
