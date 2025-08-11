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
import { Event } from "@/types/event";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays, Edit, Trash2, Users } from "lucide-react";
import { ModifyEventDialog } from "@/components/modify-dialogs/modify-event-dialog";
import { CreateEventDialog } from "@/components/create-dialogs/create-event-dialog";
import { EventParticipantsDialog } from "@/components/dialogs/event-participants-dialog";
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
  date: "Date",
  status: "Statut",
  cityName: "Ville",
  placeName: "Lieu",
  currentParticipants: "Participants",
  categories: "Catégories",
  organizer: "Organisateur",
};

export function EventsTable({
  data,
  search,
  onSearchChange,
  onDelete,
  deleteLoading,
  hideDelete = false,
}: {
  data: Event[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
  deleteLoading: boolean;
  hideDelete?: boolean;
}) {
  const columns: ColumnDef<Event>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.original.id} />,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: COLUMN_LABELS.name,
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.name}</span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "date",
      header: COLUMN_LABELS.date,
      cell: ({ row }) =>
        new Date(row.original.date).toLocaleDateString("fr-FR"),
    },
    {
      accessorKey: "status",
      header: COLUMN_LABELS.status,
      cell: ({ row }) => {
        switch (row.original.status) {
          case "NOT_STARTED":
            return <Badge variant="default">À venir</Badge>;
          case "ONGOING":
            return <Badge variant="secondary">En cours</Badge>;
          case "COMPLETED":
            return <Badge variant="outline">Terminé</Badge>;
          case "CANCELLED":
            return <Badge variant="destructive">Annulé</Badge>;
          default:
            return <Badge variant="outline">{row.original.status}</Badge>;
        }
      },
    },
    {
      accessorKey: "cityName",
      header: COLUMN_LABELS.cityName,
      cell: ({ row }) => row.original.cityName,
    },
    {
      accessorKey: "placeName",
      header: COLUMN_LABELS.placeName,
      cell: ({ row }) => row.original.placeName,
    },
    {
      accessorKey: "currentParticipants",
      header: COLUMN_LABELS.currentParticipants,
      cell: ({ row }) =>
        `${row.original.currentParticipants} / ${row.original.maxCustomers}`,
    },
    {
      accessorKey: "categories",
      header: COLUMN_LABELS.categories,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categories.map((cat) => (
            <Badge key={cat.key} variant="secondary" className="text-xs">
              {cat.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "organizer",
      header: COLUMN_LABELS.organizer,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-7 w-7">
            <AvatarImage src={row.original.organizer.imageUrl || undefined} />
            <AvatarFallback>
              {row.original.organizer.firstName?.[0]}
              {row.original.organizer.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {row.original.organizer.pseudo ||
              `${row.original.organizer.firstName} ${row.original.organizer.lastName}`}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="w-full text-right"></div>,
      cell: ({ row }) => {
        const modifyBtnRef = React.useRef<HTMLButtonElement>(null);
        const [openDelete, setOpenDelete] = React.useState(false);
        const [openParticipants, setOpenParticipants] = React.useState(false);
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
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  modifyBtnRef.current?.click();
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setOpenParticipants(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Voir les participants
              </DropdownMenuItem>
              {!hideDelete && (
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
              )}
            </DropdownMenuContent>
            {/* Dialog Modifier avec bouton trigger caché */}
            <ModifyEventDialog event={row.original}>
              <button
                ref={modifyBtnRef}
                style={{ display: "none" }}
                type="button"
                tabIndex={-1}
              />
            </ModifyEventDialog>
            {/* Dialog Participants */}
            <EventParticipantsDialog
              eventSelfLink={row.original._links?.self?.href}
              eventName={row.original.name}
              isOpen={openParticipants}
              onOpenChange={setOpenParticipants}
            />
            {/* Dialog Supprimer - seulement si hideDelete est false */}
            {!hideDelete && (
              <AlertDialog open={openDelete} onOpenChange={setOpenDelete}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer l'événement</AlertDialogTitle>
                    <AlertDialogDescription>
                      Êtes-vous sûr de vouloir supprimer "{row.original.name}" ?
                      Cette action est irréversible.
                      {row.original.currentParticipants > 0 && (
                        <span className="block mt-2 text-destructive font-medium">
                          ⚠️ Cet événement a {row.original.currentParticipants}{" "}
                          participant(s) inscrit(s).
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
            )}
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

  // Filtrage des événements selon la recherche
  const filteredData = React.useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (event) =>
        event.name.toLowerCase().includes(s) ||
        event.description?.toLowerCase().includes(s) ||
        event.cityName?.toLowerCase().includes(s) ||
        event.placeName?.toLowerCase().includes(s) ||
        event.categories.some((cat) => cat.name.toLowerCase().includes(s)) ||
        event.organizer?.pseudo?.toLowerCase().includes(s) ||
        (event.organizer?.firstName + " " + event.organizer?.lastName)
          .toLowerCase()
          .includes(s)
    );
  }, [data, search]);

  const [tableData, setTableData] = React.useState(() => filteredData);
  React.useEffect(() => {
    setTableData(filteredData);
  }, [filteredData]);

  const dataIds = React.useMemo<UniqueIdentifier[]>(
    () => tableData?.map(({ id }) => id) || [],
    [tableData]
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      columnVisibility,
    },
    getRowId: (row) => row.id.toString(),
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
    <Tabs defaultValue="events" className="w-full flex-col justify-start gap-6">
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher un événement..."
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
        value="events"
        className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6"
      >
        <div className="overflow-hidden rounded-lg border shadow-xs">
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
                              Aucun événement ne correspond à votre recherche.
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
                            <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground" />
                            <div className="mb-1 text-base font-medium text-muted-foreground">
                              Aucun événement
                            </div>
                            <div className="mb-4 text-sm text-muted-foreground">
                              Commencez par créer votre premier événement.
                            </div>
                            <CreateEventDialog />
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
    id: row.original.id,
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
