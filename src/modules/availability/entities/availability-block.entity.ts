import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('availability_blocks')
export class AvailabilityBlockEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'room_type_id',
    type: 'varchar',
    length: 36,
  })
  roomTypeId!: string;

  @Column({
    name: 'start_date',
    type: 'date',
  })
  startDate!: Date;

  @Column({
    name: 'end_date',
    type: 'date',
  })
  endDate!: Date;

  @Column({
    type: 'int',
    unsigned: true,
  })
  quantity!: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  reason!: string | null;

  @CreateDateColumn()
  createdAt!: Date;
}