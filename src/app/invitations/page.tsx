"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserInvitations } from "@/lib/fetch-invitations";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { InvitationsTable } from "@/components/tables/invitations-table";
import { Button } from "@/components/ui/button";
import { Invitation } from "@/types/invitation";

export default function InvitationsPage() {
  const [search, setSearch] = useState("");
  const { user, getToken } = useAuth();
  const token = getToken() || undefined;

  // Vérifier si l'utilisateur est connecté et a le lien HAL
  const userInvitationsUrl = user?._links?.invitations?.href;

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-invitations", user?.id],
    queryFn: () => fetchUserInvitations(token),
    enabled: !!token && !!user?.id && !!userInvitationsUrl,
    staleTime: 30000, // 30 secondes
    refetchOnWindowFocus: false,
  });

  const invitations = data?._embedded?.invitations || [];

  // Statistiques optimisées avec useMemo
  const { totalInvitations, pendingCount, acceptedCount, declinedCount } =
    useMemo(() => {
      const stats = {
        totalInvitations: invitations.length,
        pendingCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
      };

      invitations.forEach((invitation) => {
        switch (invitation.status) {
          case "PENDING":
            stats.pendingCount++;
            break;
          case "ACCEPTED":
            stats.acceptedCount++;
            break;
          case "DECLINED":
            stats.declinedCount++;
            break;
        }
      });

      return stats;
    }, [invitations]);

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
        id: "declined",
        title: "Refusées",
        description: "Invitations refusées",
        value: declinedCount,
        trend: {
          value: declinedCount > 2 ? 4.2 : declinedCount > 0 ? 1.1 : 0,
          isPositive: declinedCount > 0,
          label:
            declinedCount > 2
              ? "Sélectif"
              : declinedCount > 0
              ? "Quelques refus"
              : "Aucune refusée",
        },
        footer: {
          primary: declinedCount === 1 ? "invitation" : "invitations",
          secondary: "refusées",
        },
      },
    ],
    [totalInvitations, pendingCount, acceptedCount, declinedCount]
  );

  const handleAccept = (invitation: Invitation) => {
    // TODO: Implémenter l'acceptation d'invitation
    console.log("Accepter invitation:", invitation);
  };

  const handleDecline = (invitation: Invitation) => {
    // TODO: Implémenter le refus d'invitation
    console.log("Refuser invitation:", invitation);
  };

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
              <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="@container/card">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-16 mb-4" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                ))}
              </div>
              <div className="px-4 lg:px-6">
                <Skeleton className="h-96 w-full" />
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
            <AlertDescription className="flex items-center justify-between">
              <span>
                Erreur lors du chargement de vos invitations.
                {!userInvitationsUrl &&
                  " Impossible de récupérer le lien vers vos invitations."}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="ml-4"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
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
                  Invitations
                </h1>
                <p className="text-muted-foreground">
                  Gérez toutes vos invitations reçues
                </p>
              </div>
            </div>

            {/* ✅ SectionCards */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* ✅ Nouveau tableau */}
            <InvitationsTable
              data={invitations || []}
              search={search}
              onSearchChange={setSearch}
              onAccept={handleAccept}
              onDecline={handleDecline}
              actionLoading={false}
            />
          </div>
        </div>
      </div>
    </>
  );
}
