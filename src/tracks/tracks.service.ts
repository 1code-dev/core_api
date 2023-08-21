import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { supabaseClient } from './../core/db/supabase.db';
import { TAvailableTrack } from './../types/track';
import { createHttpError, isEmptyArray } from './../core/utils/utils.core';
import { errorMessages } from './../config/messages.config';

@Injectable()
export class TracksService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(TracksService.name);
  }

  /**
   * Fetches all the available tracks in 1Code
   *
   * 👉 NOTE: To be on the safer side, fetch record limit is set to `10`
   *
   * @returns {TAvailableTrack[]} all the available track
   *
   * @throws 409 error if any db error occurs
   */
  async fetchAllAvailableTracks(): Promise<Array<TAvailableTrack>> {
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

    return data as TAvailableTrack[];
  }

  /**
   *
   * @param {string} uid of user to join exercise for
   * @param {string} trackId of track to join in for user
   *
   * @returns {boolean} true indicating user has joined the track successfully
   *
   * @throws 409 http error if any db error occurs
   * @throws 422 http error if user has already joined the track
   */
  async joinTrack(uid: string, trackId: string): Promise<Boolean> {
    // create a record in `UserTracks` w/ users uid and tracks id
    const { error } = await supabaseClient.from('UserTracks').insert([
      {
        uid: uid,
        trackId: trackId,
      },
    ]);

    if (error) {
      // if track is already joined by user
      if (error?.code === '23505') {
        this.logger.error(
          `User has already joined track w/ id ${trackId} for user w/ ${uid} uid`,
        );

        throw createHttpError({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessages.track_already_joined,
          hint: error?.hint ?? error?.code,
          stacktrace: error?.details,
        });
      }

      this.logger.error(
        `Unable to join track w/ id ${trackId} for user w/ ${uid} uid`,
      );

      // throw 409 error if supabase error is not null
      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_join_track,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    // indicates user has joined the track successfully!
    return true;
  }
}
