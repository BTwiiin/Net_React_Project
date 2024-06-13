export interface RegisterModel {
  Username: string;
  Password: string;
}

export interface TimeSlot {
  id: number;
  startTime: string;
  endTime: string;
  ticketId: number;
}

export interface Ticket {
  id: number;
  brand: string;
  model: string;
  registrationId: string;
  description: string;
  totalPrice: number;
  status: string;
  timeSlots: TimeSlot[];
}

export interface Part {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  ticketId: number;
}

export interface User {
  id: number;
  username: string;
  password: string;
  tickets: Ticket[];
}

export interface TicketModel {
  brand: string;
  model: string;
  registrationId: string;
  description: string;
}

export interface PartModel {
  name: string;
  price: number;
  quantity: number;
}

export interface TimeSlotModel {
  startTime: string;
  endTime: string;
}
