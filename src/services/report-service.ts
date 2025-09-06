import { Report, ReportsApiResponse } from "@/types/report";
import { fetchUserById } from "./user-service";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// =============================================================================
// FONCTIONS UTILITAIRES
// =============================================================================

/**
 * Extrait l'ID utilisateur depuis une URL HATEOAS
 */
function extractUserIdFromHref(href: string): number | null {
  const match = href.match(/\/users\/(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// =============================================================================
// RÉCUPÉRATION DES SIGNALEMENTS
// =============================================================================

/**
 * Récupère tous les signalements avec pagination
 */
export async function fetchReports(
  token?: string,
  page = 0,
  size = 10
): Promise<ReportsApiResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
  });

  const res = await fetch(`${API_URL}/reports?${params}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!res.ok) throw new Error("Erreur lors du chargement des signalements");
  return await res.json();
}

/**
 * Récupère tous les signalements avec les détails des utilisateurs signalés
 */
export async function fetchReportsWithUserDetails(
  token?: string,
  page = 0,
  size = 10
): Promise<ReportsApiResponse> {
  const reportsResponse = await fetchReports(token, page, size);

  if (
    !reportsResponse._embedded?.reports ||
    reportsResponse._embedded.reports.length === 0
  ) {
    return reportsResponse;
  }

  const enrichedReports = await Promise.all(
    reportsResponse._embedded.reports.map(async (report) => {
      const enrichedReport = { ...report };

      if (report._links?.reportedUser?.href) {
        try {
          const reportedUserId = extractUserIdFromHref(
            report._links.reportedUser.href
          );

          if (reportedUserId && token) {
            const reportedUserDetails = await fetchUserById(
              reportedUserId,
              token
            );
            enrichedReport.reportedUserDetails = {
              firstName: reportedUserDetails.firstName,
              lastName: reportedUserDetails.lastName,
              pseudo: reportedUserDetails.pseudo,
              imageUrl: reportedUserDetails.imageUrl || undefined,
            };
          }
        } catch (error) {
          console.warn(
            `Impossible de récupérer les détails de l'utilisateur signalé:`,
            error
          );
        }
      }

      return enrichedReport;
    })
  );

  return {
    ...reportsResponse,
    _embedded: {
      ...reportsResponse._embedded,
      reports: enrichedReports,
    },
  };
}
