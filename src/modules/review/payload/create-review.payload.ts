export class CreateReviewPayload {
  userId?: string;
  bookingCode!: string;
  rating!: number;
  content!: string;
}