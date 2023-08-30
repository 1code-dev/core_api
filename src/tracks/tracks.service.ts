import { TAvailableTrack } from './../types/track';
import { redisClient } from './../core/db/redis.db';
import { supabaseClient } from './../core/db/supabase.db';
import { errorMessages } from './../config/messages.config';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { createHttpError, isEmptyArray } from './../core/utils/utils.core';

@Injectable()
export class TracksService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(TracksService.name);
  }

  /**
   * Fetches all the available tracks in 1Code
   *
   * @cached for 1 day `(86400 secs)`
   *
   * 👉 NOTE: To be on the safer side, fetch record limit is set to `10`
   *
   * @returns {TAvailableTrack[]} all the available track
   *
   * @throws 409 error if any db error occurs
   */
  async fetchAllAvailableTracks(): Promise<Array<TAvailableTrack>> {
    const REDIS_KEY = 'allAvailableTracks';

    // read cache data
    const cachedData = await redisClient.get(REDIS_KEY);

    // If cache is available and in valid format, return it
    if (cachedData && JSON.parse(cachedData)) {
      return JSON.parse(cachedData);
    }

    // Fetch all the available tracks from `Tracks` table
    // 👉 NOTE: To avoid any ambiguous errors fetch limit is set to 10 records
    const { data, error } = await supabaseClient
      .from('Tracks')
      .select('*')
      .limit(10);

    // ⚠️ ALERT: First check if error is null, in case error is not null `data` can also be null,
    //    hence the code will throw error
    if (error || isEmptyArray(data)) {
      this.logger.error(`Unable to fetch all available tracks`);

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.internal_server_error,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    this.logger.log(`Fetched all the available ${data.length} tracks`);

    await redisClient.set(REDIS_KEY, JSON.stringify(data));
    await redisClient.expire(REDIS_KEY, 86400); // cache will expire after 1 day

    return data as TAvailableTrack[];
  }

  /**
   * Joins a track for user
   *
   * ⚠️ ALERT: Cache is invalidated for fetching users joined tracks
   *    to update users joined tracks record
   *
   * @param {string} userId of user to join exercise for
   * @param {string} trackId of track to join in for user
   *
   * @returns {boolean} true indicating user has joined the track successfully
   *
   * @throws 409 http error if any db error occurs
   * @throws 422 http error if user has already joined the track
   */
  async joinTrackForUser(userId: string, trackId: string): Promise<Boolean> {
    // create a record in `UserTracks` w/ users uid and tracks id
    const { error } = await supabaseClient.from('UserTracks').insert([
      {
        uid: userId,
        trackId: trackId,
      },
    ]);

    if (error) {
      // if track is already joined by user
      if (error?.code === '23505') {
        this.logger.error(
          `User has already joined track w/ id ${trackId} for user w/ ${userId} uid`,
        );

        throw createHttpError({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessages.track_already_joined,
          hint: error?.hint ?? error?.code,
          stacktrace: error?.details,
        });
      }

      this.logger.error(
        `Unable to join track w/ id ${trackId} for user w/ ${userId} uid`,
      );

      // throw 409 error if supabase error is not null
      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_join_track,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // ⚠️ ALERT: Need to invalidate the cache, if not done, users joined exercises
    //    will not be update for 1 day in a worst case scenario

    // invalidate cache to fetch users joined tracks
    await redisClient.del('joinedTracks' + '_' + userId);

    // indicates user has joined the track successfully!
    return true;
  }

  /**
   * Fetch users joined tracks infos
   *
   * @cache for 1 Day `(86400 secs)`
   *
   * @param {string} userId associated with users profile
   *
   * @returns array of tracks data joined by user
   *
   * @throws 409 exception if any db error occurs
   */
  async fetchUsersJoinedTracks(userId: string) {
    const REDIS_KEY = 'joinedTracks' + '_' + userId;

    // read the cache
    const cachedData = await redisClient.get(REDIS_KEY);

    // If cache is available and in valid format, return it
    if (cachedData && JSON.parse(cachedData)) {
      return JSON.parse(cachedData);
    }

    // fetch users joined tracks info
    const { data, error } = await supabaseClient
      .from('UserTracks')
      .select(
        `trackId,
        Tracks (
        name,
        logo
      )`,
      )
      .eq('uid', userId);

    if (error) {
      this.logger.error(
        `Unable to fetch joined tracks for user w/ uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user_track,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // cache the response for 1 day

    await redisClient.set(REDIS_KEY, JSON.stringify(data));
    await redisClient.expire(REDIS_KEY, 86400); // cache will expire after 1 day

    return data;
  }

  /**
   * Calculate total exercises in a track
   *
   * @cached for 1 Day `(86400 secs)`
   *
   * @param {string} trackId of the track
   *
   * @returns {number} number of exercises in a track
   *
   * @throws 409 exception if any db error has occurred
   */
  async calculateTotalExercisesInTrack(trackId: string): Promise<number> {
    const REDIS_KEY = 'totalExercises' + '_' + trackId;

    // read cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // if cached data is available and valid, return it
    if (cachedData && parseInt(cachedData)) {
      return parseInt(cachedData);
    }

    const { count, error } = await supabaseClient
      .from(`Exercises`)
      .select(`id`, { count: 'exact' })
      .eq('trackId', trackId);

    if (error) {
      this.logger.error(
        `Unable to count exercises in a track w/ id ${trackId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: '',
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // Cache the response for 1 Day

    await redisClient.set(REDIS_KEY, count ?? 0);
    await redisClient.expire(REDIS_KEY, 86400); // cache will expire after 1 day

    return count ?? 0;
  }

  /**
   * Calculate completed track percentage for a user in a track
   *
   * @cached for 10 Hrs `(36000 secs)`
   *
   * @param {string} userId associated w/ users profile
   * @param {string} trackId of the track
   * @param {number} totalExercises number in a track
   *
   * @returns {number} percentage of completion (0-100)
   *
   * @throws 409 exception if any db error has occurred
   */
  async calculateUsersTrackProgress(
    userId: string,
    trackId: string,
    totalExercises: number,
  ): Promise<number> {
    const REDIS_KEY = 'completedExercises' + '_' + userId;

    // read cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // if cached data is available and valid, return it
    if (cachedData && parseFloat(cachedData)) {
      return parseFloat(cachedData);
    }

    const { count: completedCount, error } = await supabaseClient
      .from('UserExercises')
      .select(`exerciseId`, { count: 'exact' })
      .eq(`uid`, userId)
      .eq(`trackId`, trackId)
      .eq('isCompleted', true);

    if (error) {
      this.logger.error(
        `Unable to count users completed exercises in track ${trackId} w/ user uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: '',
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    const completedPercent = (completedCount / totalExercises) * 100;

    // Cache the response for 10 Hrs

    await redisClient.set(REDIS_KEY, completedPercent);
    await redisClient.expire(REDIS_KEY, 36000); // cache will expire after 10 Hrs

    return completedPercent;
  }
}
