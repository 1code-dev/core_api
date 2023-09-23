import { Test, TestingModule } from '@nestjs/testing';
import { TracksService } from './tracks.service';
import { errorMessages } from './../config/messages.config';
import { supabaseClient } from './../core/db/supabase.db';

import {
  connectRedisClient,
  disconnectRedisClient,
} from './../core/db/redis.db';

describe('TracksService', () => {
  let service: TracksService;

  /**
   * ( 1auth_user2 ) Already created w/ 1auth
   *
   * ⚠️ Should be same as UID in 1auth DB
   */
  const USER_UID = '1188f845-def3-4d7f-af98-b2248ca6750f';

  // Track ID for `C++` track
  const TRACK_ID = '1f39a810-9156-4f30-88cf-743dfe4dc20a';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TracksService],
    }).compile();

    service = module.get<TracksService>(TracksService);

    connectRedisClient();
  });

  afterAll(async () => {
    // delete created records by the tests to avoid future ambiguity
    await supabaseClient
      .from('UserTracks')
      .delete()
      .eq('uid', USER_UID)
      .eq('trackId', TRACK_ID);

    disconnectRedisClient();
  });

  // Fetch available tracks 🚄

  // Check if `fetchAllAvailableTracks` function returning track list properly
  it('should return a valid list of available tracks', async () => {
    const tracks = await service.fetchAllAvailableTracks();

    // except length to be greater then 0
    expect(tracks.length).toBeGreaterThan(0);

    // validate format of the response
    expect(tracks[0].id).not.toBeNull();
    expect(tracks[0].logo).not.toBeNull();
    expect(tracks[0].name).not.toBeNull();
    expect(tracks[0].tags).not.toBeNull();
    expect(tracks[0].noOfExercises).not.toBeNull();

    // Validate if tags are being fetched properly
    expect(tracks[0].tags.length).toBeGreaterThan(0);
  });

  // Join track for user 🛤️

  // Check if user is joining the track properly
  it('should join the track properly', async () => {
    const isJoined = await service.joinTrackForUser(USER_UID, TRACK_ID);

    expect(isJoined).toEqual(true);
  });

  // Should throw error if user has already joined the track
  it('should throw 422 error if user has already joined thr track', async () => {
    try {
      await service.joinTrackForUser(USER_UID, TRACK_ID);

      // if error is not thrown then test should automatically fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.getStatus()).toBe(422);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.track_already_joined,
        status: 422,
      });
    }
  });

  // Should throw 409 db error on invalid inputs
  it('should throw 409 db error on invalid input', async () => {
    try {
      // wrong formatted UUID inputs are passed
      await service.joinTrackForUser('USER_UID', 'TRACK_ID');

      // if error is not thrown then test should automatically fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_join_track,
        status: 409,
      });
    }
  });

  // Fetch users joined tracks 🚃

  // Check if `fetchUsersJoinedTracks` function returning track data properly
  it('should return a valid list of users joined tracks', async () => {
    const tracks = await service.fetchUsersJoinedTracks(USER_UID);

    // except length to be greater then 0
    expect(tracks.length).toBeGreaterThan(0);

    // validate format of the response
    expect(tracks[0].id).not.toBeNull();
    expect(tracks[0].logo).not.toBeNull();
    expect(tracks[0].name).not.toBeNull();
  });

  // Calculate total exercises 🧮

  // Check if exercises count in a track is fetched properly
  it('should return a valid count of available exercises in a track', async () => {
    const exercises = await service.calculateTotalExercisesInTrack(TRACK_ID);

    // except length to be greater then 0
    expect(exercises).toBeGreaterThan(0);
  });

  // Calculate users progress

  // Check if exercises count in a track is fetched properly
  it('should return a valid count of available exercises in a track', async () => {
    const progress = await service.calculateUsersTrackProgress(
      USER_UID,
      TRACK_ID,
      2, // placeholder value for no. of exercises
    );

    // except to receive valid progress
    expect(typeof progress).toEqual('number');
  });
});
