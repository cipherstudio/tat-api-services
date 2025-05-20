import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import redisConfig from '../../config/redis.config';
import { RedisCacheService } from './redis-cache.service';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule.forFeature(redisConfig)],
      useFactory: async (configService: ConfigService) => {
        const redisConf = configService.get('redis');
        return {
          store: redisStore,
          host: redisConf.host,
          port: redisConf.port,
          ttl: redisConf.ttl,
          password: redisConf.password,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [RedisCacheService],
  exports: [CacheModule, RedisCacheService],
})
export class RedisCacheModule {}
