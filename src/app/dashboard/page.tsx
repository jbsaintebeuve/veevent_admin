"use client";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards, type CardData } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { fetchEvents, fetchUserEvents } from "@/services/event-service";
import { fetchUsers } from "@/services/user-service";
import { fetchReports } from "@/services/report-service";
import { PageSkeleton } from "@/components/page-skeleton";
import { fetchUserInvitations } from "@/services/invitation-service";

export default function Page() {
  const { token } = useAuth();
  const user = useAuth().user;
  const role = user?.role?.toUpperCase();

  const isAdminLike = role === "ADMIN" || role === "AUTHSERVICE";

  const {
    data: eventsResponse,
    isLoading: isLoadingEvents,
    error: errorEvents,
  } = useQuery({
    queryKey: ["dashboard-events"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchEvents(token);
    },
    enabled: isAdminLike,
  });

  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    error: errorUsers,
  } = useQuery({
    queryKey: ["dashboard-users"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchUsers(token);
    },
    enabled: isAdminLike,
  });

  const {
    data: reportsResponse,
    isLoading: isLoadingReports,
    error: errorReports,
  } = useQuery({
    queryKey: ["dashboard-reports"],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchReports(token, 0, 1000);
    },
    enabled: isAdminLike,
  });

  const userEventsUrl = user?._links?.events?.href;
  const userInvitationsUrl = user?._links?.invitations?.href;

  const {
    data: myEventsResponse,
    isLoading: isLoadingMyEvents,
    error: errorMyEvents,
  } = useQuery({
    queryKey: ["dashboard-my-events", user?.id],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchUserEvents(userEventsUrl, token);
    },
    enabled: !!user?.id && !!userEventsUrl && role === "ORGANIZER",
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const {
    data: myInvitationsResponse,
    isLoading: isLoadingMyInvitations,
    error: errorMyInvitations,
  } = useQuery({
    queryKey: ["dashboard-my-invitations", user?.id],
    queryFn: () => {
      if (!token) throw new Error("Token manquant");
      return fetchUserInvitations(token);
    },
    enabled:
      !!token && !!user?.id && !!userInvitationsUrl && role === "ORGANIZER",
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });

  const isLoadingAdmin =
    isAdminLike && (isLoadingEvents || isLoadingUsers || isLoadingReports);
  const isErrorAdmin =
    isAdminLike && (errorEvents || errorUsers || errorReports);
  const isLoadingOrganizer =
    role === "ORGANIZER" && (isLoadingMyEvents || isLoadingMyInvitations);
  const isErrorOrganizer =
    role === "ORGANIZER" && (errorMyEvents || errorMyInvitations);

  if (
    isLoadingAdmin ||
    isErrorAdmin ||
    isLoadingOrganizer ||
    isErrorOrganizer
  ) {
    return <PageSkeleton />;
  }

  const events = eventsResponse?._embedded?.eventSummaryResponses || [];
  const totalEvents = events.length;
  const totalParticipants = events.reduce(
    (sum, e) => sum + (e.currentParticipants || 0),
    0
  );
  const averageParticipants =
    totalEvents > 0 ? Math.round(totalParticipants / totalEvents) : 0;

  const totalUsers =
    usersResponse?.page?.totalElements ||
    usersResponse?._embedded?.userResponses?.length ||
    0;
  const totalReports =
    reportsResponse?.page?.totalElements ||
    reportsResponse?._embedded?.reports?.length ||
    0;

  if (isAdminLike) {
    const dashboardCardsData: CardData[] = [
      {
        id: "total-events",
        title: "Événements",
        description: "Événements totaux",
        value: totalEvents,
        trend: {
          value: totalEvents,
          isPositive: totalEvents > 0,
          label: totalEvents > 0 ? "Plateforme active" : "Aucun événement",
        },
        footer: {
          primary: totalEvents === 1 ? "événement" : "événements",
          secondary: "programmés",
        },
      },
      {
        id: "average-participants",
        title: "Participants moyens",
        description: "Moyenne de participants par événement",
        value: averageParticipants,
        trend: {
          value: averageParticipants,
          isPositive: averageParticipants > 0,
          label:
            averageParticipants > 100
              ? "Très populaire"
              : averageParticipants > 50
              ? "Bonne affluence"
              : averageParticipants > 10
              ? "Participation correcte"
              : averageParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
        },
        footer: {
          primary: averageParticipants === 1 ? "participant" : "participants",
          secondary: "par événement",
        },
      },
      {
        id: "total-users",
        title: "Utilisateurs",
        description: "Utilisateurs inscrits",
        value: totalUsers,
        trend: {
          value: totalUsers,
          isPositive: totalUsers > 0,
          label:
            totalUsers > 100
              ? "Grande communauté"
              : totalUsers > 20
              ? "Communauté active"
              : totalUsers > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
        },
        footer: {
          primary: totalUsers === 1 ? "utilisateur" : "utilisateurs",
          secondary: "inscrits",
        },
      },
      {
        id: "total-reports",
        title: "Signalements",
        description: "Signalements reçus",
        value: totalReports,
        trend: {
          value: totalReports,
          isPositive: totalReports === 0,
          label:
            totalReports === 0
              ? "Plateforme saine"
              : totalReports < 5
              ? "Peu de signalements"
              : totalReports < 20
              ? "À surveiller"
              : "Modération nécessaire",
        },
        footer: {
          primary: totalReports === 1 ? "signalement" : "signalements",
          secondary: "reçus",
        },
      },
    ];

    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                cards={dashboardCardsData}
                gridCols={4}
                className="mb-2"
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (role === "ORGANIZER") {
    const events = myEventsResponse?._embedded?.eventSummaryResponses || [];
    const totalEvents = events.length;
    const totalParticipants = events.reduce(
      (sum, e) => sum + (e.currentParticipants || 0),
      0
    );
    const averageParticipants =
      totalEvents > 0 ? Math.round(totalParticipants / totalEvents) : 0;
    let upcomingCount = 0;
    events.forEach((event) => {
      if (event.status === "NOT_STARTED") upcomingCount++;
    });
    const invitations = myInvitationsResponse?._embedded?.invitations || [];
    const pendingInvitations = invitations.filter(
      (inv) => inv.status === "SENT"
    ).length;
    const dashboardCardsData: CardData[] = [
      {
        id: "total-my-events",
        title: "Mes événements",
        description: "Total organisés",
        value: totalEvents,
        trend: {
          value: totalEvents,
          isPositive: totalEvents > 0,
          label:
            totalEvents > 10
              ? "Organisateur actif"
              : totalEvents > 0
              ? "Quelques événements"
              : "Aucun événement",
        },
        footer: {
          primary: totalEvents === 1 ? "événement" : "événements",
          secondary: "organisés par vous",
        },
      },
      {
        id: "upcoming-my-events",
        title: "À venir",
        description: "Événements à venir",
        value: upcomingCount,
        trend: {
          value: upcomingCount,
          isPositive: upcomingCount > 0,
          label:
            upcomingCount > 5
              ? "Beaucoup à venir"
              : upcomingCount > 0
              ? "Préparez-vous"
              : "Aucun à venir",
        },
        footer: {
          primary: upcomingCount === 1 ? "événement" : "événements",
          secondary: "à venir",
        },
      },
      {
        id: "average-participants-my-events",
        title: "Participants moyens",
        description: "Par événement organisé",
        value: averageParticipants,
        trend: {
          value: averageParticipants,
          isPositive: averageParticipants > 0,
          label:
            averageParticipants > 100
              ? "Très populaire"
              : averageParticipants > 50
              ? "Bonne affluence"
              : averageParticipants > 10
              ? "Participation correcte"
              : averageParticipants > 0
              ? "Quelques participants"
              : "Aucun participant",
        },
        footer: {
          primary: averageParticipants === 1 ? "participant" : "participants",
          secondary: "par événement",
        },
      },
      {
        id: "pending-invitations",
        title: "Invitations en attente",
        description: "Invitations à traiter",
        value: pendingInvitations,
        trend: {
          value: pendingInvitations,
          isPositive: pendingInvitations > 0,
          label:
            pendingInvitations > 5
              ? "Très sollicité"
              : pendingInvitations > 0
              ? "À traiter"
              : "Aucune en attente",
        },
        footer: {
          primary: pendingInvitations === 1 ? "invitation" : "invitations",
          secondary: "en attente",
        },
      },
    ];
    return (
      <>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards
                cards={dashboardCardsData}
                gridCols={4}
                className="mb-2"
              />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
