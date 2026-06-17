import { EntityManager } from 'typeorm';
import { InvoiceEntity } from '../entity/invoice.entity';
import { BookingEntity } from 'src/modules/booking/entity/booking.entity';

export const INVOICE_REPOSITORY = Symbol('INVOICE_REPOSITORY');

export interface IInvoiceRepository {
    findByInvoiceCode(invoiceCode: string): Promise<InvoiceEntity | null>;
    createForBooking(booking: BookingEntity, manager: EntityManager): Promise<InvoiceEntity>;
}
