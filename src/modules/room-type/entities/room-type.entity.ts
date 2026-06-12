import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoomTypeStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('room_types')
export class RoomTypeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'hotel_id', type: 'varchar', length: 36 })
  hotelId!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'varchar', length: 100 })
  bedType!: string;

  @Column({ type: 'int', unsigned: true })
  price!: number;

  @Column({ type: 'json' })
  amenities!: string[];

  @Column({
    type: 'enum',
    enum: RoomTypeStatus,
    default: RoomTypeStatus.ACTIVE,
  })
  status!: RoomTypeStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date | null;
}