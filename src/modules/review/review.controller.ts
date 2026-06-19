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
import { CreatedResponse } from 'src/commons/core/response/success/created.response';
import { OkResponse } from 'src/commons/core/response/success/ok.response';

@Controller()
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) { }

    @Public()
    @Post('/reviews')
    async createReview(@Body() dto: CreateReviewDto) {
        return new CreatedResponse(await this.reviewService.createReview(dto));
    }

    @Public()
    @Get('/hotels/:id/reviews')
    async getReviews(
        @Param('id') hotelId: string,
        @Query() query: any,
    ) {
        return new OkResponse(await this.reviewService.getHotelReviews(hotelId, query));
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/reviews/:id')
    async deleteReview(
        @Param('id') id: string,
        @Req() req: any,
    ) {
        const userId = req.user.id;
        const role = req.user.role;

        return new OkResponse(await this.reviewService.deleteReview(id, userId, role));
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/admin/reviews/:id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateReviewStatusDto,
    ) {
        const payload: UpdateReviewStatusPayload = dto;

        return new OkResponse(await this.reviewService.updateStatus(id, payload));
    }

    @Public()
    @Get('/hotels/:id/rating')
    async getRating(@Param('id') hotelId: string) {
        return new OkResponse(await this.reviewService.getHotelRating(hotelId));
    }

    @Public()
    @Get('/hotels/:id/rating-distribution')
    async getDistribution(@Param('id') hotelId: string) {
        return new OkResponse(await this.reviewService.getRatingDistribution(hotelId));
    }
}