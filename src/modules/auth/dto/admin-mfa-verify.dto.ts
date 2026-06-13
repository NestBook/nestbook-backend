import { IsString, Length, MaxLength } from 'class-validator';

export class AdminMfaVerifyDto {
    @IsString()
    @MaxLength(1000)
    mfaToken: string;

    @IsString()
    @Length(6, 6)
    code: string;
}