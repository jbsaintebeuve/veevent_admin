"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Users,
  User as UserIcon,
  Mail,
  Search,
  Trash2,
  Edit,
  AlertCircle,
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { fetchUsers } from "@/lib/fetch-users";
import { User } from "@/types/user";
import { useAuth } from "@/hooks/use-auth";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { getToken } = useAuth();

  const fetchUsersWithToken = () => fetchUsers(getToken() || undefined);

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<User[]>({
    queryKey: ["users"],
    queryFn: fetchUsersWithToken,
  });

  // ✅ Filtrage des utilisateurs avec recherche - optimisé avec useMemo
  const filteredUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];

    if (!search.trim()) return users;

    const searchLower = search.toLowerCase();
    return users.filter(
      (user) =>
        user.lastName.toLowerCase().includes(searchLower) ||
        user.firstName.toLowerCase().includes(searchLower) ||
        user.pseudo.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.role.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  const getRoleBadge = useCallback((role: string) => {
    switch (role.toUpperCase()) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "ORGANIZER":
        return <Badge variant="default">Organisateur</Badge>;
      case "USER":
        return <Badge variant="secondary">Utilisateur</Badge>;
      case "AUTHSERVICE":
        return <Badge variant="outline">Auth Service</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  }, []);

  const getInitials = useCallback((firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }, []);

  // Statistiques optimisées avec useMemo - une seule boucle au lieu de 4
  const { adminCount, organizerCount, userCount, authServiceCount } =
    useMemo(() => {
      const stats = {
        adminCount: 0,
        organizerCount: 0,
        userCount: 0,
        authServiceCount: 0,
      };

      users?.forEach((user) => {
        switch (user.role.toUpperCase()) {
          case "ADMIN":
            stats.adminCount++;
            break;
          case "ORGANIZER":
            stats.organizerCount++;
            break;
          case "USER":
            stats.userCount++;
            break;
          case "AUTHSERVICE":
            stats.authServiceCount++;
            break;
        }
      });

      return stats;
    }, [users]);

  // ✅ Données pour SectionCards optimisées avec useMemo
  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "total",
        title: "Total utilisateurs",
        description: "Tous les utilisateurs",
        value: users?.length || 0,
        trend: {
          value:
            users && users.length > 100
              ? 24.5
              : users && users.length > 50
              ? 18.2
              : users && users.length > 20
              ? 12.1
              : users && users.length > 5
              ? 6.8
              : users && users.length > 0
              ? 2.1
              : 0,
          isPositive: !!(users && users.length > 0),
          label:
            users && users.length > 100
              ? "Très grande communauté"
              : users && users.length > 50
              ? "Grande communauté"
              : users && users.length > 20
              ? "Communauté active"
              : users && users.length > 5
              ? "Petite communauté"
              : users && users.length > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
        },
        footer: {
          primary:
            users && users.length > 100
              ? "Très grande communauté"
              : users && users.length > 50
              ? "Grande communauté"
              : users && users.length > 20
              ? "Communauté active"
              : users && users.length > 5
              ? "Petite communauté"
              : users && users.length > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
          secondary: users?.length === 1 ? "utilisateur" : "utilisateurs",
        },
      },
      {
        id: "admins",
        title: "Administrateurs",
        description: "Utilisateurs admin",
        value: adminCount,
        trend: {
          value:
            adminCount > 5
              ? 15.7
              : adminCount > 2
              ? 8.4
              : adminCount > 0
              ? 3.2
              : 0,
          isPositive: adminCount > 0,
          label:
            adminCount > 5
              ? "Équipe complète"
              : adminCount > 2
              ? "Plusieurs admins"
              : adminCount > 0
              ? "Un admin"
              : "Aucun admin",
        },
        footer: {
          primary:
            adminCount > 5
              ? "Équipe complète"
              : adminCount > 2
              ? "Plusieurs admins"
              : adminCount > 0
              ? "Un admin"
              : "Aucun admin",
          secondary: adminCount === 1 ? "administrateur" : "administrateurs",
        },
      },
      {
        id: "organizers",
        title: "Organisateurs",
        description: "Utilisateurs organisateurs",
        value: organizerCount,
        trend: {
          value:
            organizerCount > 20
              ? 22.3
              : organizerCount > 10
              ? 15.8
              : organizerCount > 5
              ? 9.2
              : organizerCount > 0
              ? 4.1
              : 0,
          isPositive: organizerCount > 0,
          label:
            organizerCount > 20
              ? "Très actif"
              : organizerCount > 10
              ? "Bonne activité"
              : organizerCount > 5
              ? "Activité modérée"
              : organizerCount > 0
              ? "Quelques organisateurs"
              : "Aucun organisateur",
        },
        footer: {
          primary:
            organizerCount > 20
              ? "Très actif"
              : organizerCount > 10
              ? "Bonne activité"
              : organizerCount > 5
              ? "Activité modérée"
              : organizerCount > 0
              ? "Quelques organisateurs"
              : "Aucun organisateur",
          secondary: organizerCount === 1 ? "organisateur" : "organisateurs",
        },
      },
      {
        id: "users",
        title: "Utilisateurs",
        description: "Utilisateurs standard",
        value: userCount,
        trend: {
          value:
            userCount > 100
              ? 28.9
              : userCount > 50
              ? 20.1
              : userCount > 20
              ? 12.7
              : userCount > 5
              ? 6.3
              : userCount > 0
              ? 2.8
              : 0,
          isPositive: userCount > 0,
          label:
            userCount > 100
              ? "Très populaire"
              : userCount > 50
              ? "Populaire"
              : userCount > 20
              ? "Bonne adoption"
              : userCount > 5
              ? "Adoption modérée"
              : userCount > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
        },
        footer: {
          primary:
            userCount > 100
              ? "Très populaire"
              : userCount > 50
              ? "Populaire"
              : userCount > 20
              ? "Bonne adoption"
              : userCount > 5
              ? "Adoption modérée"
              : userCount > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
          secondary: userCount === 1 ? "utilisateur" : "utilisateurs",
        },
      },
    ],
    [users, adminCount, organizerCount, userCount]
  );

  // Loading state
  if (isLoading) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                  <Skeleton className="h-8 w-32 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32" />
              </div>

              {/* Stats Cards Skeleton */}
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="@container/card">
                    <CardHeader>
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-16 mb-4" />
                      <Skeleton className="h-6 w-20" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-32 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="px-4 lg:px-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center space-x-4">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-4 flex-1" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Erreur lors du chargement des utilisateurs. Veuillez réessayer.
            </AlertDescription>
          </Alert>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* ✅ Header Section */}
            <div className="flex items-center justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Utilisateurs
                </h1>
                <p className="text-muted-foreground">
                  Gérez tous les utilisateurs de votre plateforme
                </p>
              </div>
            </div>

            {/* ✅ SectionCards au lieu des cards manuelles */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* ✅ Search Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des utilisateurs</CardTitle>
                  <CardDescription>
                    Filtrez par nom, prénom, pseudo, email ou rôle
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher par nom, prénom, pseudo, email ou rôle..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ Data Table */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des utilisateurs</CardTitle>
                  <CardDescription>
                    {search ? (
                      <>
                        {filteredUsers.length} résultat(s) trouvé(s) pour "
                        {search}"
                      </>
                    ) : (
                      <>Tous les utilisateurs de votre plateforme</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredUsers && filteredUsers.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Utilisateur</TableHead>
                          <TableHead>Pseudo</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead className="text-center">Rôle</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={user.imageUrl || undefined}
                                    alt={`${user.firstName} ${user.lastName}`}
                                  />
                                  <AvatarFallback>
                                    {getInitials(user.firstName, user.lastName)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {user.firstName} {user.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    ID: {user.id}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <UserIcon className="h-4 w-4 text-muted-foreground" />
                                <span className="font-mono text-sm">
                                  @{user.pseudo}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{user.email}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getRoleBadge(user.role)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/users/${user.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Modifier</span>
                                  </Link>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      {search ? (
                        <>
                          <Search className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun résultat trouvé
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Aucun utilisateur ne correspond à votre recherche "
                            {search}".
                          </p>
                          <Button
                            variant="outline"
                            onClick={() => setSearch("")}
                          >
                            Effacer la recherche
                          </Button>
                        </>
                      ) : (
                        <>
                          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                          <h3 className="mt-4 text-lg font-semibold">
                            Aucun utilisateur
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            Commencez par créer votre premier utilisateur.
                          </p>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
