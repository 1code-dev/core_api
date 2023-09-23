import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './core/filters/exception.filter';
import { connectRedisClient } from './core/db/redis.db';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // `Swagger` docs config
  const config = new DocumentBuilder()
    .setTitle('1Code Core API')
    .setDescription("All the core API's for 1Code")
    .setVersion('0.1+1')
    .addBearerAuth()
    .build();

  // Only create swagger module in dev and pre_prod environments
  if (process.env.NODE_ENV === 'dev') {
    // create a document
    const document = SwaggerModule.createDocument(app, config);

    // setup a module
    SwaggerModule.setup('docs', app, document);
  }

  // Global pipes
  app.useGlobalPipes(new ValidationPipe());

  // Global filter to filter http error responses
  app.useGlobalFilters(new ExceptionFilter());

  // Establish connection w/ db
  connectRedisClient();

  await app.listen(process.env.PORT || 1112);
}

bootstrap();
