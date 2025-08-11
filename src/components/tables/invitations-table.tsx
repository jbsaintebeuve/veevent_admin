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
import { Input } from "@/components/ui/input";
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
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  Check,
  X,
  Mail,
} from "lucide-react";

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
      cell: () => <DragHandle />,
      enableHiding: false,
      enableSorting: false,
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
          case "SENT":
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
          case "REJECTED":
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
        // Ne pas afficher les actions si l'invitation n'est pas en attente
        if (row.original.status !== "SENT") {
          return null;
        }

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
                disabled={actionLoading}
              >
                <IconDotsVertical />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onAccept(row.original);
                }}
                disabled={actionLoading}
              >
                <Check className="h-4 w-4 mr-2" />
                Accepter
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  onDecline(row.original);
                }}
                className="text-destructive focus:text-destructive"
                disabled={actionLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Refuser
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

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

  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      columnVisibility,
    },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Tabs
      defaultValue="invitations"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
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
                    {row.getVisibleCells().map((cell: any) => {
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
        </div>
      </TabsContent>
    </Tabs>
  );
}
