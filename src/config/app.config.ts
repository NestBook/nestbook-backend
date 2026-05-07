import { registerAs } from "@nestjs/config";

export default registerAs('app', () => ({
    port: parseInt(process.env.APP_PORT || '1201'),
    environment: process.env.APP_ENV || 'development',
    prefix: process.env.APP_PREFIX || 'api/v1',
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
    }
}))

