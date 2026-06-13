import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { HotelEntity } from './entities/hotel.entity';
import { HOTEL_REPOSITORY } from './repository/hotel.repository.interface';
import { HotelRepository } from './repository/hotel.repository';
import { LoggerModule } from 'src/infrastructures/logger/logger.module';
import { UserModule } from '../user/user.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            HotelEntity,
        ]),
        LoggerModule,
        UserModule,
    ],

    controllers: [
        HotelController,
    ],

    providers: [
        HotelService,
        {
            provide: HOTEL_REPOSITORY,
            useClass: HotelRepository,
        },
    ],

    exports: [HotelService],
})
export class HotelModule {}