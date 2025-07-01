import { Report, ReportsApiResponse } from "@/types/report";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
