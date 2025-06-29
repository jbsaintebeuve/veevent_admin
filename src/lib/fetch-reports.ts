import { Report } from "@/types/report";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function fetchReports(token?: string): Promise<Report[]> {
  const res = await fetch(`${API_URL}/reports`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  if (!res.ok) throw new Error("Erreur lors du chargement des signalements");
  const data = await res.json();
  if (data._embedded && Array.isArray(data._embedded.reports)) {
    return data._embedded.reports;
  }
  return [];
}
