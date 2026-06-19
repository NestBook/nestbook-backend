import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

import { HotelEntity, HotelStatus } from '../../modules/hotel/entities/hotel.entity';
import { RoomTypeEntity, RoomTypeStatus } from '../../modules/room-type/entities/room-type.entity';
import { LoggerService } from '../../infrastructures/logger/logger.service';

const SEED_HOTELS: Array<{
    name: string;
    city: string;
    address: string;
    phone: string;
    description: string;
    roomTypes: Array<{
        name: string;
        bedType: string;
        price: number;
        totalQuantity: number;
        amenities: string[];
    }>;
}> = [
    {
        name: 'Grand Palace Hotel',
        city: 'Hà Nội',
        address: '12 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội',
        phone: '0243 824 1234',
        description: 'Khách sạn 5 sao trung tâm thủ đô, view hồ Hoàn Kiếm.',
        roomTypes: [
            {
                name: 'Standard Single',
                bedType: 'Single',
                price: 800000,
                totalQuantity: 10,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar'],
            },
            {
                name: 'Deluxe Double',
                bedType: 'Double',
                price: 1500000,
                totalQuantity: 8,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Bathtub', 'City View'],
            },
            {
                name: 'Suite',
                bedType: 'King',
                price: 3500000,
                totalQuantity: 3,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Jacuzzi', 'Lake View', 'Living Room'],
            },
        ],
    },
    {
        name: 'Saigon Riverside Hotel',
        city: 'Hồ Chí Minh',
        address: '38 Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
        phone: '0283 910 5678',
        description: 'Khách sạn sang trọng bên sông Sài Gòn, gần khu trung tâm thương mại.',
        roomTypes: [
            {
                name: 'Superior Room',
                bedType: 'Double',
                price: 1200000,
                totalQuantity: 15,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Coffee Maker'],
            },
            {
                name: 'River View Room',
                bedType: 'Queen',
                price: 2000000,
                totalQuantity: 6,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Coffee Maker', 'River View', 'Balcony'],
            },
            {
                name: 'Junior Suite',
                bedType: 'King',
                price: 4000000,
                totalQuantity: 4,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Safe', 'Coffee Maker', 'River View', 'Balcony', 'Living Room', 'Jacuzzi'],
            },
        ],
    },
    {
        name: 'Da Nang Beach Resort',
        city: 'Đà Nẵng',
        address: '68 Võ Nguyên Giáp, Mỹ An, Ngũ Hành Sơn, Đà Nẵng',
        phone: '0236 395 9999',
        description: 'Resort biển đẳng cấp tại bãi biển Mỹ Khê, Đà Nẵng.',
        roomTypes: [
            {
                name: 'Garden View Room',
                bedType: 'Twin',
                price: 1000000,
                totalQuantity: 20,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Pool Access'],
            },
            {
                name: 'Sea View Room',
                bedType: 'Double',
                price: 1800000,
                totalQuantity: 12,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Sea View', 'Balcony', 'Pool Access'],
            },
            {
                name: 'Beach Front Villa',
                bedType: 'King',
                price: 5000000,
                totalQuantity: 5,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Private Pool', 'Sea View', 'Kitchen', 'Living Room'],
            },
        ],
    },
    {
        name: 'Hội An Lantern Boutique Hotel',
        city: 'Hội An',
        address: '22 Trần Phú, Minh An, Hội An, Quảng Nam',
        phone: '0235 386 7777',
        description: 'Khách sạn boutique phong cách Hội An cổ kính, nằm ngay phố cổ.',
        roomTypes: [
            {
                name: 'Heritage Room',
                bedType: 'Double',
                price: 900000,
                totalQuantity: 8,
                amenities: ['WiFi', 'Air Conditioning', 'Traditional Decor', 'Courtyard View'],
            },
            {
                name: 'Premium Heritage Room',
                bedType: 'King',
                price: 1600000,
                totalQuantity: 5,
                amenities: ['WiFi', 'Air Conditioning', 'Traditional Decor', 'Old Town View', 'Bathtub'],
            },
        ],
    },
    {
        name: 'Nha Trang Pearl Hotel',
        city: 'Nha Trang',
        address: '10 Trần Phú, Lộc Thọ, Nha Trang, Khánh Hoà',
        phone: '0258 352 2222',
        description: 'Khách sạn 4 sao ngay bãi biển Nha Trang, tiện nghi hiện đại.',
        roomTypes: [
            {
                name: 'Standard Room',
                bedType: 'Single',
                price: 700000,
                totalQuantity: 18,
                amenities: ['WiFi', 'TV', 'Air Conditioning'],
            },
            {
                name: 'Ocean View Room',
                bedType: 'Queen',
                price: 1400000,
                totalQuantity: 10,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Ocean View', 'Balcony'],
            },
            {
                name: 'Family Suite',
                bedType: 'King + Twin',
                price: 2800000,
                totalQuantity: 4,
                amenities: ['WiFi', 'TV', 'Air Conditioning', 'Ocean View', 'Living Room', 'Two Bathrooms'],
            },
        ],
    },
];

@Injectable()
export class HotelSeeder implements OnApplicationBootstrap {
    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource,

        private readonly logger: LoggerService,
    ) {}

    async onApplicationBootstrap(): Promise<void> {
        if (process.env.SKIP_HOTEL_SEED === 'true') {
            return;
        }

        try {
            const hotelRepo = this.dataSource.getRepository(HotelEntity);
            const roomTypeRepo = this.dataSource.getRepository(RoomTypeEntity);

            const existingCount = await hotelRepo.count();
            if (existingCount > 0) {
                this.logger.log(
                    `Hotel data already present (${existingCount} hotels) — skipping hotel seed`,
                    'HotelSeeder',
                );
                return;
            }

            for (const hotelData of SEED_HOTELS) {
                await this.dataSource.transaction(async (manager) => {
                    const hotel = manager.create(HotelEntity, {
                        name: hotelData.name,
                        city: hotelData.city,
                        address: hotelData.address,
                        phone: hotelData.phone,
                        description: hotelData.description,
                        ownerId: null,
                        status: HotelStatus.ACTIVE,
                        images: null,
                    });
                    await manager.save(HotelEntity, hotel);

                    for (const rtData of hotelData.roomTypes) {
                        const roomType = manager.create(RoomTypeEntity, {
                            hotelId: hotel.id,
                            name: rtData.name,
                            bedType: rtData.bedType,
                            price: rtData.price,
                            totalQuantity: rtData.totalQuantity,
                            amenities: rtData.amenities,
                            status: RoomTypeStatus.ACTIVE,
                            images: null,
                        });
                        await manager.save(RoomTypeEntity, roomType);
                    }
                });
            }

            this.logger.log(
                `Hotel seed completed: ${SEED_HOTELS.length} hotels inserted`,
                'HotelSeeder',
            );
        } catch (error) {
            this.logger.error(`Hotel seed failed: ${String(error)}`, 'HotelSeeder');
        }
    }
}
