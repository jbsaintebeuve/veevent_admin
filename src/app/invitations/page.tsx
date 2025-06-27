"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserInvitations } from "@/lib/fetch-invitations";
import { SiteHeader } from "@/components/site-header";
import { SectionCards, type CardData } from "@/components/section-cards";
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
import {
  Search,
  AlertCircle,
  Link as LinkIcon,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

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

  // Filtrage optimisé avec useMemo
  const filteredInvitations = useMemo(() => {
    if (!Array.isArray(invitations)) return [];

    if (!search.trim()) return invitations;

    const searchLower = search.toLowerCase();
    return invitations.filter(
      (invitation) =>
        invitation.description.toLowerCase().includes(searchLower) ||
        invitation.status.toLowerCase().includes(searchLower)
    );
  }, [invitations, search]);

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            En attente
          </Badge>
        );
      case "ACCEPTED":
        return (
          <Badge variant="default" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Acceptée
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Refusée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    []
  );

  const handleClearSearch = useCallback(() => {
    setSearch("");
  }, []);

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
              : "Aucun refus",
        },
        footer: {
          primary: declinedCount === 1 ? "invitation" : "invitations",
          secondary: "refusées",
        },
      },
    ],
    [totalInvitations, pendingCount, acceptedCount, declinedCount]
  );

  // Vérifier si le lien HAL est disponible (cas spécifique aux liens HAL)
  if (!userInvitationsUrl) {
    return null;
  }

  // Loading state avec skeleton complet
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
            {/* Header Section */}
            <div className="flex items-center justify-between px-4 lg:px-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Invitations
                </h1>
                <p className="text-muted-foreground">
                  Retrouvez ici toutes vos invitations reçues pour des
                  événements.
                </p>
              </div>
            </div>

            {/* SectionCards pour les statistiques */}
            <SectionCards cards={cardsData} gridCols={4} className="mb-2" />

            {/* Search Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Rechercher des invitations</CardTitle>
                  <CardDescription>
                    Filtrez par description ou statut
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Rechercher..."
                      value={search}
                      onChange={handleSearchChange}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Table Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des invitations</CardTitle>
                  <CardDescription>
                    {search ? (
                      <>
                        {filteredInvitations.length} résultat(s) trouvé(s) pour
                        "{search}"
                      </>
                    ) : (
                      <>Toutes vos invitations reçues avec leurs statuts</>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredInvitations && filteredInvitations.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-center">Statut</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvitations.map((inv, i) => (
                          <TableRow key={i}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                                  <Mail className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {inv.description}
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">
                              {getStatusBadge(inv.status)}
                            </TableCell>
                            <TableCell className="text-right">
                              {inv._links?.event?.href ? (
                                <Link
                                  href={inv._links.event.href}
                                  target="_blank"
                                  className="inline-flex items-center gap-1 text-primary underline"
                                >
                                  <LinkIcon className="h-4 w-4" /> Voir
                                  l'événement
                                </Link>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32">
                      <p className="text-muted-foreground">
                        {search
                          ? "Aucune invitation trouvée pour cette recherche."
                          : "Aucune invitation reçue pour le moment."}
                      </p>
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
