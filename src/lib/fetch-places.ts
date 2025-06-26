import { Place } from "@/types/place";

export async function fetchPlaces(): Promise<Place[]> {
  const res = await fetch("http://localhost:8090/places");
  if (!res.ok) throw new Error("Erreur lors du chargement des lieux");
  const data = await res.json();
  let places: any[] = [];
  if (data._embedded && Array.isArray(data._embedded.placeResponses)) {
    places = data._embedded.placeResponses;
  } else if (data._embedded && Array.isArray(data._embedded.places)) {
    places = data._embedded.places;
  } else if (data.places && Array.isArray(data.places)) {
    places = data.places;
  } else if (Array.isArray(data)) {
    places = data;
  }
  return places as Place[];
} 