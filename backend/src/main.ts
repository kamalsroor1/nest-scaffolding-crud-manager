import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { AppModule } from './app.module';

/**
 * Bootstraps the NestJS application with all global configurations.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for all API endpoints
  app.setGlobalPrefix('api/v1');

  // Use Winston logger for Nest system logs
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  // Global validation pipe with strict transformation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Documentation configuration
  const config = new DocumentBuilder()
    .setTitle('NestJS Scaffolding Dashboard API')
    .setDescription('The foundation API for the NestJS Scaffolding project')
    .setVersion('1.0')
    .addTag('Health')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}/api/v1`);
  console.log(`Swagger documentation is available at: http://localhost:${port}/api/docs`);
}
bootstrap();
