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
}
