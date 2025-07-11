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
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users, User as UserIcon, Mail, Calendar } from "lucide-react";
import { Check, Ban } from "lucide-react";

// Icône drag visuelle seulement (pas de fonctionnalité)
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
  pseudo: "Pseudo",
  email: "Email",
  role: "Rôle",
  eventsCount: "Événements",
  eventPastCount: "Événements passés",
  phone: "Téléphone",
};

// Définition des colonnes en dehors du composant pour éviter les re-créations
const createColumns = (
  onDelete: (deleteUrl: string, name: string) => void,
  onBanToggle: (user: User) => void
): ColumnDef<User>[] => [
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
        <Avatar className="h-8 w-8">
          <AvatarImage
            src={row.original.imageUrl || undefined}
            alt={`${row.original.firstName} ${row.original.lastName}`}
          />
          <AvatarFallback>
            {`${row.original.firstName.charAt(0)}${row.original.lastName.charAt(
              0
            )}`}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
          <span className="text-xs text-muted-foreground">
            ID: {row.original.id}
          </span>
        </div>
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "pseudo",
    header: COLUMN_LABELS.pseudo,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <UserIcon className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">@{row.original.pseudo}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: COLUMN_LABELS.email,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{row.original.email}</span>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: COLUMN_LABELS.role,
    cell: ({ row }) => {
      switch (row.original.role.toUpperCase()) {
        case "ADMIN":
          return <Badge variant="destructive">Admin</Badge>;
        case "ORGANIZER":
          return <Badge variant="default">Organisateur</Badge>;
        case "USER":
          return <Badge variant="secondary">Utilisateur</Badge>;
        case "AUTHSERVICE":
          return <Badge variant="outline">Auth Service</Badge>;
        default:
          return <Badge variant="outline">{row.original.role}</Badge>;
      }
    },
  },
  {
    accessorKey: "eventsCount",
    header: COLUMN_LABELS.eventsCount,
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{row.original.eventsCount}</span>
      </div>
    ),
  },
  {
    accessorKey: "eventPastCount",
    header: COLUMN_LABELS.eventPastCount,
    cell: ({ row }) => (
      <span className="text-sm font-medium">{row.original.eventPastCount}</span>
    ),
  },
  {
    accessorKey: "phone",
    header: COLUMN_LABELS.phone,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.phone || "Non renseigné"}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="w-full text-right"></div>,
    cell: ({ row }) => {
      const user = row.original;
      const isBanned = (user.role ?? "").toLowerCase() === "banned";
      const isAdmin = (user.role ?? "").toLowerCase() === "admin";
      if (isAdmin) {
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
                onBanToggle(user);
              }}
              className={
                isBanned ? "" : "text-destructive focus:text-destructive"
              }
            >
              {isBanned ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Débannir
                </>
              ) : (
                <>
                  <Ban className="h-4 w-4 mr-2" />
                  Bannir
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UsersTable({
  data,
  search,
  onSearchChange,
  onDelete,
  deleteLoading,
  onBanToggle,
}: {
  data: User[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
  deleteLoading: boolean;
  onBanToggle: (user: User) => void;
}) {
  // Utiliser useMemo pour mémoriser les colonnes
  const columns = React.useMemo(
    () => createColumns(onDelete, onBanToggle),
    [onDelete, onBanToggle]
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  // Filtrage des utilisateurs selon la recherche
  const filteredData = React.useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (user) =>
        user.firstName.toLowerCase().includes(s) ||
        user.lastName.toLowerCase().includes(s) ||
        user.pseudo.toLowerCase().includes(s) ||
        user.email.toLowerCase().includes(s) ||
        user.role.toLowerCase().includes(s) ||
        (user.phone && user.phone.toLowerCase().includes(s))
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
    manualPagination: true,
  });

  return (
    <Tabs defaultValue="users" className="w-full flex-col justify-start gap-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Rechercher un utilisateur..."
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
        value="users"
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
                            Aucun utilisateur ne correspond à votre recherche.
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
                          <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                          <div className="mb-1 text-base font-medium text-muted-foreground">
                            Aucun utilisateur
                          </div>
                          <div className="mb-4 text-sm text-muted-foreground">
                            Aucun utilisateur n'a été trouvé.
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
