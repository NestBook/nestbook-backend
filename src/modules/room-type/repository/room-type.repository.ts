import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoomTypeEntity } from '../entities/room-type.entity';
import { CreateRoomTypePayload } from '../payload/create-room-type.payload';
import { UpdateRoomTypePayload } from '../payload/update-room-type.payload';
import type { IRoomTypeRepository } from './room-type.repository.interface';

@Injectable()
export class RoomTypeRepository implements IRoomTypeRepository {
  constructor(
    @InjectRepository(RoomTypeEntity)
    private readonly repo: Repository<RoomTypeEntity>,
  ) { }

  findById(id: string): Promise<RoomTypeEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByHotelId(hotelId: string): Promise<RoomTypeEntity[]> {
    return this.repo.find({ where: { hotelId } });
  }

  async findAll(): Promise<RoomTypeEntity[]> {
    return this.repo.find();
  }

  async createRoomType(
    payload: CreateRoomTypePayload,
  ): Promise<RoomTypeEntity> {
    const entity = this.repo.create(payload);
    return await this.repo.save(entity);
  }

  async updateRoomType(
    entity: RoomTypeEntity,
    payload: UpdateRoomTypePayload,
  ): Promise<RoomTypeEntity> {
    Object.assign(entity, payload);
    return await this.repo.save(entity);
  }

  async softDeleteRoomType(id: string): Promise<void> {
    await this.repo.softDelete(id);
  }

  getManager() {
    return this.repo.manager;
  }
}