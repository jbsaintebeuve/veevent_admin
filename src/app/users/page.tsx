"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { AlertCircle } from "lucide-react";
import { fetchUsers } from "@/lib/fetch-users";
import { User } from "@/types/user";
import { useAuth } from "@/hooks/use-auth";
import { UsersTable } from "@/components/tables/users-table";

export default function UsersPage() {
  const [search, setSearch] = useState("");
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

  const handleDelete = useCallback((deleteUrl: string, name: string) => {
    // TODO: Implémenter la suppression d'utilisateur
    console.log("Supprimer utilisateur:", name, deleteUrl);
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

            {/* ✅ Team Overview avec groupe d'avatars */}
            <div className="px-4 lg:px-6">
              <Card className="shadow-xs">
                <CardHeader>
                  <h3 className="text-lg font-semibold">
                    Profils utilisateurs
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Découvrez les membres de votre plateforme d'événements
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {/* Groupe d'avatars qui se chevauchent */}
                    <AvatarGroup
                      users={filteredUsers}
                      maxDisplay={5}
                      size="lg"
                      showOverflow={true}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Membres de la plateforme
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {filteredUsers.length} profil(s) utilisateur(s)
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ✅ Nouveau tableau */}
            <UsersTable
              data={users || []}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
