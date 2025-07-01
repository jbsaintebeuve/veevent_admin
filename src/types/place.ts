export interface Place {
  id: number;
  name: string;
  address: string;
  description?: string;
  slug: string;
  type: string | null;
  location: {
    latitude: number;
    longitude: number;
  };
  eventsCount: number;
  eventsPastCount: number;
  cityName: string;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  _links?: any;
}

export interface PlacesApiResponse {
  _embedded: {
    placeResponses: Place[];
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface PlaceRequest {
  name: string;
  description?: string;
  address: string;
  cityName: string;
  cityId: number;
  type?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
}

export type PlaceCreateRequest = PlaceRequest;
export type PlaceUpdateRequest = PlaceRequest;
