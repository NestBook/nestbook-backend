import { Controller, Get, Query } from '@nestjs/common';
import { HotelSearchService } from './hotel-search.service';

@Controller('hotels')
export class HotelSearchController {
  constructor(private readonly service: HotelSearchService) {}

  @Get('search')
  search(@Query() query: any) {
    return this.service.search(query);
  }
}