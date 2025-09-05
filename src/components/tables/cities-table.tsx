"use client";

import {
  IconChevronDown,
  IconDotsVertical,
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
  DropdownMenuItem,
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
import { City } from "@/types/city";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building, Edit, Trash2 } from "lucide-react";
import { ModifyCityDialog } from "@/components/modify-dialogs/modify-city-dialog";
import { CustomAlertDialog } from "../dialogs/custom-alert-dialog";
import { DragHandle } from "../ui/drag-handle";
import { useState, useMemo } from "react";

const COLUMN_LABELS: Record<string, string> = {
  name: "Nom",
  region: "Région",
  country: "Pays",
  postalCode: "Code postal",
  eventsCount: "Événements actifs",
  eventsPastCount: "Événements passés",
};

export function CitiesTable({
  data,
  search,
  onSearchChange,
  onDelete,
}: {
  data: City[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<City | null>(null);
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [modifyTarget, setModifyTarget] = useState<City | null>(null);

  const columns: ColumnDef<City>[] = useMemo(
    () => [
      {
        id: "drag",
        header: () => null,
        cell: () => <DragHandle />,
        enableHiding: false,
      },
      {
        accessorKey: "name",
        header: COLUMN_LABELS.name,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate font-medium">{row.original.name}</span>
          </div>
        ),
        enableHiding: false,
      },
      {
        accessorKey: "region",
        header: COLUMN_LABELS.region,
        cell: ({ row }) => (
          <Badge variant="outline" className="text-xs">
            {row.original.region}
          </Badge>
        ),
      },
      {
        accessorKey: "country",
        header: COLUMN_LABELS.country,
        cell: ({ row }) => (
          <Badge variant="secondary" className="text-xs">
            {row.original.country}
          </Badge>
        ),
      },
      {
        accessorKey: "postalCode",
        header: COLUMN_LABELS.postalCode,
        cell: ({ row }) => (
          <span className="text-muted-foreground text-sm">
            {row.original.postalCode}
          </span>
        ),
      },
      {
        accessorKey: "eventsCount",
        header: COLUMN_LABELS.eventsCount,
        cell: ({ row }) => (
          <Badge
            variant={row.original.eventsCount > 0 ? "default" : "outline"}
            className="text-xs min-w-[2rem] justify-center"
          >
            {row.original.eventsCount}
          </Badge>
        ),
      },
      {
        accessorKey: "eventsPastCount",
        header: COLUMN_LABELS.eventsPastCount,
        cell: ({ row }) => (
          <Badge
            variant="outline"
            className="text-xs min-w-[2rem] justify-center"
          >
            {row.original.eventsPastCount}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: () => <div className="w-full text-right"></div>,
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
              >
                <IconDotsVertical />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onSelect={() => {
                  setModifyTarget(row.original);
                  setModifyDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => {
                  setDeleteTarget(row.original);
                  setDeleteDialogOpen(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    []
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Filtrage des villes selon la recherche
  const filteredData = useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (city) =>
        city.name.toLowerCase().includes(s) ||
        city.country.toLowerCase().includes(s) ||
        city.region.toLowerCase().includes(s) ||
        city.postalCode.toLowerCase().includes(s)
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
    <Tabs defaultValue="cities" className="w-full flex-col justify-start gap-6">
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher une ville..."
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
        value="cities"
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
                            Aucune ville ne correspond à votre recherche.
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
                          <Building className="mb-2 h-8 w-8 text-muted-foreground" />
                          <div className="mb-1 text-base font-medium text-muted-foreground">
                            Aucune ville
                          </div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Aucune ville n'a été créée pour le moment.
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

      {/* Dialog Supprimer Centralisé */}
      <CustomAlertDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Supprimer la ville"
        description={
          deleteTarget
            ? `Êtes-vous sûr de vouloir supprimer "${deleteTarget.name}" ? Cette action est irréversible.`
            : ""
        }
        action="Supprimer"
        onClick={() => {
          if (deleteTarget) {
            onDelete(deleteTarget._links?.self?.href, deleteTarget.name);
          }
        }}
      />

      {/* Dialog Modifier Centralisé */}
      <ModifyCityDialog
        city={modifyTarget}
        open={modifyDialogOpen}
        onOpenChange={setModifyDialogOpen}
      />
    </Tabs>
  );
}
