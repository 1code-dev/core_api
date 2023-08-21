import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { errorMessages } from './../config/messages.config';
import { supabaseClient } from './../core/db/supabase.db';
import { createHttpError, isEmptyArray } from './../core/utils/utils.core';
import { TAllExercises } from './types/track_exercises.type.exercises';

@Injectable()
export class ExercisesService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(ExercisesService.name);
  }

  /**
   *
   * @param {String} trackId of track to fetch exercises of
   * @returns {Array<TAllExercises>} all available exercises in a track
   *
   * @throws 422 error if db error occurs
   */
  async getAllExercisesInTrack(trackId: string): Promise<TAllExercises[]> {
    const { data, error } = await supabaseClient
      .from('Exercises')
      .select(`id, name, level, maxPoints`)
      .eq('trackId', trackId);

    // ⚠️ ALERT: First check if error is null, in case error is not null `data` can also be null,
    //    hence the code will throw error
    if (error || isEmptyArray(data)) {
      this.logger.error(
        `Unable to fetch exercises from track w/ id ${trackId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_exercises,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    this.logger.log(`Fetched all the available (${data.length}) exercises`);

    return data as TAllExercises[];
  }
}
