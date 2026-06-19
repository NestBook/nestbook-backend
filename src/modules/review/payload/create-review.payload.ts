export class CreateReviewPayload {
  userId?: string;
  hotelId!: string;  
  bookingCode!: string;
  rating!: number;
  content!: string;
}