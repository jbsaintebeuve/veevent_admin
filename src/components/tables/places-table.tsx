"use client";

import * as React from "react";
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
import { Place, placeTypes } from "@/types/place";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CreatePlaceDialog } from "@/components/create-dialogs/create-place-dialog";
import { ModifyPlaceDialog } from "@/components/modify-dialogs/modify-place-dialog";

function DragHandle() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent cursor-default"
      disabled
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag handle (disabled)</span>
    </Button>
  );
}

const COLUMN_LABELS: Record<string, string> = {
  name: "Nom",
  type: "Type",
  address: "Adresse",
  cityName: "Ville",
  eventsCount: "Événements actifs",
  eventsPastCount: "Événements passés",
};

// Définition des colonnes en dehors du composant pour éviter les re-créations
const createColumns = (
  onDelete: (deleteUrl: string, name: string) => void,
  data: Place[]
): ColumnDef<Place>[] => [
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
    accessorKey: "type",
    header: COLUMN_LABELS.type,
    cell: ({ row }) => {
      const label =
        placeTypes.find((type) => type.value === row.original.type)?.label ||
        "Non défini";
      return (
        <Badge variant="outline" className="text-xs">
          {label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "address",
    header: COLUMN_LABELS.address,
    cell: ({ row }) => (
      <span
        className="text-muted-foreground text-sm truncate block max-w-[180px]"
        title={row.original.address}
      >
        {row.original.address}
      </span>
    ),
  },
  {
    accessorKey: "cityName",
    header: COLUMN_LABELS.cityName,
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.original.cityName}
      </Badge>
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
      <Badge variant="outline" className="text-xs min-w-[2rem] justify-center">
        {row.original.eventsPastCount}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: () => <div className="w-full text-right"></div>,
    cell: ({ row }) => {
      const [openDelete, setOpenDelete] = React.useState(false);
      return (
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
            <ModifyPlaceDialog place={row.original}>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
            </ModifyPlaceDialog>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setOpenDelete(true);
              }}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
          {/* Dialog Supprimer */}
          <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Supprimer le lieu</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir supprimer "{row.original.name}" ?
                  Cette action est irréversible.
                  {row.original.eventsCount > 0 && (
                    <span className="block mt-2 text-destructive font-medium">
                      ⚠️ Ce lieu a {row.original.eventsCount} événement(s)
                      actif(s).
                    </span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(
                      row.original._links?.self?.href,
                      row.original.name
                    );
                    setOpenDelete(false);
                  }}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenu>
      );
    },
  },
];

export function PlacesTable({
  data,
  search,
  onSearchChange,
  onDelete,
  deleteLoading,
}: {
  data: Place[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
  deleteLoading: boolean;
}) {
  // Mémorisation des colonnes pour éviter les re-créations
  const columns = React.useMemo(
    () => createColumns(onDelete, data),
    [onDelete, data]
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Filtrage des lieux selon la recherche
  const filteredData = React.useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (place) =>
        place.name.toLowerCase().includes(s) ||
        place.address.toLowerCase().includes(s) ||
        place.cityName.toLowerCase().includes(s) ||
        (place.type && place.type.toLowerCase().includes(s)) ||
        (place.description && place.description.toLowerCase().includes(s))
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
    <Tabs defaultValue="places" className="w-full flex-col justify-start gap-6">
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher un lieu..."
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
        value="places"
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
                      const isActions = cell.column.id === "actions";
                      return (
                        <TableCell
                          key={cell.id}
                          className={
                            isActions
                              ? "text-right w-0 min-w-[64px]"
                              : undefined
                          }
                        >
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
                            Aucun lieu ne correspond à votre recherche.
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
                          <Building2 className="mb-2 h-8 w-8 text-muted-foreground" />
                          <div className="mb-1 text-base font-medium text-muted-foreground">
                            Aucun lieu
                          </div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Commencez par créer votre premier lieu.
                          </div>
                          <CreatePlaceDialog />
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
