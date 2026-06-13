import { IsString } from 'class-validator';

export class AssignHotelOwnerDto {
    @IsString()
    ownerId!: string;
}