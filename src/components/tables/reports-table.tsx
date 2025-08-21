"use client";

import * as React from "react";
import {
  IconChevronDown,
  IconGripVertical,
  IconLayoutColumns,
} from "@tabler/icons-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Report } from "@/types/report";
import { Input } from "@/components/ui/input";
import { Search, AlertTriangle, FileText } from "lucide-react";
import { DragHandle } from "../ui/drag-handle";

const COLUMN_LABELS: Record<string, string> = {
  reportType: "Type de signalement",
  description: "Description",
  date: "Date",
  priority: "Priorité",
};

// Définition des colonnes en dehors du composant pour éviter les re-créations
const createColumns = (): ColumnDef<Report>[] => [
  {
    id: "drag",
    header: () => null,
    cell: () => <DragHandle />,
    enableHiding: false,
  },
  {
    accessorKey: "reportType",
    header: COLUMN_LABELS.reportType,
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col">
          {(() => {
            switch (row.original.reportType.toUpperCase()) {
              case "INAPPROPRIATE_CONTENT":
                return <Badge variant="destructive">Contenu inapproprié</Badge>;
              case "SPAM":
                return <Badge variant="secondary">Spam</Badge>;
              case "HARASSMENT":
                return <Badge variant="destructive">Harcèlement</Badge>;
              case "FAKE_EVENT":
                return <Badge variant="outline">Événement fictif</Badge>;
              case "INAPPROPRIATE_BEHAVIOR":
                return (
                  <Badge variant="destructive">Comportement inapproprié</Badge>
                );
              default:
                return (
                  <Badge variant="outline">{row.original.reportType}</Badge>
                );
            }
          })()}
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: COLUMN_LABELS.description,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm max-w-md truncate">
          {row.original.description}
        </span>
      </div>
    ),
  },

  {
    accessorKey: "priority",
    header: COLUMN_LABELS.priority,
    cell: ({ row }) => {
      const reportType = row.original.reportType.toUpperCase();
      if (
        reportType === "HARASSMENT" ||
        reportType === "INAPPROPRIATE_BEHAVIOR"
      ) {
        return <Badge variant="destructive">Haute</Badge>;
      } else if (reportType === "INAPPROPRIATE_CONTENT") {
        return <Badge variant="default">Moyenne</Badge>;
      } else {
        return <Badge variant="secondary">Basse</Badge>;
      }
    },
  },
];

export function ReportsTable({
  data,
  search,
  onSearchChange,
}: {
  data: Report[];
  search: string;
  onSearchChange: (v: string) => void;
}) {
  // Mémorisation des colonnes pour éviter les re-créations
  const columns = React.useMemo(() => createColumns(), []);

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Filtrage des signalements selon la recherche
  const filteredData = React.useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (report) =>
        report.reportType.toLowerCase().includes(s) ||
        report.description.toLowerCase().includes(s)
    );
  }, [data, search]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnVisibility,
    },
    getRowId: (row, index) => index?.toString() || "0",
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Tabs
      defaultValue="reports"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher un signalement..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3">
                <IconLayoutColumns />
                <span className="hidden lg:inline">Colonnes</span>
                <span className="lg:hidden">Colonnes</span>
                <IconChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {COLUMN_LABELS[column.id as string] || column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <TabsContent
        value="reports"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="bg-muted sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const isActions = header.column.id === "actions";
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className={
                          isActions ? "text-right w-0 min-w-[64px]" : undefined
                        }
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-64 align-middle p-0"
                  >
                    <div className="flex flex-col items-center justify-center h-full py-8">
                      {search ? (
                        <>
                          <Search className="mb-2 h-8 w-8 text-muted-foreground" />
                          <div className="mb-1 text-base font-medium text-muted-foreground">
                            Aucun signalement ne correspond à votre recherche.
                          </div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Essayez de modifier ou réinitialiser votre
                            recherche.
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-3"
                            onClick={() => onSearchChange("")}
                          >
                            Réinitialiser la recherche
                          </Button>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="mb-2 h-8 w-8 text-muted-foreground" />
                          <div className="mb-1 text-base font-medium text-muted-foreground">
                            Aucun signalement
                          </div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Aucun signalement n'a été rapporté pour le moment.
                          </div>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </TabsContent>
    </Tabs>
  );
}
