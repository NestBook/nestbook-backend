import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityEngine } from './strategies/availability.engine';
import { BookingAggregationStrategy } from './strategies/booking-aggregation.strategy';
import { RedisHoldStrategy } from './strategies/redis-hold.strategy';
import { BlockAvailabilityStrategy } from './strategies/block-availability.strategy';
import { RoomTypeModule } from '../room-type/room-type.module';
import { AvailabilityBlockEntity } from './entities/availability-block.entity';
import { AvailabilityBlockRepository } from './repository/availability-block.repository';
import { AVAILABILITY_BLOCK_REPOSITORY } from './repository/availability-block.repository.interface';


@Module({
  imports: [
    RoomTypeModule,
    TypeOrmModule.forFeature([
      AvailabilityBlockEntity,
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    AvailabilityEngine,

    BookingAggregationStrategy,
    RedisHoldStrategy,
    BlockAvailabilityStrategy,

    {
      provide: AVAILABILITY_BLOCK_REPOSITORY,
      useClass: AvailabilityBlockRepository,
    },
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule { }