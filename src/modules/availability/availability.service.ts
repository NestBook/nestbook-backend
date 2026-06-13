import { Injectable, Inject } from '@nestjs/common';
import { AvailabilityEngine } from './strategies/availability.engine';
import { AvailabilityContext } from './types/availability-context.type';
import type { IAvailabilityBlockRepository } from './repository/availability-block.repository.interface';
import { AVAILABILITY_BLOCK_REPOSITORY } from './repository/availability-block.repository.interface';
import { CreateAvailabilityBlockDto } from './dto/create-availability-block.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    private readonly engine: AvailabilityEngine,

    @Inject(AVAILABILITY_BLOCK_REPOSITORY)
    private readonly blockRepo: IAvailabilityBlockRepository,
  ) {}

  check(ctx: AvailabilityContext) {
    return this.engine.calculate(ctx);
  }

  createBlock(dto: CreateAvailabilityBlockDto) {
    return this.blockRepo.create({
      roomTypeId: dto.roomTypeId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      quantity: dto.quantity,
      reason: dto.reason ?? null,
    });
  }

  async removeBlock(id: string) {
    await this.blockRepo.delete(id);

    return {
      deleted: true,
    };
  }

  getOwnerAvailability(ctx: AvailabilityContext) {
    return this.engine.calculate(ctx);
  }
}