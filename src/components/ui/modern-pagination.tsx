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

  // Générer les numéros de pages à afficher
  const generatePageNumbers = () => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Afficher toutes les pages si le total est petit
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ellipses
      if (currentPage <= 3) {
        // Au début : 1, 2, 3, 4, ..., totalPages
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // À la fin : 1, ..., totalPages-3, totalPages-2, totalPages-1, totalPages
        pages.push(1);
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Au milieu : 1, ..., currentPage-1, currentPage, currentPage+1, ..., totalPages
        pages.push(1);
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
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
          {/* Bouton Précédent */}
          <PaginationItem>
            <PaginationPrevious
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              className={
                currentPage === 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer hover:bg-accent hover:text-accent-foreground"
              }
            />
          </PaginationItem>
          {/* Numéros de pages */}
          {generatePageNumbers().map((page, index) => (
            <PaginationItem key={index}>
              {page === "ellipsis" ? (
                <PaginationEllipsis />
              ) : (
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer hover:bg-accent hover:text-accent-foreground"
                >
                  {page}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}
          {/* Bouton Suivant */}
          <PaginationItem>
            <PaginationNext
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              className={
                currentPage === totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer hover:bg-accent hover:text-accent-foreground"
              }
            />
          </PaginationItem>{" "}
        </PaginationContent>
      </Pagination>
    </div>
  );
}
