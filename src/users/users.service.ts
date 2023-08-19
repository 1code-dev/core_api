import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { supabaseClient } from './../core/db/supabase.db';
import { createHttpError, isEmptyArray } from './../core/utils/utils.core';
import { errorMessages } from './../config/messages.config';

@Injectable()
export class UsersService {
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(UsersService.name);
  }

  /**
   * Creates a user's entry in `Users` table
   *
   * @param {string} uid of user obtained from 1Auth
   *
   * @returns created users profile data
   * @returns null if entry is already created
   *
   * @throws 409 error if any db error occurs
   */
  async createUser(uid: string) {
    const { data: userData, error: userError } = await supabaseClient
      .from('Users')
      .insert([{ uid: uid }])
      .select(`longestStreak, streak, totalPoints, uid`);

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
   * Create a user rank entry in for user in `UserRank` table
   *
   * @param {string} uid of user
   * @param {number} usersCount obtained from `Users` table
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
   * Count entries in `Users` table and return it
   *
   * @returns {number} count of users in `Users` table
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
}
