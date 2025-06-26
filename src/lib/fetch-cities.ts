import { City } from "@/types/city";

export async function fetchCities(): Promise<City[]> {
  const res = await fetch("http://localhost:8090/cities");
  if (!res.ok) throw new Error("Erreur lors du chargement des villes");
  const data = await res.json();
  let cities: any[] = [];
  if (data._embedded && Array.isArray(data._embedded.cityResponses)) {
    cities = data._embedded.cityResponses;
  } else if (data._embedded && Array.isArray(data._embedded.cities)) {
    cities = data._embedded.cities;
  } else if (data.cities && Array.isArray(data.cities)) {
    cities = data.cities;
  } else if (Array.isArray(data)) {
    cities = data;
  }
  return cities as City[];
} 