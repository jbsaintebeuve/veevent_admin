"use client";

import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  fetchUserInvitations,
  acceptInvitation,
  declineInvitation,
  fetchInvitationParticipant,
} from "@/services/invitation-service";
import { SiteHeader } from "@/components/site-header";
import { SectionCards } from "@/components/section-cards";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { InvitationsTable } from "@/components/tables/invitations-table";
import { Invitation } from "@/types/invitation";
import { PageSkeleton } from "@/components/page-skeleton";
import { PaginationWrapper } from "@/components/ui/pagination-wrapper";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useInvitationsCards } from "@/hooks/data-cards/use-invitations-cards";

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
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const invitations = data?._embedded?.invitations || [];
  const pageInfo = data?.page;

  // Enrichir les invitations avec les participants
  const participantQueries = useQueries({
    queries: invitations.map((invitation, index) => ({
      queryKey: ["invitation-participant", invitation._links?.self?.href || index],
      queryFn: async () => {
        const selfHref = invitation._links?.self?.href;
        if (!selfHref || invitation.participant) return null;
        
        try {
          return await fetchInvitationParticipant(selfHref, token);
        } catch {
          return null;
        }
      },
      enabled: !!invitation._links?.self?.href && !invitation.participant,
    }))
  });

  const participantsLoading = participantQueries.some(query => query.isLoading);

  const enrichedInvitations = useMemo(() => {
    if (participantQueries.length !== invitations.length) {
      return invitations;
    }
    
    return invitations.map((invitation, index) => {
      const query = participantQueries[index];
      const participant = query?.data;
      
      if (participant) {
        return { ...invitation, participant };
      }
      return invitation;
    });
  }, [invitations, participantQueries.map(q => q.data)]);

  const acceptMutation = useMutation({
    mutationFn: (invitation: Invitation) => acceptInvitation(invitation, token),
    onSuccess: () => {
      toast.success("Invitation acceptée avec succès!");
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors de l'acceptation: ${error.message}`);
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitation: Invitation) =>
      declineInvitation(invitation, token),
    onSuccess: () => {
      toast.success("Invitation refusée avec succès!");
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
    },
    onError: (error: Error) => {
      toast.error(`Erreur lors du refus: ${error.message}`);
    },
  });

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

  const cardsData = useInvitationsCards({
    invitations,
    totalInvitations,
    pendingCount,
    acceptedCount,
    rejectedCount,
  });

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

  if (isLoading || participantsLoading) {
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

            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

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
