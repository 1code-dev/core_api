import { Test, TestingModule } from '@nestjs/testing';
import { TracksService } from './tracks.service';
import { errorMessages } from './../config/messages.config';
import { supabaseClient } from './../core/db/supabase.db';

describe('TracksService', () => {
  let service: TracksService;

  // User's UID for Test User 1 who is already created in the DB
  const USER_UID = 'a1212c12-1a82-4f14-8dd0-4cbe04c47d4b';

  // Track ID for `C++` track
  const TRACK_ID = '1f39a810-9156-4f30-88cf-743dfe4dc20a';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TracksService],
    }).compile();

    service = module.get<TracksService>(TracksService);
  });

  afterAll(async () => {
    // delete created records by the tests to avoid future ambiguity
    await supabaseClient
      .from('UserTracks')
      .delete()
      .eq('uid', USER_UID)
      .eq('trackId', TRACK_ID);
  });

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

    // Validate if tags are being fetched properly
    expect(tracks[0].tags.length).toBeGreaterThan(0);
  });

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
});
