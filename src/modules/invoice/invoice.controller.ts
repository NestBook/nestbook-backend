import { Controller, Get, Param, Request } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { OkResponse } from 'src/commons/core/response/success/ok.response';
import { Public } from 'src/commons/decorators/public.decorator';

@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Get('me')
    async findMyInvoices(@Request() req: any) {
        return new OkResponse(await this.invoiceService.findAllByUserId(req.user.id));
    }

    @Get('hotel/:hotelId')
    async findByHotel(@Param('hotelId') hotelId: string) {
        return new OkResponse(await this.invoiceService.findAllByHotelId(hotelId));
    }

    @Public()
    @Get(':invoiceCode')
    async findByInvoiceCode(@Param('invoiceCode') invoiceCode: string) {
        return new OkResponse(await this.invoiceService.findByInvoiceCode(invoiceCode));
    }
}
