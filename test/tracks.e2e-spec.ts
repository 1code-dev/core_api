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

  /// User's UID for Test User 2 who is already created in the DB
  const USER_UID = 'a2212c12-1a82-4f14-8dd0-4cbe04c47d4b';

  // Track ID for `Pythons` track
  const TRACK_ID = 'a13e9c3d-e7cf-477f-b862-0a1ee0e18d10';

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
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
  });

  // Should join track for user properly
  it('/users (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/tracks/join')
      .send({
        uid: USER_UID,
        trackId: TRACK_ID,
      });

    expect(response.status).toEqual(201);

    expect(response.body).toMatchObject({
      data: true,
      message: responseMessages.joined_track,
      status: 201,
    });
  });

  // Should throw 422 error if user has already joined the track
  it('/users (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/tracks/join')
      .send({
        uid: USER_UID,
        trackId: TRACK_ID,
      });

    expect(response.status).toEqual(422);

    expect(response.body).toMatchObject({
      data: null,
      message: errorMessages.track_already_joined,
      status: 422,
    });
  });
});
