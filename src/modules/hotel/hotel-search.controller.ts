import { Controller, Get, Query } from '@nestjs/common';
import { HotelSearchService } from './hotel-search.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { OkResponse } from 'src/commons/core/response/success/ok.response';

@Controller('hotels/search')
export class HotelSearchController {
  constructor(private readonly service: HotelSearchService) {}

  @Public()
  @Get()
  async search(@Query() query: any) {
    return new OkResponse(await this.service.search(query));
  }
}