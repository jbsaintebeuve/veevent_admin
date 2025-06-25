export interface Event {}

export interface EventsApiResponse {
  _embedded: {
    events: Event[];
  };
  _links: any;
  page: any;
}

export interface EventRequest {}

export type EventCreateRequest = EventRequest;
export type EventUpdateRequest = EventRequest;
