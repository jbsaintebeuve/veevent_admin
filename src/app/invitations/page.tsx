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
  const { user, token } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-invitations", user?.id, currentPage],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchUserInvitations(token, currentPage - 1, pageSize);
    },
  });

  const invitations = data?._embedded?.invitations || [];
  const pageInfo = data?.page;

  const participantQueries = useQueries({
    queries: invitations.map((invitation, index) => ({
      queryKey: [
        "invitation-participant",
        invitation._links?.self?.href || index,
      ],
      queryFn: async () => {
        if (!token) throw new Error("Token manquant");
        const selfHref = invitation._links?.self?.href;
        if (!selfHref || invitation.participant) return null;
        try {
          return await fetchInvitationParticipant(selfHref, token);
        } catch {
          return null;
        }
      },
    })),
  });

  const participantsLoading = participantQueries.some(
    (query) => query.isLoading
  );

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
  }, [invitations, participantQueries.map((q) => q.data)]);

  const acceptMutation = useMutation({
    mutationFn: (invitation: Invitation) => {
      if (!token) throw new Error("Token manquant");
      return acceptInvitation(invitation, token);
    },
    onSuccess: () => {
      toast.success("Invitation acceptée avec succès!");
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
    },
    onError: (error: Error) => {
      toast.error("Erreur lors de l'acceptation");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (invitation: Invitation) => {
      if (!token) throw new Error("Token manquant");
      return declineInvitation(invitation, token);
    },
    onSuccess: () => {
      toast.success("Invitation refusée avec succès!");
      queryClient.invalidateQueries({ queryKey: ["user-invitations"] });
    },
    onError: (error: Error) => {
      toast.error("Erreur lors du refus");
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
      if (!token) {
        toast.error("Vous devez être connecté.");
        return;
      }
      acceptMutation.mutate(invitation);
    },
    [acceptMutation, token]
  );

  const handleDecline = useCallback(
    (invitation: Invitation) => {
      if (!token) {
        toast.error("Vous devez être connecté.");
        return;
      }
      declineMutation.mutate(invitation);
    },
    [declineMutation, token]
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  if (isLoading || participantsLoading) {
    return <PageSkeleton />;
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
