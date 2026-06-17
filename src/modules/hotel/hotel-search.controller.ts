import { Controller, Get, Query } from '@nestjs/common';
import { HotelSearchService } from './hotel-search.service';
import { Public } from 'src/commons/decorators/public.decorator';

@Controller('hotels/search')
export class HotelSearchController {
  constructor(private readonly service: HotelSearchService) {}

  @Public()
  @Get()
  search(@Query() query: any) {
    return this.service.search(query);
  }
}