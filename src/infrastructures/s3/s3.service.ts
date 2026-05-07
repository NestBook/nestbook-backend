import {
    Inject,
    Injectable,
    OnModuleDestroy,
    OnModuleInit,
} from '@nestjs/common';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { Readable } from 'stream';
import { ConfigService } from '@nestjs/config';
import { S3_CLIENT } from './s3.constans';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class S3Service implements OnModuleInit, OnModuleDestroy {
    private client: S3Client;
    private bucket: string;
    private readonly context = S3Service.name;

    constructor(
        @Inject(S3_CLIENT) private readonly s3Client: S3Client,
        private readonly configService: ConfigService,
        private readonly logger: LoggerService,
    ) { }

    onModuleInit() {
        this.client = this.s3Client;
        this.bucket = this.configService.get<string>('s3.bucket')!;
        this.logger.info('S3 (MinIO) initialized', this.context);
    }

    onModuleDestroy() {
        this.logger.info('S3 service destroyed (no real disconnect needed)', this.context);
    }

    async uploadFile(file: Express.Multer.File, key: string) {
        await this.client.send(
            new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return {
            key,
            url: `${this.bucket}/${key}`,
        };
    }

    async getFile(key: string) {
        const res = await this.client.send(
            new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );

        return res.Body as Readable;
    }

    async deleteFile(key: string) {
        return await this.client.send(
            new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            }),
        );
    }
}
