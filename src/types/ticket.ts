export interface Order {
  id: number;
  eventId: number;
  userId: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  _links?: any;
}

export interface Ticket {
  id: number;
  orderId: number;
  eventId: number;
  userId: number;
  status: "VALID" | "USED" | "CANCELLED";
  verificationKey: string; // Format: VV-{eventId}-{orderId}-{ticketId}
  createdAt: string;
  usedAt?: string;
  _links?: any;
}

export interface TicketVerificationRequest {
  verificationKey: string; // Format: VV-{eventId}-{orderId}-{ticketId}
}

export interface TicketVerificationResponse {
  isValid: boolean;
  ticket?: Ticket;
  event?: {
    id: number;
    name: string;
    date: string;
    status: string;
  };
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    pseudo: string;
  };
  order?: {
    id: number;
    status: string;
  };
  error?: string;
}

export interface TicketVerificationError {
  error: string;
  code: "TICKET_NOT_FOUND" | "EVENT_NOT_FOUND" | "ORDER_NOT_FOUND" | "USER_NOT_REGISTERED" | "TICKET_ALREADY_USED" | "EVENT_CANCELLED" | "UNAUTHORIZED" | "INVALID_FORMAT";
} 