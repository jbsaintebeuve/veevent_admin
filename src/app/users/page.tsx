"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { AlertCircle } from "lucide-react";
import { fetchUsers } from "@/lib/fetch-users";
import { User, UsersApiResponse } from "@/types/user";
import { useAuth } from "@/hooks/use-auth";
import { UsersTable } from "@/components/tables/users-table";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
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
import { banOrUnbanUser } from "@/lib/fetch-users";
import { useUsersCards } from "@/hooks/data-cards/use-users-cards";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { getToken } = useAuth();

  // Mémoriser le token pour éviter les recalculs
  const token = useMemo(() => getToken() || undefined, [getToken]);

  const queryClient = useQueryClient();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTargetUser, setBanTargetUser] = useState<User | null>(null);
  const [banLoading, setBanLoading] = useState(false);
  const [banError, setBanError] = useState<string | null>(null);

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery<UsersApiResponse>({
    queryKey: ["users", currentPage],
    queryFn: () => fetchUsers(token, currentPage - 1, pageSize),
  });

  const users = usersResponse?._embedded?.userResponses || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
        (user.role ? user.role.toLowerCase().includes(searchLower) : false)
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
        // Vérification si le rôle existe
        if (!user.role) return;

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
  const cardsData = useUsersCards({
    totalUsers: usersResponse?.page?.totalElements || users?.length || 0,
    adminCount,
    organizerCount,
    userCount,
  });

  const handleBanToggle = (user: User) => {
    setBanTargetUser(user);
    setBanDialogOpen(true);
    setBanError(null);
  };

  const confirmBanToggle = async () => {
    if (!banTargetUser) return;
    setBanLoading(true);
    setBanError(null);
    try {
      const isBanned = (banTargetUser.role ?? "").toLowerCase() === "banned";
      await banOrUnbanUser(
        banTargetUser.id,
        isBanned ? "User" : "Banned",
        token
      );
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      setBanDialogOpen(false);
      setBanTargetUser(null);
    } catch (e: any) {
      setBanError(e.message || "Erreur inconnue");
    } finally {
      setBanLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={4}
        tableRowsCount={5}
        tableColumnsCount={6}
        showSearchBar={true}
        showTableActions={true}
        showAvatars={true}
        showActionButton={false}
      />
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
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
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
              onBanToggle={handleBanToggle}
            />

            {/* Pagination */}
            {usersResponse?.page && usersResponse.page.totalPages > 1 && (
              <div className="flex justify-center px-4 lg:px-6">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={usersResponse.page.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Dialog Bannir/Débannir */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {banTargetUser &&
              (banTargetUser.role ?? "").toLowerCase() === "banned"
                ? "Débannir l'utilisateur"
                : "Bannir l'utilisateur"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTargetUser &&
              (banTargetUser.role ?? "").toLowerCase() === "banned"
                ? `Voulez-vous vraiment débannir l'utilisateur "${banTargetUser.firstName} ${banTargetUser.lastName}" ? Il pourra à nouveau accéder à la plateforme.`
                : `Voulez-vous vraiment bannir l'utilisateur "${banTargetUser?.firstName} ${banTargetUser?.lastName}" ? Il ne pourra plus se connecter.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={banLoading}
              onClick={() => setBanDialogOpen(false)}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmBanToggle}
              className={
                banTargetUser &&
                (banTargetUser.role ?? "").toLowerCase() === "banned"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-destructive text-destructive-foreground hover:bg-destructive/90"
              }
              disabled={banLoading}
            >
              {banTargetUser &&
              (banTargetUser.role ?? "").toLowerCase() === "banned"
                ? "Débannir"
                : "Bannir"}
            </AlertDialogAction>
          </AlertDialogFooter>
          {banError && (
            <div className="text-xs text-red-600 mt-2">{banError}</div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
