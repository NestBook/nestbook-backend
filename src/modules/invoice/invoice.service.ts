import { Inject, Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { BookingEntity } from '../booking/entity/booking.entity';
import { InvoiceEntity } from './entity/invoice.entity';
import { INVOICE_REPOSITORY } from './repository/invoice.repository.interface';
import type { IInvoiceRepository } from './repository/invoice.repository.interface';
import { InvoiceResponse } from './response/invoice.response';
import { NotFoundError } from 'src/commons/core/response/error/notfound.error';

@Injectable()
export class InvoiceService {
    constructor(
        @Inject(INVOICE_REPOSITORY)
        private readonly invoiceRepository: IInvoiceRepository,
    ) { }

    async createForBooking(booking: BookingEntity, manager: EntityManager): Promise<InvoiceEntity> {
        return this.invoiceRepository.createForBooking(booking, manager);
    }

    async findByInvoiceCode(invoiceCode: string): Promise<InvoiceResponse> {
        const invoice = await this.invoiceRepository.findByInvoiceCode(invoiceCode);

        if (!invoice) throw new NotFoundError('Invoice not found');

        return this.mapToResponse(invoice);
    }

    async findAllByUserId(userId: string): Promise<InvoiceResponse[]> {
        const invoices = await this.invoiceRepository.findAllByUserId(userId);
        return invoices.map(this.mapToResponse);
    }

    async findAllByHotelId(hotelId: string): Promise<InvoiceResponse[]> {
        const invoices = await this.invoiceRepository.findAllByHotelId(hotelId);
        return invoices.map(this.mapToResponse);
    }

    private mapToResponse(invoice: InvoiceEntity): InvoiceResponse {
        return {
            id: String(invoice.id),
            invoiceCode: invoice.invoiceCode,
            bookingId: String(invoice.bookingId),
            bookingCode: invoice.bookingCode,
            userId: invoice.userId ?? null,
            hotelId: String(invoice.hotelId),
            guestName: invoice.guestName,
            guestEmail: invoice.guestEmail,
            finalAmount: Number(invoice.finalAmount),
            issuedAt: invoice.issuedAt,
        };
    }
}
