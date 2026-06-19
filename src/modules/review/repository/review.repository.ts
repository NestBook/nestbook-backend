import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ReviewEntity, ReviewStatus } from '../entities/review.entity';
import { CreateReviewPayload } from '../payload/create-review.payload';

@Injectable()
export class ReviewRepository {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly repo: Repository<ReviewEntity>,
  ) { }

  async create(payload: CreateReviewPayload) {
    const entity = this.repo.create(payload);
    return this.repo.save(entity);
  }

  async findByBookingCode(bookingCode: string, hotelId: string) {
    return this.repo.findOne({
      where: {
        bookingCode,
        hotelId,
      },
    });
  }

  async findByHotelId(
    hotelId: string,
    page: number,
    pageSize: number,
  ): Promise<[ReviewEntity[], number]> {
    return this.repo.findAndCount({
      where: {
        hotelId,
        status: ReviewStatus.VISIBLE,
      },
      order: {
        createdAt: 'DESC',
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
  }

  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async updateStatus(id: string, status: ReviewStatus) {
    await this.repo.update({ id }, { status });
  }

  async getHotelRating(hotelId: string) {
    const result = await this.repo
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avgRating')
      .addSelect('COUNT(review.id)', 'totalReviews')
      .where('review.hotelId = :hotelId', { hotelId })
      .andWhere('review.status = :status', {
        status: ReviewStatus.VISIBLE,
      })
      .getRawOne();

    return {
      avgRating: Number(result?.avgRating || 0),
      totalReviews: Number(result?.totalReviews || 0),
    };
  }

  async getRatingDistribution(hotelId: string) {
    const result = await this.repo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.hotelId = :hotelId', { hotelId })
      .andWhere('review.status = :status', {
        status: ReviewStatus.VISIBLE,
      })
      .groupBy('review.rating')
      .orderBy('review.rating', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      rating: Number(r.rating),
      count: Number(r.count),
    }));
  }
}