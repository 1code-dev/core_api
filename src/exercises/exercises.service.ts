import axios, { AxiosError } from 'axios';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { errorMessages } from './../config/messages.config';
import { supabaseClient } from './../core/db/supabase.db';
import { createHttpError, isEmptyArray } from './../core/utils/utils.core';
import { TAllExercises } from './types/track_exercises.type.exercises';
import { TExerciseDetails } from './../types/exercise.type';
import { redisClient } from './../core/db/redis.db';

@Injectable()
export class ExercisesService {
  private readonly logger: Logger;

  private readonly COMPILER_URL: string =
    'https://core-compilers-ekih6uelkq-el.a.run.app/';

  constructor() {
    this.logger = new Logger(ExercisesService.name);
  }

  /**
   * Get all exercises in a track
   *
   * @cache for 1 Day `(86400 secs)`
   *
   * @param {String} trackId of track to fetch exercises of
   * @returns {Array<TAllExercises>} all available exercises in a track
   *
   * @throws 422 error if db error occurs
   */
  async fetchAllExercisesInTrack(trackId: string): Promise<TAllExercises[]> {
    const REDIS_KEY = 'allExercisesInTrack' + '_' + trackId;

    // Read the cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // If cache is available and in valid format, return it
    if (cachedData && JSON.parse(cachedData)) {
      return JSON.parse(cachedData);
    }

    // Fetch exercises in a track
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

    // cache the response for 1 Day

    await redisClient.set(REDIS_KEY, JSON.stringify(data));
    await redisClient.expire(REDIS_KEY, 86400); // cache will expire after 1 Day

    return data as TAllExercises[];
  }

  /**
   * Fetch exercise details by exercise id
   *
   * @cache for 1 Day `(86400 secs)`
   *
   * @param {string} exerciseId of exercise to fetch details for
   * @returns {TExerciseDetails} exercise details of provided exercise w/ provided id
   *
   * @throws 422 error if db error occurs
   * @throws 404 error if there is no exercise w/ provided exercise id
   */
  async fetchExerciseDetails(exerciseId: string): Promise<TExerciseDetails> {
    const REDIS_KEY = 'exerciseDetails' + '_' + exerciseId;

    // Read the cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // If cache is available and in valid format, return it
    if (cachedData && JSON.parse(cachedData)) {
      return JSON.parse(cachedData);
    }

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

    // Cache the response for 1 Day

    await redisClient.set(REDIS_KEY, JSON.stringify(data[0]));
    await redisClient.expire(REDIS_KEY, 86400); // cache will expire after 1 Day

    return data[0] as TExerciseDetails;
  }

  /**
   * Fetch exercise test details by exercise id
   *
   * @cache for 1 Day `(86400 secs)`
   *
   * @param {string} exerciseId of exercise to fetch details for
   *
   * @throws 409 error if db error occurs
   * @throws 404 error if there is no exercise w/ provided exercise id
   */
  async fetchExerciseTestDetails(exerciseId: string) {
    const REDIS_KEY = 'exercisesTestDetails' + '_' + exerciseId;

    // Read the cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // If cache is available and in valid format, return it
    if (cachedData && JSON.parse(cachedData)) {
      return JSON.parse(cachedData);
    }

    const { data, error } = await supabaseClient
      .from('Exercises')
      .select(`maxPoints, minPoints, tests, language, trackId`)
      .eq('id', exerciseId);

    // if data is empty, i.e. exercise not found
    if (!data || isEmptyArray(data)) {
      this.logger.error(
        `Unable to fetch details of exercise w/ id ${exerciseId}`,
      );

      throw createHttpError({
        status: HttpStatus.NOT_FOUND,
        message: errorMessages.exercise_not_found,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // Check if any other db error occurs
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

    // Cache the response for 1 Day

    await redisClient.set(REDIS_KEY, JSON.stringify(data[0]));
    await redisClient.expire(REDIS_KEY, 86400); // cache will expire after 1 Day

    return data[0];
  }

  /**
   * Run user's code along w/ tests on the server and get output and compile error
   *
   * @returns output and error of the code
   *
   * @throws 400 if input validation fails
   * @throws 500 if any other error occurs
   */
  async runExerciseTests(
    codeWithTests: string,
    language: string,
  ): Promise<{
    output: string;
    error: string;
  }> {
    let codeOutput: string = null;
    let codeError: string = null;

    // get language specific route for API
    const compilerUrl = this.getCompilerUrlByLanguage(language);

    // do API post request for code compilation
    try {
      const res = await axios.post(
        `${this.COMPILER_URL}/compile/${compilerUrl}`,
        {
          usersCode: codeWithTests,
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      );

      // on successful code response
      if (res.status === 200) {
        this.logger.log(
          `Code executed successfully for language - ${language}`,
        );

        // check for compile time error
        if (res.data['data']['error'] !== null) {
          codeError = res.data['data']['error'];
        } else if (res.data['data']['output']) {
          codeOutput = res.data['data']['output'];
        }
      }
    } catch (err) {
      const error = err as AxiosError;

      // logging for stacktrace
      this.logger.error(
        `Invalid input received for code in lang - ${language}, error -  ${JSON.stringify(
          error,
        )}`,
      );

      // throw 400 exception
      throw createHttpError({
        message: errorMessages.invalid_test_input,
        status: HttpStatus.BAD_REQUEST,
        stacktrace: JSON.stringify(error),
      });
    }

    return {
      output: codeOutput,
      error: codeError,
    };
  }

  /**
   * Creates activity for a user with language in which activity has done
   *
   * @param {string} userId associated with users profile
   * @param {string} exerciseId associated with the exercise
   * @param {string} language name in which code is written
   *
   * @returns {boolean} `true` indicating a record has been created
   *
   * @throws 409 if any db error occurs
   */
  async createUserActivity(
    userId: string,
    exerciseId: string,
    language: string,
  ): Promise<boolean> {
    const { error } = await supabaseClient.from('UsersActivity').insert([
      {
        exerciseId: exerciseId,
        uid: userId,
        language: language,
      },
    ]);

    if (error) {
      this.logger.error(
        `Unable to create user activity for user w/ ${userId} id for exercise w/ ${exerciseId} id`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_create_activity,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    return true; // indicates a record has been created
  }

  /**
   * Read already created details for the exercise for the user
   *
   * @param {string} userId
   * @param {string} exerciseId
   *
   * @returns exercise details for user, or null if entry does not exists
   */
  async getUserExerciseDetails(userId: string, exerciseId: string) {
    const { data, error } = await supabaseClient
      .from('UserExercises')
      .select(`pointsEarned, isCompleted`)
      .eq('exerciseId', exerciseId)
      .eq('uid', userId);

    if (error || isEmptyArray(data)) {
      return null;
    }

    return data[0];
  }

  /**
   * Create a exercise record in db for the user
   *
   * ⚠️ ALERT: Users total points cache is invalidated
   *
   * @param exerciseId
   * @param userId
   * @param trackId
   * @param userCode
   * @param isCompleted
   * @param pointsEarned
   *
   * @returns {boolean} `true` indicating a record has been created
   *
   * @throws 409 if any db error occurs
   */
  async createUserExerciseRecord(
    exerciseId: string,
    userId: string,
    trackId: string,
    userCode: string,
    isCompleted: boolean,
    pointsEarned: number,
  ): Promise<boolean> {
    const { error } = await supabaseClient.from('UserExercises').insert([
      {
        exerciseId: exerciseId,
        uid: userId,
        trackId: trackId,
        usersCode: userCode,
        isCompleted: isCompleted,
        pointsEarned: pointsEarned,
      },
    ]);

    if (error) {
      this.logger.error(
        `Unable to create user exercise record for exercise ${exerciseId} for ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_create_activity,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // Invalidate total points cache
    await redisClient.del('totalPoints' + '_' + userId);

    return true; // indicates a record has been created
  }

  /**
   * Updates exercise record in db for the user
   *
   * ⚠️ ALERT: Users total points cache is invalidated
   *
   * @param exerciseId
   * @param userId
   * @param userCode
   * @param isCompleted
   * @param pointsEarned
   *
   * @returns {boolean} `true` indicating a record has been updated
   *
   * @throws 409 if any db error occurs
   */
  async updateUserExerciseRecord(
    exerciseId: string,
    userId: string,
    userCode: string,
    isCompleted: boolean,
    pointsEarned: number,
  ): Promise<boolean> {
    const { error } = await supabaseClient
      .from('UserExercises')
      .update({
        usersCode: userCode,
        isCompleted: isCompleted,
        pointsEarned: pointsEarned,
        updated_at: new Date().toISOString(),
      })
      .eq('exerciseId', exerciseId)
      .eq('uid', userId);

    if (error) {
      this.logger.error(
        `Unable to update user exercise record for exercise ${exerciseId} for ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_create_activity,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    // Invalidate total points cache
    await redisClient.del('totalPoints' + '_' + userId);

    return true; // indicates a record has been updated
  }

  /**
   * Get users completed exercises
   *
   * @param {string} userId  of user associated with their profile
   *
   * @returns {string[]} list of uid's of completed exercises by user
   *
   * @throws 409 if any db error occurs
   */
  async getUsersCompletedExercises(
    userId: string,
    trackId: string,
  ): Promise<string[]> {
    const { data, error } = await supabaseClient
      .from('UserExercises')
      .select(`exerciseId`)
      .eq('uid', userId)
      .eq('trackId', trackId)
      .eq('isCompleted', true);

    // if any db error occurs
    if (error) {
      this.logger.error(
        `Unable to fetch completed exercises for User with uid - ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user_completed_exercises,
        hint: error?.hint ?? error?.code,
        stacktrace: error?.details,
      });
    }

    const completedExercises: string[] = [];

    for (let i = 0; i < data.length; i++) {
      completedExercises.push(data[i].exerciseId);
    }

    return completedExercises;
  }

  /**
   * Get a compiler route for the specific language
   *
   * @param {string} language name to co-relate api url
   *
   * @returns api url for the specific language's compiler
   */
  getCompilerUrlByLanguage(language: string): string {
    switch (language) {
      case 'Python':
        return 'py';

      case 'C++':
        return 'cpp';

      case 'C':
        return 'c';

      default:
        return '';
    }
  }
}
