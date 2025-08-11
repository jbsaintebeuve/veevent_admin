import { useMemo } from "react";
import { CardData } from "@/components/section-cards";

interface UseUsersCardsProps {
  totalUsers: number;
  adminCount: number;
  organizerCount: number;
  userCount: number;
}

export function useUsersCards({
  totalUsers,
  adminCount,
  organizerCount,
  userCount,
}: UseUsersCardsProps): CardData[] {
  return useMemo(
    () => [
      {
        id: "total",
        title: "Total utilisateurs",
        description: "Tous les utilisateurs",
        value: totalUsers,
        trend: {
          value:
            totalUsers > 100
              ? 24.5
              : totalUsers > 50
              ? 18.2
              : totalUsers > 20
              ? 12.1
              : totalUsers > 5
              ? 6.8
              : totalUsers > 0
              ? 2.1
              : 0,
          isPositive: totalUsers > 0,
          label:
            totalUsers > 100
              ? "Très grande communauté"
              : totalUsers > 50
              ? "Grande communauté"
              : totalUsers > 20
              ? "Communauté active"
              : totalUsers > 5
              ? "Petite communauté"
              : totalUsers > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
        },
        footer: {
          primary:
            totalUsers > 100
              ? "Très grande communauté"
              : totalUsers > 50
              ? "Grande communauté"
              : totalUsers > 20
              ? "Communauté active"
              : totalUsers > 5
              ? "Petite communauté"
              : totalUsers > 0
              ? "Premiers utilisateurs"
              : "Aucun utilisateur",
          secondary: totalUsers === 1 ? "utilisateur" : "utilisateurs",
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
    [totalUsers, adminCount, organizerCount, userCount]
  );
}
