import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { errorMessages } from './../config/messages.config';
import { supabaseClient } from './../core/db/supabase.db';
import { createHttpError, isEmptyArray } from './../core/utils/utils.core';
import { TAllExercises } from './types/track_exercises.type.exercises';
import { TExerciseDetails } from 'src/types/exercise.type';

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

  /**
   * Fetch exercise details by exercise id
   *
   * @param {string} exerciseId of exercise to fetch details for
   * @returns {TExerciseDetails} exercise details of provided exercise w/ provided id
   *
   * @throws 422 error if db error occurs
   * @throws 404 error if there is no exercise w/ provided exercise id
   */
  async getExerciseDetails(exerciseId: string): Promise<TExerciseDetails> {
    const { data, error } = await supabaseClient
      .from('Exercises')
      .select(`id, name, maxPoints, minPoints, instructions, baseCode`)
      .eq('id', exerciseId);

    // if data is empty, i.e. exercise not found
    if (!data || isEmptyArray(data)) {
      this.logger.error(`Exercise not found w/ id ${exerciseId}`);

      throw createHttpError({
        status: HttpStatus.NOT_FOUND,
        message: errorMessages.exercise_not_found,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // Check if any db error occurs
    if (error) {
      this.logger.error(
        `Unable to fetch details of exercise w/ id ${exerciseId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_exercise_details,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    this.logger.log(`Fetched details of exercise w/ id ${exerciseId}`);

    return data[0] as TExerciseDetails;
  }
}
