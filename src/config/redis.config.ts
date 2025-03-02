import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  ttl: parseInt(process.env.REDIS_CACHE_TTL, 10) || 60, // Default TTL in seconds
  password: process.env.REDIS_PASSWORD,
}));
