import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

import {
  errorMessages,
  responseMessages,
} from './../src/config/messages.config';

describe('ExercisesController (e2e)', () => {
  let app: INestApplication;

  // User's UID for Test User 1 who is already created in the DB
  const USER_UID = 'a1212c12-1a82-4f14-8dd0-4cbe04c47d4b';

  // Track ID for `C++` track
  const TRACK_ID = '1f39a810-9156-4f30-88cf-743dfe4dc20a';

  // Exercise ID of `Hello, World!` exercise in python track
  const EXERCISE_ID = '85b3f3ec-e5e8-4bd7-b035-0ab1990cd75c';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Should fetch all the available tracks properly
  it('/exercises (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/exercises?id=${TRACK_ID}`,
    );

    // validate response status
    expect(response.status).toEqual(200);

    // validate response format
    expect(response.body).toMatchObject({
      message: responseMessages.fetched_exercises,
      status: 200,
    });

    // validate data response
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBeGreaterThan(0);

    // validate response format
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('level');
    expect(response.body.data[0]).toHaveProperty('name');
    expect(response.body.data[0]).toHaveProperty('maxPoints');
  });

  // Should fetch all the available tracks properly
  it('/exercises/details (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/exercises/details?id=${EXERCISE_ID}`,
    );

    // validate response status
    expect(response.status).toEqual(200);

    // validate response format
    expect(response.body).toMatchObject({
      message: responseMessages.fetched_exercise_details,
      status: 200,
    });

    // validate data response
    expect(response.body).toHaveProperty('data');

    // validate response format
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data).toHaveProperty('name');
    expect(response.body.data).toHaveProperty('maxPoints');
    expect(response.body.data).toHaveProperty('minPoints');
    expect(response.body.data).toHaveProperty('instructions');
    expect(response.body.data).toHaveProperty('baseCode');
  });

  // Should throw 404 exception if exercise does not exists
  it('/exercises/details (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/exercises/details?id=EXERCISE_ID`,
    );

    // validate response status
    expect(response.status).toEqual(404);

    // validate response format
    expect(response.body).toMatchObject({
      message: errorMessages.exercise_not_found,
      status: 404,
    });
  });

  // Should run exercise test properly
  it('/exercises/test (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post(`/exercises/test`)
      .send({
        exerciseId: EXERCISE_ID,
        userUid: USER_UID,
        userCode:
          'IAojaW5jbHVkZSA8aW9zdHJlYW0+CgppbnQgbWFpbigpIHsKICAgIHN0ZDo6Y291dCA8PCAiSGVsbG8sIHdvcmxkISIgPDwgc3RkOjplbmRsOwogICAgcmV0dXJuIDA7Cn0K',
      });

    // validate response status
    expect(response.status).toEqual(201);

    // validate response format
    expect(response.body).toMatchObject({
      message: responseMessages.test_executed_successfully,
      status: 201,
    });

    expect(response.body.data).not.toBeNull();
  });

  // Should fetch all the completed exercises by the user in a track
  it('/exercises/completed (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/exercises/completed?uuid=${USER_UID}&trackId=${TRACK_ID}`,
    );

    // validate response status
    expect(response.status).toEqual(200);

    // validate response format
    expect(response.body).toMatchObject({
      message: responseMessages.fetched_completed_exercises,
      status: 200,
    });

    // validate data response
    expect(response.body).toHaveProperty('data');

    // validate response format
    expect(response.body.data.length).toBeGreaterThanOrEqual(0);
  });
});
