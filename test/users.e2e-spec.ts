import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { supabaseClient } from './../src/core/db/supabase.db';

import {
  errorMessages,
  responseMessages,
} from './../src/config/messages.config';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const USER_UID = '3d1f0c06-4d4d-4e9e-a6f7-ef6e0e7a9b11';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await supabaseClient.from('Users').delete().eq('uid', USER_UID);
  });

  // Should create users profile properly
  it('/users (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      uid: USER_UID,
    });

    expect(response.status).toEqual(201);

    expect(response.body).toMatchObject({
      data: {
        longestStreak: 0,
        streak: 0,
        totalPoints: 0,
      },
      message: responseMessages.created_user,
      status: 201,
    });

    expect(response.body.data).toHaveProperty('globalRank');
    expect(response.body.data).toHaveProperty('weeklyRank');
  });

  // Should return 422 if user already exists
  it('/users (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      uid: USER_UID,
    });

    expect(response.status).toEqual(422);

    expect(response.body).toMatchObject({
      data: null,
      message: errorMessages.user_already_created,
      status: 422,
    });
  });
});
