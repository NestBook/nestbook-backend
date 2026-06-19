import { ReviewEntity, ReviewStatus } from '../entities/review.entity';
import { CreateReviewPayload } from '../payload/create-review.payload';

export interface IReviewRepository {
  create(
    payload: CreateReviewPayload
  ): Promise<ReviewEntity>;

  findByBookingCode(
    bookingCode: string,
    hotelId: string,
  ): Promise<ReviewEntity | null>;

  findByHotelId(
    hotelId: string,
    page: number,
    pageSize: number,
  ): Promise<[ReviewEntity[], number]>;

  findById(id: string): Promise<ReviewEntity | null>;

  updateStatus(
    id: string,
    status: ReviewStatus,
  ): Promise<void>;

  getHotelRating(hotelId: string): Promise<{
    avgRating: number;
    totalReviews: number;
  }>;

  getRatingDistribution(hotelId: string): Promise<
    { rating: number; count: number }[]
  >;
}