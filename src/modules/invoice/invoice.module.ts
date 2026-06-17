import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntity } from './entity/invoice.entity';
import { InvoiceService } from './invoice.service';
import { InvoiceController } from './invoice.controller';
import { INVOICE_REPOSITORY } from './repository/invoice.repository.interface';
import { InvoiceRepository } from './repository/invoice.repository';

@Module({
    imports: [TypeOrmModule.forFeature([InvoiceEntity])],
    controllers: [InvoiceController],
    providers: [
        InvoiceService,
        { provide: INVOICE_REPOSITORY, useClass: InvoiceRepository },
    ],
    exports: [InvoiceService],
})
export class InvoiceModule { }
