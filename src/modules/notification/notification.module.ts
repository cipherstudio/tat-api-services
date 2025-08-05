import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationRepository } from './repositories/notification.repository';
import { RedisCacheModule } from '../cache/redis-cache.module';
import { RedisCacheService } from '../cache/redis-cache.service';
import { WebSocketUtil } from '../../common/utils/websocket.util';

@Module({
  imports: [RedisCacheModule],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationRepository,
    RedisCacheService,
    {
      provide: WebSocketUtil,
      useFactory: () => {
        // WebSocket port should be configured via environment variable
        const wsPort = process.env.WS_PORT
          ? parseInt(process.env.WS_PORT)
          : 8080;
        
        console.log(`🚀 WebSocket Server starting on port: ${wsPort}`);
        console.log(`🔗 WebSocket URL: ws://localhost:${wsPort}`);
        console.log(`📡 Frontend should connect to: ${process.env.NEXT_PUBLIC_WS_URL || `ws://localhost:${wsPort}`}`);
        
        return new WebSocketUtil(wsPort);
      },
    },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
