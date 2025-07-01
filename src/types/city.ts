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
  eventsCount: number;
  eventsPastCount: number;
  nearestCities: number[];
  _links?: any;
}

export interface CitiesApiResponse {
  _embedded: {
    cityResponses: City[];
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface CityRequest {
  name: string;
  latitude: number | null;
  longitude: number | null;
  region: string;
  postalCode: string;
  country: string;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  nearestCityIds: number[]; // liste d'IDs
}

export type CityCreateRequest = CityRequest;
export type CityUpdateRequest = CityRequest;
