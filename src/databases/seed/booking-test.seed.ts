import 'reflect-metadata';
import 'dotenv/config';

import { DataSource, EntityManager, IsNull } from 'typeorm';

import {
  HotelEntity,
  HotelStatus,
} from '../../modules/hotel/entities/hotel.entity';
import {
  RoomTypeEntity,
  RoomTypeStatus,
} from '../../modules/room-type/entities/room-type.entity';

const TEST_HOTEL = {
  name: 'NestBook Test Hotel',
  city: 'Ho Chi Minh',
  address: '123 Nguyen Hue, District 1',
  phone: '0900000001',
  description: 'Hotel for booking availability test',
};

const TEST_ROOM_TYPE = {
  name: 'Deluxe Double Room',
  bedType: 'DOUBLE',
  price: 100,
  amenities: ['wifi', 'breakfast', 'air_conditioner'],
  totalQuantity: 5,
};

const REQUIRED_ENV_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_DATABASE',
];

function assertRequiredEnv(): void {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missingKeys.join(', ')}`,
    );
  }
}

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: [HotelEntity, RoomTypeEntity],
});

async function upsertHotel(manager: EntityManager): Promise<HotelEntity> {
  const hotelRepository = manager.getRepository(HotelEntity);

  const existingHotel = await hotelRepository.findOne({
    where: {
      phone: TEST_HOTEL.phone,
    },
    withDeleted: true,
  });

  if (existingHotel) {
    existingHotel.name = TEST_HOTEL.name;
    existingHotel.city = TEST_HOTEL.city;
    existingHotel.address = TEST_HOTEL.address;
    existingHotel.description = TEST_HOTEL.description;
    existingHotel.ownerId = null;
    existingHotel.status = HotelStatus.ACTIVE;
    existingHotel.deletedAt = null;

    return hotelRepository.save(existingHotel);
  }

  const hotel = hotelRepository.create({
    ...TEST_HOTEL,
    ownerId: null,
    status: HotelStatus.ACTIVE,
  });

  return hotelRepository.save(hotel);
}

async function upsertRoomType(
  manager: EntityManager,
  hotelId: string,
): Promise<RoomTypeEntity> {
  const roomTypeRepository = manager.getRepository(RoomTypeEntity);

  const existingRoomType = await roomTypeRepository.findOne({
    where: {
      hotelId,
      name: TEST_ROOM_TYPE.name,
    },
    withDeleted: true,
  });

  if (existingRoomType) {
    existingRoomType.bedType = TEST_ROOM_TYPE.bedType;
    existingRoomType.price = TEST_ROOM_TYPE.price;
    existingRoomType.amenities = TEST_ROOM_TYPE.amenities;
    existingRoomType.totalQuantity = TEST_ROOM_TYPE.totalQuantity;
    existingRoomType.status = RoomTypeStatus.ACTIVE;
    existingRoomType.deletedAt = null;

    return roomTypeRepository.save(existingRoomType);
  }

  const roomType = roomTypeRepository.create({
    hotelId,
    ...TEST_ROOM_TYPE,
    status: RoomTypeStatus.ACTIVE,
  });

  return roomTypeRepository.save(roomType);
}

async function main(): Promise<void> {
  assertRequiredEnv();

  await dataSource.initialize();

  try {
    const result = await dataSource.transaction(async (manager) => {
      const hotel = await upsertHotel(manager);
      const roomType = await upsertRoomType(manager, String(hotel.id));

      return {
        hotelId: String(hotel.id),
        roomTypeId: String(roomType.id),
      };
    });

    console.log(`hotelId=${result.hotelId}`);
    console.log(`roomTypeId=${result.roomTypeId}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch(async (error: unknown) => {
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }

  const message = error instanceof Error ? error.message : String(error);
  console.error(`booking-test seed failed: ${message}`);
  process.exitCode = 1;
});
