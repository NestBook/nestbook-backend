import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ReviewEntity } from './entities/review.entity';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from './repository/review.repository';
import { BookingModule } from '../booking/booking.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    BookingModule,
    AuthModule,
    TypeOrmModule.forFeature([ReviewEntity]),
  ],
  controllers: [ReviewController],
  providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}