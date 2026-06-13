import { Injectable, Inject } from '@nestjs/common';

import { AVAILABILITY_BLOCK_REPOSITORY } from '../repository/availability-block.repository.interface';
import type { IAvailabilityBlockRepository } from '../repository/availability-block.repository.interface';
import { AvailabilityContext } from '../types/availability-context.type';

@Injectable()
export class BlockAvailabilityStrategy {
  constructor(
    @Inject(AVAILABILITY_BLOCK_REPOSITORY)
    private readonly repository: IAvailabilityBlockRepository,
  ) {}

  getBlocked(
    ctx: AvailabilityContext,
  ): Promise<number> {
    return this.repository.sumBlockedQuantity(
      ctx.roomTypeId,
      ctx.checkInDate,
      ctx.checkOutDate,
    );
  }
}