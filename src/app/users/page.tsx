"use client";

import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { AlertCircle } from "lucide-react";
import { fetchUsers } from "@/services/user-service";
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
import { banOrUnbanUser } from "@/services/user-service";
import { useUsersCards } from "@/hooks/data-cards/use-users-cards";
import { toast } from "sonner";

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { token } = useAuth();

  const queryClient = useQueryClient();
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [banTargetUser, setBanTargetUser] = useState<User | null>(null);

  const {
    data: usersResponse,
    isLoading,
    error,
  } = useQuery<UsersApiResponse>({
    queryKey: ["users", currentPage],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchUsers(token, currentPage - 1, pageSize);
    },
  });

  const users = usersResponse?._embedded?.userResponses || [];

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

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
    console.log("Supprimer utilisateur:", name, deleteUrl);
  }, []);

  const { adminCount, organizerCount, userCount, authServiceCount } =
    useMemo(() => {
      const stats = {
        adminCount: 0,
        organizerCount: 0,
        userCount: 0,
        authServiceCount: 0,
      };

      users?.forEach((user) => {
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

  const cardsData = useUsersCards({
    totalUsers: usersResponse?.page?.totalElements || users?.length || 0,
    adminCount,
    organizerCount,
    userCount,
  });

  const banMutation = useMutation({
    mutationFn: async (user: User) => {
      if (!token) throw new Error("Token manquant");
      const isBanned = (user.role ?? "").toLowerCase() === "banned";
      return await banOrUnbanUser(
        user.id,
        isBanned ? "User" : "Banned",
        token
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setBanDialogOpen(false);
      setBanTargetUser(null);
      toast.success("Utilisateur mis à jour avec succès");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erreur lors de la mise à jour de l'utilisateur");
    },
  });

  const handleBanToggle = (user: User) => {
    setBanTargetUser(user);
    setBanDialogOpen(true);
  };

  const confirmBanToggle = () => {
    if (!banTargetUser) return;
    banMutation.mutate(banTargetUser);
  };

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

            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

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

            <UsersTable
              data={users || []}
              search={search}
              onSearchChange={setSearch}
              onDelete={handleDelete}
              deleteLoading={false}
              onBanToggle={handleBanToggle}
            />

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
              disabled={banMutation.isPending}
              onClick={() => setBanDialogOpen(false)}
            >
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmBanToggle} disabled={banMutation.isPending}>
              {banTargetUser &&
              (banTargetUser.role ?? "").toLowerCase() === "banned"
                ? "Débannir"
                : "Bannir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
