import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { setupSwagger } from './config/swagger.config';
import { runMigrationsAndSeedsWithTransaction } from './database/migration-utils';
import { HttpExceptionFilter } from './middleware/http-exception.filter';

async function bootstrap() {
  // TODO: Uncomment this when we want to run migrations and seeds
  try {
    console.log('Running database migrations and seeds...');
    await runMigrationsAndSeedsWithTransaction();
  } catch (error) {
    console.error('Error running migrations or seeds:', error);
    // Don't exit - we can still start the app even if migrations or seeds fail
  }

  const app = await NestFactory.create(AppModule);

  // Get the logger instance
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useLogger(logger);

  // Apply global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Get config service
  const configService = app.get(ConfigService);

  // Custom middleware to handle /service prefix
  app.use((req, res, next) => {
    const originalUrl = req.url;
    if (req.url.startsWith('/service/')) {
      // Remove /service prefix completely
      req.url = req.url.replace('/service/', '/');
      console.log(`[Middleware] URL transformed: ${originalUrl} → ${req.url}`);
    }
    next();
  });

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
      await app.close();
      process.exit(0);
    });
  });

  const port = configService.get('PORT', 3000);
  const wsPort = configService.get('WS_PORT', 8080);

  await app.listen(port);
  logger.log(`🚀 Application is running on: ${await app.getUrl()}`);
  logger.log(
    `📚 API documentation is available at: ${await app.getUrl()}/documentation`,
  );
  logger.log(`🔗 WebSocket Server will start on port: ${wsPort}`);
  logger.log(`📡 Frontend WebSocket URL: ws://localhost:${wsPort}`);
}
bootstrap();
