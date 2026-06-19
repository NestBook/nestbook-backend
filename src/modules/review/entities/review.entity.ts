import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReviewStatus {
  VISIBLE = 'VISIBLE',
  HIDDEN = 'HIDDEN',
}

@Entity('reviews')
@Index(['bookingCode'], { unique: true }) 
export class ReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  hotelId!: string;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  bookingCode!: string;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'text' })
  content!: string;

  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.VISIBLE,
  })
  status!: ReviewStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}