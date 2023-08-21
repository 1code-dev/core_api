import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { responseMessages } from './../src/config/messages.config';
import * as request from 'supertest';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Should fetch all the available tracks properly
  it('/tracks (GET)', async () => {
    const response = await request(app.getHttpServer()).get(`/tracks`);

    // validate response status
    expect(response.status).toEqual(200);

    // validate response format
    expect(response.body).toMatchObject({
      message: responseMessages.fetched_track,
      status: 200,
    });

    // validate data response
    expect(response.body).toHaveProperty('data');
    expect(response.body.data.length).toBeGreaterThan(0);

    // validate response format
    expect(response.body.data[0]).toHaveProperty('id');
    expect(response.body.data[0]).toHaveProperty('logo');
    expect(response.body.data[0]).toHaveProperty('name');
    expect(response.body.data[0]).toHaveProperty('tags');
  });
});
