import { IsEnum } from 'class-validator';
import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewStatusDto {
  @IsEnum(ReviewStatus)
  status!: ReviewStatus;
}