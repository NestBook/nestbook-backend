import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('invoices')
export class InvoiceEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ name: 'invoice_code', type: 'varchar', length: 50, unique: true })
    invoiceCode: string;

    @Column({ name: 'booking_id', type: 'bigint', unsigned: true })
    bookingId: string;

    @Column({ name: 'booking_code', type: 'varchar', length: 50 })
    bookingCode: string;

    @Index()
    @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
    userId: string | null;

    @Index()
    @Column({ name: 'hotel_id', type: 'bigint', unsigned: true })
    hotelId: string;

    @Column({ name: 'guest_name', type: 'varchar', length: 150 })
    guestName: string;

    @Column({ name: 'guest_email', type: 'varchar', length: 255 })
    guestEmail: string;

    @Column({ name: 'final_amount', type: 'decimal', precision: 12, scale: 2 })
    finalAmount: number;

    @CreateDateColumn({ name: 'issued_at', type: 'datetime' })
    issuedAt: Date;
}
