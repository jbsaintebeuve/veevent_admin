export interface Invitation {
  id?: number;
  description: string;
  status: "SENT" | "ACCEPTED" | "REJECTED";
  _links?: any;
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
