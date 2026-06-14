import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum BookingStatus {
    PENDING_PAYMENT = 'PENDING_PAYMENT',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED',
    FAILED = 'FAILED',
}

export enum BookingPaymentStatus {
    PENDING = 'PENDING',
    PAID = 'PAID',
    FAILED = 'FAILED',
    EXPIRED = 'EXPIRED',
    CANCELLED = 'CANCELLED'
}

@Entity('bookings')
export class BookingEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id: string;

    @Column({ name: 'booking_code', type: 'varchar', length: 50, unique: true })
    bookingCode: string;

    @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
    userId: string | null;

    @Column({ name: 'hotel_id', type: 'bigint', unsigned: true })
    hotelId: string;

    @Column({ name: 'room_type_id', type: 'varchar', length: 36 })
    roomTypeId: string;

    @Column({ name: 'guest_name', type: 'varchar', length: 150 })
    guestName: string;

    @Column({ name: 'guest_email', type: 'varchar', length: 255 })
    guestEmail: string;

    @Column({ name: 'guest_phone', type: 'varchar', length: 30 })
    guestPhone: string;

    @Column({ name: 'check_in_date', type: 'date' })
    checkInDate: Date;

    @Column({ name: 'check_out_date', type: 'date' })
    checkOutDate: Date;

    @Column({ type: 'int', unsigned: true })
    quantity: number;

    @Column({ type: 'int', unsigned: true })
    nights: number;

    @Column({
        name: 'price_per_night',
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    pricePerNight: number;

    @Column({
        name: 'room_subtotal',
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    roomSubtotal: number;

    @Column({
        name: 'discount_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    })
    discountAmount: number;

    @Column({
        name: 'final_amount',
        type: 'decimal',
        precision: 12,
        scale: 2,
    })
    finalAmount: number;

    @Column({
        name: 'booking_status',
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING_PAYMENT,
    })
    bookingStatus: BookingStatus;

    @Column({
        name: 'payment_status',
        type: 'enum',
        enum: BookingPaymentStatus,
        default: BookingPaymentStatus.PENDING,
    })
    paymentStatus: BookingPaymentStatus;

    @Column({ name: 'hold_expires_at', type: 'datetime', nullable: true })
    holdExpiresAt: Date | null;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;

    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime', nullable: true })
    deletedAt: Date | null;

    @Column({ name: 'cancelled_at', type: 'datetime', nullable: true })
    cancelledAt: Date | null;

    @Column({ name: 'cancel_reason', type: 'varchar', length: 500, nullable: true })
    cancelReason: string | null;
}
