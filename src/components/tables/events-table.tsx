"use client";

import {
  IconChevronDown,
  IconDotsVertical,
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
import { Event } from "@/types/event";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, CalendarDays, Edit, Trash2, Users } from "lucide-react";
import { ModifyEventDialog } from "@/components/modify-dialogs/modify-event-dialog";
import { EventParticipantsDialog } from "@/components/dialogs/event-participants-dialog";
import { CustomAlertDialog } from "../dialogs/custom-alert-dialog";
import { DragHandle } from "../ui/drag-handle";
import { useState, useMemo } from "react";

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
  // States pour dialogs centralisés
  const [modifyDialogOpen, setModifyDialogOpen] = useState(false);
  const [modifyTarget, setModifyTarget] = useState<Event | null>(null);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [participantsTarget, setParticipantsTarget] = useState<Event | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);

  const columns: ColumnDef<Event>[] = useMemo(
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
          <div className="flex gap-2">
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
            <div className="flex flex-col">
              <span className="font-medium">
                {row.original.organizer.firstName}
                {row.original.organizer.lastName}
              </span>
              <span className="text-xs text-muted-foreground">
                @{row.original.organizer.pseudo}
              </span>
            </div>
          </div>
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
            <DropdownMenuContent align="end" className="w-48">
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
                  setParticipantsTarget(row.original);
                  setParticipantsDialogOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Voir les participants
              </DropdownMenuItem>
              {!hideDelete && (
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
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [hideDelete]
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  // Filtrage des événements selon la recherche

  const filteredData = useMemo(() => {
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

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnVisibility,
    },
    getRowId: (row) => row.id.toString(),
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

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
                            Aucun événement n'a été créé pour le moment.
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

      <EventParticipantsDialog
        eventSelfLink={participantsTarget?._links?.self?.href}
        eventName={participantsTarget?.name}
        isOpen={participantsDialogOpen}
        onOpenChange={setParticipantsDialogOpen}
      />

      {/* Dialog Supprimer Centralisé */}
      {!hideDelete && (
        <CustomAlertDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Supprimer l'événement"
          description={
            deleteTarget
              ? `Êtes-vous sûr de vouloir supprimer l'événement "${deleteTarget.name}" ? Cette action est irréversible.` +
                (typeof deleteTarget.currentParticipants === "number" &&
                deleteTarget.currentParticipants > 0
                  ? `\n\nCet événement a ${deleteTarget.currentParticipants} participant(s) inscrit(s).`
                  : "")
              : ""
          }
          action="Supprimer"
          onClick={() => {
            if (deleteTarget) {
              onDelete(deleteTarget._links?.self?.href, deleteTarget.name);
            }
          }}
        />
      )}

      {/* Dialog Modifier Centralisé */}
      <ModifyEventDialog
        event={modifyTarget}
        open={modifyDialogOpen}
        onOpenChange={setModifyDialogOpen}
      />
    </Tabs>
  );
}
