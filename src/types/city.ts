export interface City {
  id: number;
  name: string;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  region: string;
  slug: string;
  postalCode: string;
  country: string;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  description?: string;
  eventsCount: number;
  eventsPastCount: number;
  nearestCities: City[];
  _links?: any;
}

export interface CitiesApiResponse {
  _embedded: {
    cities: City[];
  };
  _links: any;
  page: any;
}

export interface CityRequest {
  name: string;
  description: string;
  region: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  nearestCityIds: number[];
}

export type CityCreateRequest = CityRequest;
export type CityUpdateRequest = CityRequest;
