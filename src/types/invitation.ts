export interface Invitation {
  description: string;
  status: string;
  _links: any;
}

export interface InvitationsApiResponse {
  _embedded: {
    invitations: Invitation[];
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
