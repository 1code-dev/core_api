import { UsersService } from './users.service';
import { Test, TestingModule } from '@nestjs/testing';
import { errorMessages } from './../config/messages.config';

import {
  connectRedisClient,
  disconnectRedisClient,
} from './../core/db/redis.db';

describe('UsersService', () => {
  let service: UsersService;

  const USER_UID = '1d1f0c06-4d4d-4e9e-a6f7-ef6e0e7a9b11';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);

    connectRedisClient();
  });

  afterAll(() => {
    disconnectRedisClient();
  });

  // -----------------------------------------------------------------------------------------------------------------------

  // ⚠️ Warning: Do not change the order in which tests are processed

  // 🪜 STEPS: First user profile to be created with `USER_UID` and then all the records to be deleted by running test in appropriate order

  // 👉 NOTE: This is to avoid any ambiguity which may occur in future by using a default UUID for all the tests processed

  // -----------------------------------------------------------------------------------------------------------------------

  //  Create users profile 😃

  // Check if `countUserEntries` function returning the count properly
  it('should return a valid count', async () => {
    const count = await service.countUserEntries();

    expect(typeof count).toBe('number');
  });

  // Check user creation
  it('should create a user with UID', async () => {
    const userData = await service.createUserProfile(USER_UID);

    expect(userData).toMatchObject({
      uid: USER_UID,
    });
  });

  // Check if user is already created
  it('should return null if user is already created', async () => {
    const userData = await service.createUserProfile(USER_UID);

    expect(userData).toEqual(null);
  });

  // Should throw 409 HttpException if db error occurred
  it('should throw 409 if db error has occurred', async () => {
    try {
      await service.createUserProfile('wrong UUID');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_create_user,
        status: 409,
      });
    }
  });

  // Create user ranks 🎖️

  // Should create `userRank` data properly
  it('should create userRank data properly', async () => {
    await service.createUserRanks(USER_UID, 100);

    // if above function throws any error, the test will fail
    expect(true).toBe(true);
  });

  // Should throw 409 error if any db error has occurred while creating user rank record
  it('should throw 409 error if `createUserRanks` throws any db error', async () => {
    try {
      await service.createUserRanks('wrong-UID', 100.0);
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_create_user,
        status: 409,
      });
    }
  });

  // Should throw 422 error if userRank record already exists
  it('should throw 422 error if userRank already exists', async () => {
    try {
      await service.createUserRanks(USER_UID, 100);
    } catch (error) {
      expect(error.getStatus()).toBe(422);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.user_already_created,
        status: 422,
      });
    }
  });

  // Fetch users ranks 🥇

  // Should fetch users rank data properly
  it('should fetch user ranks data correctly', async () => {
    const userRanks = await service.fetchUserRanks(USER_UID);

    expect(userRanks).toHaveProperty('globalRank');
    expect(userRanks).toHaveProperty('weeklyRank');

    expect(typeof userRanks.globalRank).toEqual('number');
    expect(typeof userRanks.weeklyRank).toEqual('number');
  });

  // Should throw 404 when user profile does not exists while fetching ranks
  it('should throw 404 when users profile does not exists while fetching ranks', async () => {
    try {
      await service.fetchUserRanks('1d1f1c01-1d1d-1e1e-a1f1-ef1e1e1a1b11');
    } catch (error) {
      expect(error.getStatus()).toBe(404);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.user_profile_not_found,
        status: 404,
      });
    }
  });

  // Should throw 409 if db error occurs while fetching ranks
  it('should throw 409 when db error has occurred while fetching users profile while fetching ranks', async () => {
    try {
      await service.fetchUserRanks('not-existant-uid');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_fetch_user,
        status: 409,
      });
    }
  });

  // Calculate total points 🔢

  // should calculate users totalPoints correctly
  it('should correctly calculate users total points', async () => {
    const userTotalPoints = await service.calculateUsersTotalPoints(USER_UID);

    expect(typeof userTotalPoints).toEqual('number');
    expect(userTotalPoints).toEqual(0);
  });

  // Should throw 409 if db error occurs while calculating total points
  it('should throw 409 when db error has occurred while calculating total points', async () => {
    try {
      await service.calculateUsersTotalPoints('not-existant-uid');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        status: 409,
      });
    }
  });

  // Calculate users streak data 💯

  // should calculate users streak data correctly
  it('should correctly calculate users streak data', async () => {
    const userStreakData = await service.calculateUserStreaks(USER_UID);

    expect(typeof userStreakData.currentStreak).toEqual('number');
    expect(typeof userStreakData.longestStreak).toEqual('number');
  });

  // Should throw 409 if db error occurs while calculating users streak data
  it('should throw 409 when db error has occurred while calculating users streak', async () => {
    try {
      await service.calculateUserStreaks('not-existant-uid');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        status: 409,
      });
    }
  });

  // Calculate user stats 📊

  // should calculate profile stats successfully
  it('should correctly calculate users streak data', async () => {
    const usersTotalPoints = await service.calculateUserTotalExercisesSolved(
      USER_UID,
    );

    expect(typeof usersTotalPoints).toEqual('number');
  });

  // should fetch users activity correctly
  it('should correctly fetch users activity', async () => {
    const usersActivity = await service.fetchUserActivity(USER_UID);

    expect(typeof usersActivity).toEqual('object');
  });

  // Delete user 🗑️

  // Should delete users profile without any db error
  it('should throw 409 if db error has occurred while deleting profile', async () => {
    try {
      await service.deleteUserProfile('non-existing-UID');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_delete_user,
        status: 409,
      });
    }
  });

  // Should delete users profile without any db error
  it('should delete user profile successfully', async () => {
    try {
      await service.deleteUserProfile(USER_UID);

      // If no error is thrown then test should pass
      expect(true).toBe(true);
    } catch (_) {
      // If any error is thrown then test should fail

      expect(true).toBe(false);
    }
  });
});
