import { redisClient } from './../core/db/redis.db';
import { supabaseClient } from './../core/db/supabase.db';
import { errorMessages } from './../config/messages.config';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';

import {
  areDatesConsecutive,
  createHttpError,
  isEmptyArray,
} from './../core/utils/utils.core';

@Injectable()
export class UsersService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(UsersService.name);
  }

  /**
   * Count number of users present in `Users` table
   *
   * @returns {number} count of users in `Users` table
   *
   * @throws 409 if any db error has occurred
   */
  async countUserEntries(): Promise<number> {
    const { error: userCountError, count: usersCount } = await supabaseClient
      .from('Users')
      .select(`*`, { count: 'exact', head: true }); // keep head == true, to not fetch any data

    // throw error if supabase throws any error
    if (userCountError) {
      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_create_user,
        hint: userCountError.hint,
        stacktrace: userCountError.details,
      });
    }

    return usersCount;
  }

  /**
   * Creates a profile for user on 1Code
   *
   * @param {string} uid of user obtained from 1Auth
   *
   * @returns created users profile data
   *
   * @returns (404) null if entry is already created
   * @throws 409 error if any db error occurs
   */
  async createUserProfile(uid: string) {
    const { data: userData, error: userError } = await supabaseClient
      .from('Users')
      .insert([{ uid: uid }])
      .select(`uid`);

    // throw error if unable to create a user
    if (userError) {
      // Handle duplicate key here
      if (userError.code === '23505') {
        this.logger.warn('User with UID already exists in Users table');
        return null;
      }

      this.logger.error('Db error has occurred!', { userError });

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_create_user,
        hint: userError.code,
        stacktrace: userError.details,
      });
    }

    // check if userData has data
    if (isEmptyArray(userData)) {
      this.logger.error('Received empty userData after creating', { userData });
      return null;
    }

    this.logger.log(`User with uid ${userData[0].uid}, created successfully!`);

    return userData[0];
  }

  /**
   * Creates user ranks for user in `UserRanks` table
   *
   * @param {string} uid of user associated with their profile
   * @param {number} usersCount of total available users in `Users` table
   *
   * @throws 422 if record already exists
   * @throws 409 if any other db error has occurred
   */
  async createUserRanks(uid: string, usersCount: number) {
    const { error: userRankError } = await supabaseClient
      .from('UserRanks')
      .insert([
        {
          uid: uid,
          globalRank: usersCount,
          weeklyRank: usersCount,
        },
      ]);

    // throw error if supabase throws any error
    if (userRankError) {
      // if entry already exists
      if (userRankError.code === '23505') {
        throw createHttpError({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          message: errorMessages.user_already_created,
          hint: userRankError.code,
          stacktrace: userRankError.details,
        });
      }

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_create_user,
        hint: userRankError.hint,
        stacktrace: userRankError.details,
      });
    }
  }

  /**
   * Deletes user profile w/ cascade
   *
   * ⚠️ CAUTION : There are no real world application of this function, it's only created for internal use
   *
   * ➡️ NOTE: In db, on delete `cascade` is set, hence all data associated with user will also be deleted
   *
   * @param {string} uid associated with the profile to be deleted
   *
   * @throws 409 if db error occurred while deleting the account
   */
  async deleteUserProfile(uid: string) {
    const { error } = await supabaseClient
      .from('Users')
      .delete({ count: 'exact' })
      .eq('uid', uid);

    if (error) {
      this.logger.error(`Unable to delete users profile w/ ${uid} uid`);

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_delete_user,
        hint: error?.hint ?? error.code,
        stacktrace: error.details,
      });
    }
  }

  /**
   * Fetch rank data for a user
   *
   * @param {string} userId associated with the profile
   *
   * @returns user ranks data
   *
   * @throws 404 if there is no record for the user
   *
   * @throws 409 if db error has occurred
   */
  async fetchUserRanks(userId: string) {
    // fetch users data from db
    const { data, error } = await supabaseClient
      .from('UserRanks')
      .select(`globalRank, weeklyRank`)
      .eq('uid', userId)
      .limit(1);

    // TODO: Need to cache the response for 5 minutes

    // throw error if supabase throws any error
    if (error) {
      this.logger.error(`Unable to fetch users profile for ${userId} uid`, {
        error,
      });

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user,
        hint: error?.hint ?? error.code,
        stacktrace: error.details,
      });
    }

    // check if data is empty array
    if (isEmptyArray(data)) {
      // 👉 NOTE: This is primarily not treated as error, frontend will first try to fetch profile
      //    and if profile is null then it will create it
      this.logger.log(`UserProfile with ${userId} uid does not exists!`);

      throw createHttpError({
        status: HttpStatus.NOT_FOUND,
        message: errorMessages.user_profile_not_found,
        hint: null,
        stacktrace: null,
      });
    }

    const userData = data[0]; // select the first entry from the list

    return userData;
  }

  /**
   * Calculate total points earned by user
   *
   * @cached for 1 day `(86400 secs)`
   *
   * @param {string} userId associated with users profile
   *
   * @returns {number} total points earned by user
   *
   * @throws 409 exception if db error is present
   */
  async calculateUsersTotalPoints(userId: string): Promise<number> {
    const REDIS_KEY = 'totalPoints' + '_' + userId;

    // retrieve cached data
    const cachedPoints = await redisClient.get(REDIS_KEY);

    // if cache is present return the cached data
    if (cachedPoints && typeof parseInt(cachedPoints) === 'number') {
      this.logger.debug(`Total points retrieved from cache ${cachedPoints}`);

      return parseInt(cachedPoints);
    }

    const { data, error } = await supabaseClient
      .from('UserExercises')
      .select(`pointsEarned`)
      .eq('uid', userId);

    if (error) {
      this.logger.error(
        `Unable to fetch user exercise record for user w/ uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_calculate_earned_points,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    // total earned points of user
    let totalPoints = 0;

    for (let item of data) {
      totalPoints += item.pointsEarned;
    }

    // Cache total points on redis for 5 minutes
    await redisClient.set(REDIS_KEY, totalPoints);
    await redisClient.expire(REDIS_KEY, 86400); // expire cache after 1 Day

    this.logger.debug(
      `Total points are cached for user ${userId} and ${cachedPoints}`,
    );

    return totalPoints;
  }

  /**
   * Calculate current and longest streak for a user
   *
   * @cached for 1 day `(86400 secs)`
   *
   * @param {string} userId associated with users profile
   *
   * @returns {{ currentStreak: number; longestStreak: number }} users streak data
   *
   * @throws 409 exception if db error is present
   */
  async calculateUserStreaks(
    userId: string,
  ): Promise<{ currentStreak: number; longestStreak: number } | null> {
    const REDIS_KEY = 'userStreaks' + '_' + userId;

    // retrieve cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // if cached values are available and in correct format then return them
    if (cachedData && JSON.parse(cachedData)) {
      this.logger.debug('User streak data retrieved from cache', cachedData);
      return JSON.parse(cachedData);
    }

    // Fetching user's activity records ordered by `created_at`
    const { data: activityData, error } = await supabaseClient
      .from('UsersActivity')
      .select('created_at')
      .eq('uid', userId)
      .order('created_at');

    if (error) {
      this.logger.error(
        `Unable to fetch user activity records for user w/ uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user_activity_records,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    // user activity with date and times
    const activityDateTime: string[] = [];

    activityData.forEach((item) => {
      activityDateTime.push(item.created_at);
    });

    // user activity with only date and removed time
    let activityDates: string[] = [];

    // Remove timestamp form activity dates
    activityDateTime.forEach((item) => {
      activityDates.push(new Date(item).toISOString().split('T')[0]);
    });

    // remove redundant dates from activity dates
    activityDates = Array.from(new Set(activityDates));

    this.logger.debug(activityDates);

    const currentStreak = this.localCalculateCurrentStreak(activityDates);
    const longestStreak = this.localCalculateLongestStreak(activityDates);

    // Cache the calculated response

    await redisClient.set(
      REDIS_KEY,
      JSON.stringify({ currentStreak, longestStreak }),
    );

    await redisClient.expire(REDIS_KEY, 86400); // expire cache after 1 Day

    return { currentStreak, longestStreak };
  }

  /**
   * Calculate total exercises solved by user
   *
   * @cached for 5 min `(300 secs)`
   *
   * @param {string} userId associated with users profile
   *
   * @returns {number} number of exercises solved by user
   *
   * @throws 409 exception if db error is present
   */
  async calculateUserTotalExercisesSolved(userId: string): Promise<number> {
    const REDIS_KEY = 'totalExercisesSolved' + '_' + userId;

    // read cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // if cached data is available and in correct format return it
    if (cachedData && parseInt(cachedData)) {
      return parseInt(cachedData);
    }

    // Fetch users completed exercise count
    const { count, error } = await supabaseClient
      .from('UserExercises')
      .select('exerciseId', { count: 'exact' })
      .eq('isCompleted', true)
      .eq('uid', userId);

    // if any db error is there then throw 409 exception
    if (error) {
      this.logger.error(
        `Unable to count users completed exercise for user w/ uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user_completed_exercise_count,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    // Cache the response for 5 minutes

    await redisClient.set(REDIS_KEY, count ?? 0);
    await redisClient.expire(REDIS_KEY, 300); // expire after 5 minutes

    return count ?? 0;
  }

  /**
   * Fetch user profile creation date
   *
   * @cached for 5 min `(300 secs)`
   *
   * @param {string} userId associated with users profile
   *
   * @returns {string} users profile creation date
   *
   * @throws 409 exception if db error is present
   */
  async fetchUserProfileCreationDate(userId: string): Promise<string> {
    const REDIS_KEY = 'profileCreationDate' + '_' + userId;

    // read cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // if cached data is available and in correct format return it
    if (cachedData) {
      return cachedData;
    }

    // Fetch users completed exercise count
    const { data, error } = await supabaseClient
      .from('Users')
      .select('createdAt')
      .eq('uid', userId);

    // if any db error is there then throw 409 exception
    if (error || isEmptyArray(data)) {
      this.logger.error(
        `Unable to count users completed exercise for user w/ uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user_completed_exercise_count,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    // Cache the response for 5 minutes

    await redisClient.set(REDIS_KEY, data[0].createdAt);
    await redisClient.expire(REDIS_KEY, 300); // expire after 5 minutes

    return data[0].createdAt;
  }

  /**
   * Fetch users current month activity
   *
   * @cached for 10 Hrs `(36000 secs)`
   *
   * @param {string} userId associated with users profile
   *
   * @returns array of users activity time and programming language name
   *
   * @throws 409 exception if db error is present
   */
  async fetchUserActivity(userId: string): Promise<
    {
      created_at: string;
      language: string;
    }[]
  > {
    const REDIS_KEY = 'usersActivity' + '_' + userId;

    // read cached data
    const cachedData = await redisClient.get(REDIS_KEY);

    // if cached data is available and in valid format, return it
    if (cachedData && JSON.parse(cachedData)) {
      return JSON.parse(cachedData);
    }

    const today = new Date(); // Get current date
    const currentMonth = today.getMonth() + 1; // Get current month (0-indexed)

    // Fetch users activity only for current ongoing month
    const { data: activityData, error } = await supabaseClient
      .from('UsersActivity')
      .select('created_at, language')
      .eq('uid', userId)
      .gte(
        'created_at',
        `${today.getFullYear()}-${currentMonth
          .toString()
          .padStart(2, '0')}-01T00:00:00Z`,
      ) // Start of current month
      .lt(
        'created_at',
        `${today.getFullYear()}-${(currentMonth + 1)
          .toString()
          .padStart(2, '0')}-01T00:00:00Z`,
      ) // Start of next month
      .order('created_at');

    // if any db error is there then throw 409 exception
    if (error) {
      this.logger.error(
        `Unable to fetch users activity for user w/ uid ${userId}`,
      );

      throw createHttpError({
        status: HttpStatus.CONFLICT,
        message: errorMessages.unable_to_fetch_user_activity_records,
        hint: error?.hint ?? error?.code,
        stacktrace: error.details,
      });
    }

    // Cache the response for 10 hours

    await redisClient.set(REDIS_KEY, JSON.stringify(activityData));
    await redisClient.expire(REDIS_KEY, 36000); // cache will expire after 10 hours

    return activityData;
  }

  /**
   * Calculate the user's current streak based on the input activity dates.
   *
   * @private
   *
   * @param activityDates - Array of date strings representing user's activity.
   *
   * @returns {number} Current streak of the user.
   */
  private localCalculateCurrentStreak(activityDates: string[]): number {
    const today = new Date();

    const currentDate = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );

    let streak = 0;
    let prevDate = currentDate;

    for (const dateStr of activityDates.reverse()) {
      const activityDate = new Date(dateStr);
      const diffTime = prevDate.getTime() - activityDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0 || diffDays === 1) {
        streak++;
        prevDate = activityDate;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Calculate the user's longest streak based on the input activity dates.
   *
   * @private
   *
   * @param activityDates - Array of date strings representing user's activity.
   *
   * @returns {number} Longest streak of the user.
   */
  private localCalculateLongestStreak(activityDates: string[]): number {
    let longestStreak = 0;
    let currentStreak = 0;

    for (let i = 0; i < activityDates.length; i++) {
      const currentDate = new Date(activityDates[i]);
      const prevDate = i > 0 ? new Date(activityDates[i - 1]) : null;

      if (prevDate && areDatesConsecutive(prevDate, currentDate)) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }

    return longestStreak;
  }
}
