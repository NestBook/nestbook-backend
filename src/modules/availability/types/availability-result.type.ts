export type AvailabilityResult = {
  roomTypeId: string;

  total: number;
  booked: number;
  held: number;
  blocked: number;

  available: number;

  canBook: boolean;
};