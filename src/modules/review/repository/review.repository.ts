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

  async create(payload: CreateReviewPayload, hotelId: string) {
    const entity = this.repo.create({
      ...payload,
      hotelId,
    });

    return this.repo.save(entity);
  }

  async findByBookingCode(bookingCode: string) {
    return this.repo.findOne({
      where: {
        bookingCode,
        status: ReviewStatus.VISIBLE,
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
}