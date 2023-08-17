import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { createHttpError } from './core/helpers.core';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    try {
      throw new Error('OLD Fuck!');
    } catch (error) {
      throw createHttpError({
        message: 'LOL!',
        status: 200,
        stacktrace: 'Another LOL!',
        hint: 'Avoid LOL!',
      });
    }
  }
}
