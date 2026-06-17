import { Controller, Get, Param } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { OkResponse } from 'src/commons/core/response/success/ok.response';
import { Public } from 'src/commons/decorators/public.decorator';

@Public()
@Controller('invoices')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) { }

    @Get(':invoiceCode')
    async findByInvoiceCode(@Param('invoiceCode') invoiceCode: string) {
        return new OkResponse(await this.invoiceService.findByInvoiceCode(invoiceCode));
    }
}
