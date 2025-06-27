"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { fetchUserInvitations } from "@/lib/fetch-invitations";
import { SiteHeader } from "@/components/site-header";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Link as LinkIcon } from "lucide-react";
import Link from "next/link";

export default function InvitationsPage() {
  const { getToken } = useAuth();
  const token = getToken() || undefined;

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-invitations"],
    queryFn: () => fetchUserInvitations(token),
    enabled: !!token,
  });

  const invitations = data?._embedded?.invitations || [];

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

            {/* Table Section */}
            <div className="px-4 lg:px-6">
              <Card>
                <CardHeader>
                  <CardTitle>Liste des invitations</CardTitle>
                  <CardDescription>
                    {isLoading
                      ? "Chargement des invitations..."
                      : invitations.length > 0
                      ? `Vous avez ${invitations.length} invitation(s)`
                      : "Aucune invitation reçue pour le moment"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center items-center h-32">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Chargement des invitations...
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Erreur lors du chargement des invitations.
                      </AlertDescription>
                    </Alert>
                  ) : invitations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32">
                      <p className="text-muted-foreground">
                        Aucune invitation reçue pour le moment.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Événement</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invitations.map((inv, i) => (
                            <TableRow key={i}>
                              <TableCell>{inv.description}</TableCell>
                              <TableCell>{inv.status}</TableCell>
                              <TableCell>
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
                                  <span className="text-muted-foreground">
                                    -
                                  </span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
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
