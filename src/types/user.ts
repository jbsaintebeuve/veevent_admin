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
  categories?: Array<{ name: string; key: string }>;
  categoryKeys?: string[];
  note?: number | null;
  _links?: any;
}

export interface UsersApiResponse {
  _embedded: {
    userResponses: User[];
  };
  _links: any;
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
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
