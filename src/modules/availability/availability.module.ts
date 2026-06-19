import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityEngine } from './strategies/availability.engine';
import { RedisHoldStrategy } from './strategies/redis-hold.strategy';
import { BlockAvailabilityStrategy } from './strategies/block-availability.strategy';
import { BookedAvailabilityStrategy } from './strategies/booked-availability.strategy';
import { RoomTypeModule } from '../room-type/room-type.module';
import { AvailabilityBlockEntity } from './entities/availability-block.entity';
import { AvailabilityBlockRepository } from './repository/availability-block.repository';
import { AVAILABILITY_BLOCK_REPOSITORY } from './repository/availability-block.repository.interface';
import { BookingEntity } from '../booking/entity/booking.entity';


@Module({
  imports: [
    RoomTypeModule,
    TypeOrmModule.forFeature([
      AvailabilityBlockEntity,
      BookingEntity,
    ]),
  ],
  controllers: [AvailabilityController],
  providers: [
    AvailabilityService,
    AvailabilityEngine,

    RedisHoldStrategy,
    BlockAvailabilityStrategy,
    BookedAvailabilityStrategy,

    {
      provide: AVAILABILITY_BLOCK_REPOSITORY,
      useClass: AvailabilityBlockRepository,
    },
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule { }