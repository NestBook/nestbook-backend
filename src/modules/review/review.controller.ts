import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Delete,
    Req,
    Query,
    UseGuards,
} from '@nestjs/common';

import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewStatusDto } from './dto/update-review-status.dto';

import { CreateReviewPayload } from './payload/create-review.payload';
import { UpdateReviewStatusPayload } from './payload/update-review-status.payload';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from 'src/commons/decorators/public.decorator';

@Controller()
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Public()
    @Post('/reviews')
    async createReview(@Body() dto: CreateReviewDto) {
        return this.reviewService.createReview(dto);
    }

    @Get('/hotels/:id/reviews')
    async getReviews(
        @Param('id') hotelId: string,
        @Query() query: any,
    ) {
        return this.reviewService.getHotelReviews(hotelId, query);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/reviews/:id')
    async deleteReview(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        const role = req.user.role;

        return this.reviewService.deleteReview(id, userId, role);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/admin/reviews/:id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateReviewStatusDto,
    ) {
        const payload: UpdateReviewStatusPayload = dto;

        return this.reviewService.updateStatus(id, payload);
    }
}