export interface User {
  id: number;
  lastName: string;
  firstName: string;
  pseudo: string;
  email: string;
  phone: number;
  eventPastCount: number;
  eventsCount: number;
  role: string;
  description?: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  socials?: string[];
  categories?: string[];
  note?: number;
  _links?: any;
}

export interface UsersApiResponse {
  _embedded: {
    users: User[];
  };
  _links: any;
}

export interface UserUpdateRequest {
  lastName: string;
  firstName: string;
  pseudo: string;
  email: string;
  phone: number;
  description?: string;
  imageUrl?: string | null;
  bannerUrl?: string | null;
  socials?: string[];
  categoryKey?: string[];
  note?: number;
}
