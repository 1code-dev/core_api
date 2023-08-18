import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { redisClient } from './core/db/redis.db';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    await redisClient.set('user', '1code');

    const user = (await redisClient.get('user')) ?? '';

    return {
      user,
    };
  }
}
