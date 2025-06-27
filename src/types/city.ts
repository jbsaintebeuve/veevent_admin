export interface City {
  id: number;
  name: string;
  location: {
    latitude: number;
    longitude: number;
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
  nearestCities: City[];
  _links?: any;
}

export interface CitiesApiResponse {
  _embedded: {
    cityResponses: City[];
  };
  _links: any;
  page?: any;
}

export interface CityRequest {
  name: string;
  location: {
    latitude: number | null;
    longitude: number | null;
  };
  region: string;
  postalCode: string;
  country: string;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  nearestCities: number[]; // liste d'IDs
}

export type CityCreateRequest = CityRequest;
export type CityUpdateRequest = CityRequest;
