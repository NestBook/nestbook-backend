import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { AvailabilityBlockEntity } from '../entities/availability-block.entity';
import type { IAvailabilityBlockRepository } from './availability-block.repository.interface';

@Injectable()
export class AvailabilityBlockRepository
  implements IAvailabilityBlockRepository
{
  constructor(
    @InjectRepository(AvailabilityBlockEntity)
    private readonly repo: Repository<AvailabilityBlockEntity>,
  ) {}

  async create(
    payload: Partial<AvailabilityBlockEntity>,
  ): Promise<AvailabilityBlockEntity> {
    const entity = this.repo.create(payload);

    return this.repo.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async sumBlockedQuantity(
    roomTypeId: string,
    checkIn: Date,
    checkOut: Date,
  ): Promise<number> {
    const result = await this.repo
      .createQueryBuilder('block')
      .select(
        'COALESCE(SUM(block.quantity),0)',
        'total',
      )
      .where(
        'block.roomTypeId = :roomTypeId',
        { roomTypeId },
      )
      .andWhere(
        'block.startDate < :checkOut',
        { checkOut },
      )
      .andWhere(
        'block.endDate > :checkIn',
        { checkIn },
      )
      .getRawOne();

    return Number(result.total);
  }

  findByRoomType(
    roomTypeId: string,
  ): Promise<AvailabilityBlockEntity[]> {
    return this.repo.find({
      where: {
        roomTypeId,
      },
      order: {
        startDate: 'ASC',
      },
    });
  }
}