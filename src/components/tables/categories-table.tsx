"use client";

import * as React from "react";
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
import { Category } from "@/types/category";
import { Input } from "@/components/ui/input";
import {
  Search,
  Tag,
  FileText,
  Hash,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";
import { ModifyCategoryDialog } from "@/components/modify-dialogs/modify-category-dialog";
import { CustomAlertDialog } from "../dialogs/custom-alert-dialog";
import { DragHandle } from "../ui/drag-handle";

const COLUMN_LABELS: Record<string, string> = {
  name: "Catégorie",
  description: "Description",
  key: "Clé",
  status: "Statut",
  trending: "Tendance",
};

export function CategoriesTable({
  data,
  search,
  onSearchChange,
  onDelete,
  deleteLoading,
  eventCounts,
}: {
  data: Category[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
  deleteLoading: boolean;
  eventCounts?: Record<string, number>;
}) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<Category | null>(null);
  const [modifyDialogOpen, setModifyDialogOpen] = React.useState(false);
  const [modifyTarget, setModifyTarget] = React.useState<Category | null>(null);

  const columns: ColumnDef<Category>[] = [
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
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
            <Tag className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">
              Catégorie #{row.original.key}
            </span>
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
          <span className="text-sm max-w-xs truncate">
            {row.original.description || "Aucune description"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "key",
      header: COLUMN_LABELS.key,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-muted-foreground" />
          <span className="font-mono text-sm">{row.original.key}</span>
        </div>
      ),
    },
    {
      accessorKey: "trending",
      header: COLUMN_LABELS.trending,
      cell: ({ row }) => (
        <div className="text-left">
          {row.original.trending ? (
            <Badge variant="default" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              Tendance
            </Badge>
          ) : (
            <Badge variant="secondary">Standard</Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "eventCount",
      header: "Nombre d'événements",
      cell: ({ row }) => (
        <Badge
          variant={
            (eventCounts?.[String(row.original.key)] ?? 0) > 0
              ? "default"
              : "outline"
          }
          className="text-xs min-w-[2rem] justify-center"
        >
          {eventCounts?.[String(row.original.key)] ?? 0}
        </Badge>
      ),
      enableHiding: false,
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
              onSelect={(e) => {
                e.preventDefault();
                setModifyTarget(row.original);
                setModifyDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
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
  ];

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const filteredData = React.useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (category) =>
        category.name.toLowerCase().includes(s) ||
        category.description.toLowerCase().includes(s) ||
        category.key.toLowerCase().includes(s)
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
      defaultValue="categories"
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher une catégorie..."
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
        value="categories"
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
                            Aucune catégorie ne correspond à votre recherche.
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
                          <Tag className="mb-2 h-8 w-8 text-muted-foreground" />
                          <div className="mb-1 text-base font-medium text-muted-foreground">
                            Aucune catégorie
                          </div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Aucune catégorie n'a été créée pour le moment.
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
        title="Supprimer la catégorie"
        description={
          deleteTarget
            ? `Êtes-vous sûr de vouloir supprimer la catégorie "${deleteTarget.name}" ? Cette action est irréversible et pourrait affecter les événements associés.`
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
      <ModifyCategoryDialog
        category={modifyTarget}
        open={modifyDialogOpen}
        onOpenChange={setModifyDialogOpen}
      />
    </Tabs>
  );
}
