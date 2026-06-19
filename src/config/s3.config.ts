import { registerAs } from "@nestjs/config";

export default registerAs('s3', () => ({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    accessKey: process.env.S3_ACCESS_KEY,
    secretKey: process.env.S3_SECRET_KEY,
    bucket: process.env.S3_BUCKET,
}))
