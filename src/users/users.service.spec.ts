import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { supabaseClient } from './../core/db/supabase.db';
import { errorMessages } from './../config/messages.config';

describe('UsersService', () => {
  let service: UsersService;

  const USER_UID = '3d1f0c06-4d4d-4e9e-a6f7-ef6e0e7a9b11';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await supabaseClient.from('Users').delete().eq('uid', USER_UID);
  });

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
});
