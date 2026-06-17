import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum HotelStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@Entity('hotels')
export class HotelEntity {
    @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'varchar', length: 100 })
    city!: string;

    @Column({ type: 'varchar', length: 500 })
    address!: string;

    @Column({ type: 'varchar', length: 30, unique: true, })
    phone!: string;

    @Column({
        type: 'text',
        nullable: true,
    })
    description!: string | null;

    @Column({
        name: 'owner_id',
        type: 'bigint',
        unsigned: true,
        nullable: true,
    })
    ownerId!: string | null;

    @Column({
        type: 'enum',
        enum: HotelStatus,
        default: HotelStatus.ACTIVE,
    })
    status!: HotelStatus;

    @Column({ type: 'json', nullable: true })
    images!: string[] | null;

    @CreateDateColumn({
        name: 'created_at',
        type: 'datetime',
    })
    createdAt!: Date;

    @UpdateDateColumn({
        name: 'updated_at',
        type: 'datetime',
    })
    updatedAt!: Date;

    @DeleteDateColumn({
        name: 'deleted_at',
        type: 'datetime',
        nullable: true,
    })
    deletedAt!: Date | null;
}