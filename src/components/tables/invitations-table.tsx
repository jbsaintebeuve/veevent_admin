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
import { Invitation } from "@/types/invitation";
import { Input } from "@/components/ui/input";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Check,
  X,
  Mail,
} from "lucide-react";
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
  description: "Description",
  status: "Statut",
};

export function InvitationsTable({
  data,
  search,
  onSearchChange,
  onAccept,
  onDecline,
  actionLoading,
}: {
  data: Invitation[];
  search: string;
  onSearchChange: (v: string) => void;
  onAccept: (invitation: Invitation) => void;
  onDecline: (invitation: Invitation) => void;
  actionLoading: boolean;
}) {
  const columns: ColumnDef<Invitation>[] = [
    {
      id: "drag",
      header: () => null,
      cell: ({ row }) => <DragHandle id={row.index} />,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: COLUMN_LABELS.description,
      cell: ({ row }) => (
        <span className="font-medium">{row.original.description}</span>
      ),
      enableHiding: false,
    },
    {
      accessorKey: "status",
      header: COLUMN_LABELS.status,
      cell: ({ row }) => {
        switch (row.original.status) {
          case "PENDING":
            return (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                En attente
              </Badge>
            );
          case "ACCEPTED":
            return (
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Acceptée
              </Badge>
            );
          case "DECLINED":
            return (
              <Badge variant="destructive" className="gap-1">
                <XCircle className="h-3 w-3" />
                Refusée
              </Badge>
            );
          default:
            return <Badge variant="outline">{row.original.status}</Badge>;
        }
      },
    },
    {
      id: "actions",
      header: () => <div className="w-full text-right"></div>,
      cell: ({ row }) => {
        const [openAccept, setOpenAccept] = React.useState(false);
        const [openDecline, setOpenDecline] = React.useState(false);

        // Ne pas afficher les actions si l'invitation n'est pas en attente
        if (row.original.status !== "PENDING") {
          return null;
        }

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
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setOpenAccept(true);
                }}
                className="text-green-600 focus:text-green-600"
              >
                <Check className="h-4 w-4 mr-2" />
                Accepter
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setOpenDecline(true);
                }}
                className="text-destructive focus:text-destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Refuser
              </DropdownMenuItem>
            </DropdownMenuContent>

            {/* Dialog Accepter */}
            <AlertDialog open={openAccept} onOpenChange={setOpenAccept}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Accepter l'invitation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir accepter cette invitation ?
                    <br />
                    <span className="font-medium">
                      {row.original.description}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onAccept(row.original);
                      setOpenAccept(false);
                    }}
                    className="bg-green-600 text-white hover:bg-green-700"
                    disabled={actionLoading}
                  >
                    Accepter
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* Dialog Refuser */}
            <AlertDialog open={openDecline} onOpenChange={setOpenDecline}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Refuser l'invitation</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir refuser cette invitation ?
                    <br />
                    <span className="font-medium">
                      {row.original.description}
                    </span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      onDecline(row.original);
                      setOpenDecline(false);
                    }}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={actionLoading}
                  >
                    Refuser
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

  // Filtrage des invitations selon la recherche
  const filteredData = React.useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (invitation) =>
        invitation.description.toLowerCase().includes(s) ||
        invitation.status.toLowerCase().includes(s)
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
    <Tabs
      defaultValue="invitations"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher une invitation..."
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
        value="invitations"
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
                          className={`${
                            isActions ? "text-right" : "text-left"
                          }`}
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
                              Aucune invitation ne correspond à votre recherche.
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
                            <Mail className="mb-2 h-8 w-8 text-muted-foreground" />
                            <div className="mb-1 text-base font-medium text-muted-foreground">
                              Aucune invitation
                            </div>
                            <div className="mb-4 text-sm text-muted-foreground">
                              Vous n'avez reçu aucune invitation pour le moment.
                            </div>
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.index,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={isDragging ? "opacity-50" : ""}
      {...attributes}
      {...listeners}
    >
      {row.getVisibleCells().map((cell: any) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}
