import {
    Injectable,
    Inject
} from '@nestjs/common';

import { ReviewRepository } from './repository/review.repository';
import { CreateReviewPayload } from './payload/create-review.payload';
import { ReviewStatus } from './entities/review.entity';
import { UpdateReviewStatusPayload } from './payload/update-review-status.payload';

import { BookingRepository } from '../booking/repository/booking.repository';
import { BOOKING_REPOSITORY } from '../booking/repository/booking.repository.interface';
import { BookingPaymentStatus } from '../booking/entity/booking.entity';
import { BadRequestError } from '../../commons/core/response/error/badrequest.error';
import { ForbiddenError } from '../../commons/core/response/error/forbidden.error';
import { NotFoundError } from '../../commons/core/response/error/notfound.error';

@Injectable()
export class ReviewService {
    constructor(
        private readonly reviewRepository: ReviewRepository,

        @Inject(BOOKING_REPOSITORY)
        private readonly bookingRepository: BookingRepository,
    ) { }

    async createReview(payload: CreateReviewPayload) {
        const booking = await this.bookingRepository.findBookingByCode(
            payload.bookingCode,
        );

        if (!booking) {
            throw new NotFoundError('Booking not found');
        }

        if (booking.paymentStatus !== BookingPaymentStatus.PAID) {
            throw new BadRequestError('Only paid booking can be reviewed');
        }

        const existing = await this.reviewRepository.findByBookingCode(
            payload.bookingCode,
        );

        if (existing) {
            throw new BadRequestError('This booking already has a review');
        }

        return this.reviewRepository.create(
            {
                bookingCode: payload.bookingCode,
                rating: payload.rating,
                content: payload.content,
                userId: payload.userId,
            },
            booking.hotelId,
        );
    }

    async getHotelReviews(hotelId: string, query: any) {
        const page = Math.max(1, Number(query.page) || 1);
        const pageSize = Math.min(
            50,
            Math.max(1, Number(query.pageSize) || 10),
        );

        const [reviews, total] =
            await this.reviewRepository.findByHotelId(
                hotelId,
                page,
                pageSize,
            );

        return {
            data: reviews,
            pagination: {
                page,
                pageSize,
                totalItems: total,
                totalPages: Math.ceil(total / pageSize),
            },
        };
    }

    async deleteReview(
        reviewId: string,
        userId: string,
        role: string,
    ) {
        const review = await this.reviewRepository.findById(reviewId);

        if (!review) {
            throw new NotFoundError('Review not found');
        }

        if (review.userId !== userId && role !== 'ADMIN') {
            throw new ForbiddenError('Not allowed to delete review');
        }

        await this.reviewRepository.updateStatus(
            reviewId,
            ReviewStatus.HIDDEN,
        );
    }

    async updateStatus(
        reviewId: string,
        payload: UpdateReviewStatusPayload,
    ) {
        const review = await this.reviewRepository.findById(reviewId);

        if (!review) {
            throw new NotFoundError('Review not found');
        }

        if (!Object.values(ReviewStatus).includes(payload.status)) {
            throw new BadRequestError('Invalid status');
        }

        await this.reviewRepository.updateStatus(
            reviewId,
            payload.status,
        );
    }

    async getHotelRating(hotelId: string) {
        return this.reviewRepository.getHotelRating(hotelId);
    }

    async getRatingDistribution(hotelId: string) {
        return this.reviewRepository.getRatingDistribution(hotelId);
    }
}