export interface User {
  id: number;
  lastName: string;
  firstName: string;
  pseudo: string;
  email: string;
  phone?: string | null;
  eventPastCount: number;
  eventsCount: number;
  role: string;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  socials?: string[] | string;
  categories?: string[];
  categoryKeys?: string[];
  note?: number | null;
  _links?: {
    self: {
      href: string;
    };
  };
}

export interface UsersApiResponse {
  _embedded: {
    userResponses: User[];
  };
  _links: any;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  pseudo?: string;
  email?: string;
  password?: string;
  phone?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  socials?: string | null;
  categoryKeys?: string[];
  note?: number | null;
}
