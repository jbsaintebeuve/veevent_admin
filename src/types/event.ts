export interface Event {
  id: number;
  name: string;
  description: string;
  date: string; // Date et heure combinées
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
  categories: Array<{
    name: string;
    key: string;
  }>;
  organizer: {
    pseudo: string;
    lastName: string;
    firstName: string;
    imageUrl: string | null;
    note: number | null;
  };
  isInvitationOnly?: boolean;
  _links?: any;
}

export interface EventsApiResponse {
  _embedded: {
    eventSummaryResponses: Event[];
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}

export interface EventRequest {
  name: string;
  description: string;
  date: string;
  address: string;
  maxCustomers: number;
  price: number;
  cityId: number;
  placeId: number;
  categoryKeys: string[];
  imageUrl?: string;
  isTrending?: boolean;
  status?: string;
  contentHtml?: string;
  isInvitationOnly?: boolean;
}

export type EventCreateRequest = EventRequest;
export type EventUpdateRequest = EventRequest;

export interface EventDetails {
  id: number;
  date: string;
  description: string;
  name: string;
  address: string;
  maxCustomers: number;
  isTrending: boolean;
  isInvitationOnly: boolean;
  price: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
  contentHtml: string;
  imageUrl: string;
  currentParticipants: number;
  organizer: {
    pseudo: string;
    lastName: string;
    firstName: string;
    imageUrl: string | null;
    note: number | null;
  };
  cityName: string;
  placeName: string;
  categories: Array<{
    name: string;
    key: string;
  }>;
  _links?: any;
}

export interface EventParticipant {
  id: number;
  pseudo: string;
  imageUrl?: string | null;
  _links?: {
    self: {
      href: string;
    };
  };
}

export interface EventParticipantsApiResponse {
  _embedded: {
    userSummaries: EventParticipant[];
  };
  _links: {
    self: {
      href: string;
    };
    event: {
      href: string;
    };
  };
}
