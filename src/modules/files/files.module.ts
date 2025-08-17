import { Module } from '@nestjs/common';
    import { FilesService } from './files.service';
    import { FilesController } from './files.controller';
    import { FilesRepository } from './repositories/files.repository';
    import { RedisCacheModule } from '../cache/redis-cache.module';
    import { RedisCacheService } from '../cache/redis-cache.service';

    @Module({
      imports: [
        RedisCacheModule,
      ],
      controllers: [FilesController],
      providers: [FilesService, FilesRepository, RedisCacheService],
      exports: [FilesService, FilesRepository],
    })
    export class FilesModule {}
