import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InvoiceEntity } from '../entity/invoice.entity';
import { BookingEntity } from 'src/modules/booking/entity/booking.entity';
import type { IInvoiceRepository } from './invoice.repository.interface';

@Injectable()
export class InvoiceRepository implements IInvoiceRepository {
    constructor(
        @InjectRepository(InvoiceEntity)
        private readonly invoiceOrmRepository: Repository<InvoiceEntity>,
    ) { }

    findByInvoiceCode(invoiceCode: string): Promise<InvoiceEntity | null> {
        return this.invoiceOrmRepository.findOne({ where: { invoiceCode } });
    }

    findAllByUserId(userId: string): Promise<InvoiceEntity[]> {
        return this.invoiceOrmRepository.find({
            where: { userId },
            order: { issuedAt: 'DESC' },
        });
    }

    findAllByHotelId(hotelId: string): Promise<InvoiceEntity[]> {
        return this.invoiceOrmRepository.find({
            where: { hotelId },
            order: { issuedAt: 'DESC' },
        });
    }

    async createForBooking(booking: BookingEntity, manager: EntityManager): Promise<InvoiceEntity> {
        const invoiceCode = await this.generateInvoiceCode(manager);

        const invoice = manager.create(InvoiceEntity, {
            invoiceCode,
            bookingId: String(booking.id),
            bookingCode: booking.bookingCode,
            userId: booking.userId ?? null,
            hotelId: String(booking.hotelId),
            guestName: booking.guestName,
            guestEmail: booking.guestEmail,
            finalAmount: booking.finalAmount,
        });

        return manager.save(InvoiceEntity, invoice);
    }

    private async generateInvoiceCode(manager: EntityManager): Promise<string> {
        for (let attempt = 0; attempt < 5; attempt += 1) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const random = Math.floor(Math.random() * 999999).toString().padStart(6, '0');
            const code = `INV${year}${month}${day}${random}`;

            const exists = await manager.findOne(InvoiceEntity, { where: { invoiceCode: code } });
            if (!exists) return code;
        }

        throw new Error('Could not generate invoice code');
    }
}
