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
import { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search, Users, User as UserIcon, Mail, Calendar } from "lucide-react";
import { Check, Ban } from "lucide-react";
import { DragHandle } from "../ui/drag-handle";
import { CustomAlertDialog } from "@/components/dialogs/custom-alert-dialog";
import { useState, useMemo } from "react";

const COLUMN_LABELS: Record<string, string> = {
  name: "Nom",
  pseudo: "Pseudo",
  email: "Email",
  role: "Rôle",
  eventsCount: "Événements",
  eventPastCount: "Événements passés",
  phone: "Téléphone",
};

export function UsersTable({
  data,
  search,
  onSearchChange,
  onDelete,
  deleteLoading,
  onBanToggle,
  banLoading,
}: {
  data: User[];
  search: string;
  onSearchChange: (v: string) => void;
  onDelete: (deleteUrl: string, name: string) => void;
  deleteLoading: boolean;
  onBanToggle: (user: User) => void;
  banLoading?: boolean;
}) {
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTargetUser, setBanTargetUser] = useState<User | null>(null);

  const columns: ColumnDef<User>[] = useMemo(
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
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={row.original.imageUrl || undefined}
                alt={`${row.original.firstName} ${row.original.lastName}`}
              />
              <AvatarFallback>
                {`${row.original.firstName.charAt(
                  0
                )}${row.original.lastName.charAt(0)}`}
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
          // Vérification si role est défini
          if (!row.original.role) {
            return <Badge variant="outline">Non défini</Badge>;
          }

          switch (row.original.role.toUpperCase()) {
            case "ADMIN":
              return <Badge variant="destructive">Admin</Badge>;
            case "ORGANIZER":
              return <Badge variant="default">Organisateur</Badge>;
            case "USER":
              return <Badge variant="secondary">Utilisateur</Badge>;
            case "AUTHSERVICE":
              return <Badge variant="outline">Auth Service</Badge>;
            case "BANNED":
              return <Badge variant="outline">Banni</Badge>;
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
            <span className="text-sm font-medium">
              {row.original.eventsCount}
            </span>
          </div>
        ),
      },
      {
        accessorKey: "eventPastCount",
        header: COLUMN_LABELS.eventPastCount,
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.eventPastCount}
          </span>
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
                    setBanTargetUser(user);
                    setBanDialogOpen(true);
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
    ],
    []
  );

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const filteredData = useMemo(() => {
    const s = (search ?? "").toLowerCase();
    if (!s) return data;
    return data.filter(
      (user) =>
        user.firstName.toLowerCase().includes(s) ||
        user.lastName.toLowerCase().includes(s) ||
        user.pseudo.toLowerCase().includes(s) ||
        user.email.toLowerCase().includes(s) ||
        (user.role ? user.role.toLowerCase().includes(s) : false) ||
        (user.phone && user.phone.toLowerCase().includes(s))
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
    <Tabs defaultValue="users" className="w-full flex-col justify-start gap-6">
      <div className="flex gap-2 items-center justify-between px-4 lg:px-6">
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

      <CustomAlertDialog
        isOpen={banDialogOpen}
        onClose={() => setBanDialogOpen(false)}
        title={
          banTargetUser && (banTargetUser.role ?? "").toLowerCase() === "banned"
            ? "Débannir l'utilisateur"
            : "Bannir l'utilisateur"
        }
        description={
          banTargetUser && (banTargetUser.role ?? "").toLowerCase() === "banned"
            ? `Voulez-vous vraiment débannir l'utilisateur "${banTargetUser.firstName} ${banTargetUser.lastName}" ? Il pourra à nouveau accéder à la plateforme.`
            : `Voulez-vous vraiment bannir l'utilisateur "${banTargetUser?.firstName} ${banTargetUser?.lastName}" ? Il ne pourra plus se connecter.`
        }
        action={
          banTargetUser && (banTargetUser.role ?? "").toLowerCase() === "banned"
            ? "Débannir"
            : "Bannir"
        }
        onClick={() => {
          if (banTargetUser) {
            onBanToggle(banTargetUser);
          }
        }}
      />
    </Tabs>
  );
}
