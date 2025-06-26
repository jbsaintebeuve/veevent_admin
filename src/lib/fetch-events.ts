export interface Event {
  id: number;
  name: string;
  description: string;
  date: string;
  address: string;
  maxCustomers: number;
  currentParticipants: number;
  price: number;
  status: "NOT_STARTED" | "ONGOING" | "COMPLETED" | "CANCELLED";
  isTrending: boolean;
  isFirstEdition: boolean;
  imageUrl: string;
  cityName: string;
  placeName: string;
  categories: Array<{ name: string; key: string }>;
  organizer: {
    pseudo: string;
    lastName: string;
    firstName: string;
    imageUrl: string | null;
    note: number | null;
  };
}

export async function fetchEvents(): Promise<Event[]> {
  const res = await fetch("http://localhost:8090/events");
  if (!res.ok) throw new Error("Erreur lors du chargement des événements");
  const data = await res.json();
  if (data._embedded && Array.isArray(data._embedded.eventSummaryResponses)) {
    return data._embedded.eventSummaryResponses;
  }
  return [];
} 