"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchUserInvitations,
  acceptInvitation,
  declineInvitation,
  fetchInvitationParticipant,
} from "@/lib/fetch-invitations";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { InvitationsTable } from "@/components/tables/invitations-table";
import { Invitation } from "@/types/invitation";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User } from "@/types/user";
import { useEnrichedInvitations } from "@/hooks/use-enriched-invitations";

export default function InvitationsPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const { user, getToken } = useAuth();
  const token = useMemo(() => getToken() || undefined, [getToken]);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-invitations", user?.id, currentPage],
    queryFn: () => fetchUserInvitations(token, currentPage - 1, pageSize),
    enabled: !!token && !!user?.id,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });

  // Mutation pour accepter une invitation
  const acceptMutation = useMutation({
    mutationFn: (invitation: Invitation) => acceptInvitation(invitation, token),
    onSuccess: () => {
      toast.success("Invitation acceptée avec succès!");
      queryClient.invalidateQueries({
        queryKey: ["user-invitations", user?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'acceptation: ${error.message}`);
    },
  });

  // Mutation pour refuser une invitation
  const declineMutation = useMutation({
    mutationFn: (invitation: Invitation) =>
      declineInvitation(invitation, token),
    onSuccess: () => {
      toast.success("Invitation refusée avec succès!");
      queryClient.invalidateQueries({
        queryKey: ["user-invitations", user?.id],
      });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors du refus: ${error.message}`);
    },
  });

  const invitations = data?._embedded?.invitations || [];
  const pageInfo = data?.page;

  // Remplacement : hook pour enrichir les invitations avec participant
  const { invitations: enrichedInvitations, loading: participantsLoading } =
    useEnrichedInvitations(invitations, token);

  // Statistiques optimisées avec useMemo
  const { totalInvitations, pendingCount, acceptedCount, rejectedCount } =
    useMemo(() => {
      const stats = {
        totalInvitations: pageInfo?.totalElements || invitations.length,
        pendingCount: 0,
        acceptedCount: 0,
        rejectedCount: 0,
      };

      invitations.forEach((invitation) => {
        switch (invitation.status) {
          case "SENT":
            stats.pendingCount++;
            break;
          case "ACCEPTED":
            stats.acceptedCount++;
            break;
          case "REJECTED":
            stats.rejectedCount++;
            break;
        }
      });

      return stats;
    }, [invitations, pageInfo?.totalElements]);

  const cardsData: CardData[] = useMemo(
    () => [
      {
        id: "total",
        title: "Total invitations",
        description: "Nombre total d'invitations reçues",
        value: totalInvitations,
        trend: {
          value: totalInvitations > 10 ? 12.5 : totalInvitations > 0 ? 3.2 : 0,
          isPositive: totalInvitations > 0,
          label:
            totalInvitations > 10
              ? "Très sollicité"
              : totalInvitations > 0
              ? "Quelques invitations"
              : "Aucune invitation",
        },
        footer: {
          primary: totalInvitations === 1 ? "invitation" : "invitations",
          secondary: "reçues au total",
        },
      },
      {
        id: "pending",
        title: "En attente",
        description: "Invitations en attente de réponse",
        value: pendingCount,
        trend: {
          value: pendingCount > 5 ? 8.7 : pendingCount > 0 ? 2.1 : 0,
          isPositive: pendingCount > 0,
          label:
            pendingCount > 5
              ? "Beaucoup en attente"
              : pendingCount > 0
              ? "À traiter"
              : "Aucune en attente",
        },
        footer: {
          primary: pendingCount === 1 ? "invitation" : "invitations",
          secondary: "en attente",
        },
      },
      {
        id: "accepted",
        title: "Acceptées",
        description: "Invitations acceptées",
        value: acceptedCount,
        trend: {
          value: acceptedCount > 2 ? 5.4 : acceptedCount > 0 ? 1.2 : 0,
          isPositive: acceptedCount > 0,
          label:
            acceptedCount > 2
              ? "Très actif"
              : acceptedCount > 0
              ? "Participant"
              : "Aucune acceptée",
        },
        footer: {
          primary: acceptedCount === 1 ? "invitation" : "invitations",
          secondary: "acceptées",
        },
      },
      {
        id: "rejected",
        title: "Refusées",
        description: "Invitations refusées",
        value: rejectedCount,
        trend: {
          value: rejectedCount > 2 ? 4.2 : rejectedCount > 0 ? 1.1 : 0,
          isPositive: rejectedCount > 0,
          label:
            rejectedCount > 2
              ? "Sélectif"
              : rejectedCount > 0
              ? "Quelques refus"
              : "Aucune refusée",
        },
        footer: {
          primary: rejectedCount === 1 ? "invitation" : "invitations",
          secondary: "refusées",
        },
      },
    ],
    [totalInvitations, pendingCount, acceptedCount, rejectedCount]
  );

  const handleAccept = useCallback(
    (invitation: Invitation) => {
      acceptMutation.mutate(invitation);
    },
    [acceptMutation]
  );

  const handleDecline = useCallback(
    (invitation: Invitation) => {
      declineMutation.mutate(invitation);
    },
    [declineMutation]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <PageSkeleton
        cardsCount={4}
        tableRowsCount={5}
        tableColumnsCount={6}
        showSearchBar={true}
        showTableActions={true}
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
              Erreur lors du chargement des invitations. Veuillez réessayer.
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
                  Invitations
                </h1>
                <p className="text-muted-foreground">
                  Gérez toutes vos invitations reçues
                </p>
              </div>
            </div>

            {/* ✅ SectionCards */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* ✅ Tableau des invitations */}
            <InvitationsTable
              data={enrichedInvitations}
              search={search}
              onSearchChange={setSearch}
              onAccept={handleAccept}
              onDecline={handleDecline}
              actionLoading={
                acceptMutation.isPending ||
                declineMutation.isPending ||
                participantsLoading
              }
            />

            {/* Pagination */}
            {pageInfo && pageInfo.totalPages > 1 && (
              <div className="flex justify-center px-4 lg:px-6">
                <PaginationWrapper
                  currentPage={currentPage}
                  totalPages={pageInfo.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
