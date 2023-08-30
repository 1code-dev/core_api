import * as request from 'supertest';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { supabaseClient } from './../src/core/db/supabase.db';
import {
  connectRedisClient,
  disconnectRedisClient,
} from './../src/core/db/redis.db';

import {
  errorMessages,
  responseMessages,
} from './../src/config/messages.config';

describe('TracksController (e2e)', () => {
  let app: INestApplication;

  /// User's UID for Test User 2 who is already created in the DB
  const USER_UID = '2945ffff-6ef1-4539-bedf-fd27c8f1df2c';

  // Track ID for `C++` track
  const TRACK_ID = '1f39a810-9156-4f30-88cf-743dfe4dc20a';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    connectRedisClient();

    await app.init();
  });

  afterAll(async () => {
    disconnectRedisClient();

    // delete created records by the tests to avoid future ambiguity
    await supabaseClient
      .from('UserTracks')
      .delete()
      .eq('uid', USER_UID)
      .eq('trackId', TRACK_ID);
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
    expect(response.body.data[0]).toHaveProperty('noOfExercises');
  });

  // // Should join track for user properly
  // it('/tracks/join (POST)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .post('/tracks/join')
  //     .send({
  //       uid: USER_UID,
  //       trackId: TRACK_ID,
  //     });

  //   expect(response.status).toEqual(201);

  //   expect(response.body).toMatchObject({
  //     data: true,
  //     message: responseMessages.joined_track,
  //     status: 201,
  //   });
  // });

  // // Should throw 422 error if user has already joined the track
  // it('/tracks/join (POST)', async () => {
  //   const response = await request(app.getHttpServer())
  //     .post('/tracks/join')
  //     .send({
  //       uid: USER_UID,
  //       trackId: TRACK_ID,
  //     });

  //   expect(response.status).toEqual(422);

  //   expect(response.body).toMatchObject({
  //     data: null,
  //     message: errorMessages.track_already_joined,
  //     status: 422,
  //   });
  // });

  // Should fetch users joined track data w/ progress
  it('/tracks/joined (GET)', async () => {
    const response = await request(app.getHttpServer()).get(
      `/tracks/joined?uuid=${USER_UID}`,
    );

    // validate response status
    expect(response.status).toEqual(200);

    // validate response format
    expect(response.body).toMatchObject({
      status: 200,
    });

    // validate data response
    expect(response.body).toHaveProperty('data');

    // validate response format
    if (response.body.data) {
      expect(response.body.data[0]).toHaveProperty('progress');
      expect(response.body.data[0]).toHaveProperty('logo');
      expect(response.body.data[0]).toHaveProperty('name');
    }
  });
});
