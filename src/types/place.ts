export interface Place {
  id: number;
  name: string;
  address: string;
  slug: string;
  type: string;
  location: {
    latitude: number;
    longitude: number;
  };
  eventsCount: number;
  eventsPastCount: number;
  cityName: string;
  bannerUrl?: string;
  imageUrl?: string;
  content?: string;
  _links?: any;
}

export interface PlacesApiResponse {
  _embedded: {
    places: Place[];
  };
  _links: any;
  page: any;
}

export interface PlaceRequest {
  name: string;
  address: string;
  type: string;
  latitude: number;
  longitude: number;
  cityName: string;
  cityId: number;
  bannerUrl?: string | null;
  imageUrl?: string | null;
  content?: string | null;
}

export type PlaceCreateRequest = PlaceRequest;
export type PlaceUpdateRequest = PlaceRequest;
