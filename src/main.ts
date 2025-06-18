import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';
import knex from 'knex';
import { join } from 'path';
import * as fs from 'fs';
import { HttpExceptionFilter } from './middleware/http-exception.filter';

async function bootstrap() {
  // Run Knex migrations before starting the app
  const environment = process.env.NODE_ENV || 'development';

  // Find knexfile.js from the current working directory
  const knexfilePath = join(process.cwd(), 'knexfile.js');

  if (!fs.existsSync(knexfilePath)) {
    console.error(`Knexfile not found at ${knexfilePath}`);
    process.exit(1);
  }

  // Import knexfile as ES module
  const knexModule = await import(knexfilePath);
  const knexConfig = knexModule.default;
  const knexInstance = knex(knexConfig[environment]);

  // TODO: Uncomment this when we want to run migrations and seeds
  // try {
  //   console.log('Running Knex migrations...');
  //   await knexInstance.migrate.latest();
  //   console.log('Migrations completed successfully');

  //   // Run Knex seeds after migrations
  //   console.log('Running Knex seeds...');
  //   await knexInstance.seed.run();
  //   console.log('Seeds completed successfully');
  // } catch (error) {
  //   console.error('Error running migrations or seeds:', error);
  //   // Don't exit - we can still start the app even if migrations or seeds fail
  // }

  const app = await NestFactory.create(AppModule);

  // Get the logger instance
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Get config service
  const configService = app.get(ConfigService);

  // Set global prefix and versioning
  app.setGlobalPrefix('api');
  app.enableVersioning({
    type: VersioningType.URI,
    prefix: 'v',
    defaultVersion: '1',
  });

  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Setup Swagger documentation
  setupSwagger(app);

  // Configure CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Graceful shutdown
  app.enableShutdownHooks();
  const shutdownSignals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
  shutdownSignals.forEach((signal) => {
    process.on(signal, async () => {
      logger.log(`Received ${signal} signal, shutting down gracefully`);

      // Close Knex connection pools
      await knexInstance.destroy();

      await app.close();
      process.exit(0);
    });
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`Application is running on: ${await app.getUrl()}`);
  logger.log(
    `API documentation is available at: ${await app.getUrl()}/documentation`,
  );
}
bootstrap();
