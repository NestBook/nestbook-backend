import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewStatusPayload {
  status!: ReviewStatus;
}