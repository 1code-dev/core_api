import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExceptionFilter } from './core/filters/exception.filter';
import { connectRedisClient } from './core/db/redis.db';
import { createSupabaseClient } from './core/db/supabase.db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Establish connection w/ db
  connectRedisClient();
  createSupabaseClient();

  // Global filter to filter http error responses
  app.useGlobalFilters(new ExceptionFilter());

  await app.listen(process.env.PORT || 1112);
}

bootstrap();
