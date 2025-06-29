"use client";

import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  IconChevronDown,
  IconDotsVertical,
  IconGripVertical,
  IconLayoutColumns,
  IconPlus,
  IconSearch,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { City } from "@/types/city";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CreateCityDialog } from "@/components/create-dialogs/create-city-dialog";
import { ModifyCityDialog } from "@/components/modify-dialogs/modify-city-dialog";

function DragHandle({ id }: { id: number }) {
  const { attributes, listeners } = useSortable({ id });
  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground size-7 hover:bg-transparent"
    >
      <IconGripVertical className="text-muted-foreground size-3" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

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
  deleteLoading,
}: {
  data: City[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
  deleteLoading: boolean;
}) {
  const columns: ColumnDef<City>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.index} />,
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
              <ModifyCityDialog city={row.original} cities={data}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </DropdownMenuItem>
              </ModifyCityDialog>
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
                  <AlertDialogTitle>Supprimer la ville</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer "{row.original.name}" ?
                    Cette action est irréversible.
                    {row.original.eventsCount > 0 && (
                      <span className="block mt-2 text-destructive font-medium">
                        ⚠️ Cette ville a {row.original.eventsCount} événement(s)
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

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const sortableId = React.useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Filtrage des villes selon la recherche
  const filteredData = React.useMemo(() => {
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

  const [tableData, setTableData] = React.useState(() => filteredData);
  React.useEffect(() => {
    setTableData(filteredData);
  }, [filteredData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => tableData?.map((_, index) => index) || [],
    [tableData]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnVisibility,
    },
    getRowId: (row, index) => index?.toString() || "0",
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setTableData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(data, oldIndex, newIndex);
      });
    }
  }

  return (
    <Tabs defaultValue="cities" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
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
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
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
                            isActions
                              ? "text-right w-0 min-w-[64px]"
                              : undefined
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
                  <SortableContext
                    items={dataIds}
                    strategy={verticalListSortingStrategy}
                  >
                    {table.getRowModel().rows.map((row) => (
                      <DraggableRow key={row.id} row={row} />
                    ))}
                  </SortableContext>
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
                              Commencez par créer votre première ville.
                            </div>
                            <CreateCityDialog cities={data} />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </div>
      </TabsContent>
    </Tabs>
  );
}

function DraggableRow({ row }: { row: any }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.index,
  });
  return (
    <TableRow
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {row.getVisibleCells().map((cell: any) => {
        const isActions = cell.column.id === "actions";
        return (
          <TableCell
            key={cell.id}
            className={isActions ? "text-right w-0 min-w-[64px]" : undefined}
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCell>
        );
      })}
    </TableRow>
  );
}
