import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { HotelEntity } from './entities/hotel.entity';
import { HOTEL_REPOSITORY } from './repository/hotel.repository.interface';
import { HotelRepository } from './repository/hotel.repository';

import { LoggerModule } from 'src/infrastructures/logger/logger.module';
import { UserModule } from '../user/user.module';
import { RoomTypeModule } from '../room-type/room-type.module';
import { AvailabilityModule } from '../availability/availability.module';

import { HotelSearchController } from './hotel-search.controller';
import { OwnerHotelController } from './owner-hotel.controller';
import { HotelSearchService } from './hotel-search.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([HotelEntity]),
        LoggerModule,
        UserModule,
        forwardRef(() => RoomTypeModule),
        AvailabilityModule,
    ],

    controllers: [
        HotelController,        // admin
        HotelSearchController,  // public
        OwnerHotelController,   // owner
    ],

    providers: [
        HotelService,
        HotelSearchService,
        {
            provide: HOTEL_REPOSITORY,
            useClass: HotelRepository,
        },
    ],

    exports: [HotelService],
})
export class HotelModule { }
