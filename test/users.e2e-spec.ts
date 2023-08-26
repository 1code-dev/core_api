import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

import {
  errorMessages,
  responseMessages,
} from './../src/config/messages.config';

import {
  connectRedisClient,
  disconnectRedisClient,
} from './../src/core/db/redis.db';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  const USER_UID = '2d1f0c06-4d4d-4e9e-a6f7-ef6e0e7a9b12';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    connectRedisClient();

    await app.init();
  });

  afterAll(() => {
    disconnectRedisClient();
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

  // Should throw 422 if user already exists
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

  // Should throw 409 if db error occurs while creating the user
  it('/users (POST)', async () => {
    const response = await request(app.getHttpServer()).post('/users').send({
      uid: 'non-existent-UID',
    });

    expect(response.status).toEqual(409);

    expect(response.body).toMatchObject({
      data: null,
      message: errorMessages.unable_to_create_user,
      status: 409,
    });
  });

  // Should fetch users profile properly
  it('/users (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users?uid=${USER_UID}`,
    );

    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      data: {
        longestStreak: 0,
        streak: 0,
        totalPoints: 0,
      },
      message: responseMessages.fetched_user,
      status: 200,
    });

    expect(response.body.data).toHaveProperty('globalRank');
    expect(response.body.data).toHaveProperty('weeklyRank');
  });

  // Should throw 409 if db error occurs while fetching users profile
  it('/users (GET)', async () => {
    const TEMP_UID = 'non-existant-uid';

    const response = await request(app.getHttpServer()).get(
      `/users?uid=${TEMP_UID}`,
    );

    expect(response.status).toEqual(409);

    expect(response.body).toMatchObject({
      data: null,
      message: errorMessages.unable_to_fetch_user,
      status: 409,
    });
  });

  // Should throw 404 if user already does not exists
  it('/users (GET)', async () => {
    const TEMP_UID = 'non-existant-uid';

    const response = await request(app.getHttpServer()).get(
      `/users?uid=1d1f1c01-1d1d-1e1e-a1f1-ef1e1e1a1b11`,
    );

    expect(response.status).toEqual(404);

    expect(response.body).toMatchObject({
      data: null,
      message: errorMessages.user_profile_not_found,
      status: 404,
    });
  });

  // Should fetch users stats properly
  it('/users/stats (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/stats?uid=${USER_UID}`,
    );

    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      message: responseMessages.fetched_stats,
      status: 200,
    });

    expect(response.body.data).toHaveProperty('exercisesSolved');
    expect(response.body.data).toHaveProperty('createdAt');
  });

  // Should fetch users activity properly
  it('/users/activity (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/users/activity?uid=${USER_UID}`,
    );

    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      message: responseMessages.fetched_activity,
      status: 200,
    });
  });

  // Should throw 409 if any db error occurs while deleting the user
  it('/users (DELETE)', async () => {
    const TEMP_UID = 'non-existant-uid';

    const response = await request(app.getHttpServer()).delete(
      `/users?uid=${TEMP_UID}`,
    );

    expect(response.status).toEqual(409);

    expect(response.body).toMatchObject({
      data: null,
      message: errorMessages.unable_to_delete_user,
      status: 409,
    });
  });

  // Should delete users profile properly
  it('/users (DELETE)', async () => {
    const response = await request(app.getHttpServer()).delete(
      `/users?uid=${USER_UID}`,
    );

    expect(response.status).toEqual(200);

    expect(response.body).toMatchObject({
      data: true,
      message: responseMessages.deleted_user,
      status: 200,
    });
  });
});
