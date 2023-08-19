import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { errorMessages } from './../config/messages.config';

describe('UsersService', () => {
  let service: UsersService;

  const USER_UID = '1d1f0c06-4d4d-4e9e-a6f7-ef6e0e7a9b11';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // ⚠️ Warning: Do not change the order in which tests are processed

  // 🪜 STEPS: First user profile to be created with `USER_UID` and then all the records to be deleted by running test in appropriate order

  // 👉 NOTE: This is to avoid any ambiguity which may occur in future by using a default UUID for all the tests processed

  // Check if `countUserEntries` function returning the count properly
  it('should return a valid count', async () => {
    const count = await service.countUserEntries();

    expect(typeof count).toBe('number');
  });

  // Check user creation
  it('should create a user with UID', async () => {
    const userData = await service.createUser(USER_UID);

    expect(userData).toEqual({
      longestStreak: 0,
      streak: 0,
      totalPoints: 0,
      uid: USER_UID,
    });
  });

  // Check if user is already created
  it('should return null if user is already created', async () => {
    const userData = await service.createUser(USER_UID);

    expect(userData).toEqual(null);
  });

  // Should throw 409 HttpException if db error occurred
  it('should throw 409 if db error has occurred', async () => {
    try {
      await service.createUser('wrong UUID');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_create_user,
        status: 409,
      });
    }
  });

  // Should create `userRank` data properly
  it('should create userRank data properly', async () => {
    await service.createUserRanks(USER_UID, 100);
  });

  // Should throw 409 error if any db error has occurred
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

  // Should fetch users profile correctly
  it('should fetch user profile correctly', async () => {
    const userProfile = await service.getUserProfile(USER_UID);

    expect(userProfile).toMatchObject({
      longestStreak: 0,
      streak: 0,
      totalPoints: 0,
    });

    expect(userProfile).toHaveProperty('globalRank');
    expect(userProfile).toHaveProperty('weeklyRank');
  });

  // Should throw 404 when user profile does not exists
  it('should throw 404 when profile does not exists', async () => {
    try {
      await service.getUserProfile('1d1f1c01-1d1d-1e1e-a1f1-ef1e1e1a1b11');
    } catch (error) {
      expect(error.getStatus()).toBe(404);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.user_profile_not_found,
        status: 404,
      });
    }
  });

  // Should throw 409 if db error occurs
  it('should throw 409 when db error has occurred while fetching users profile', async () => {
    try {
      await service.getUserProfile('not-existant-uid');
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_fetch_user,
        status: 409,
      });
    }
  });

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
