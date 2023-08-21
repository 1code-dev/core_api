import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';

import { responseMessages } from './../src/config/messages.config';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  // Track ID for `C++` track
  const TRACK_ID = '1f39a810-9156-4f30-88cf-743dfe4dc20a';

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
});
