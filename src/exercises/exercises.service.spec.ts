import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { errorMessages } from './../config/messages.config';
import { supabaseClient } from './../core/db/supabase.db';

describe('ExercisesService', () => {
  let service: ExercisesService;

  // Track ID for `Python` track
  const TRACK_ID = 'a13e9c3d-e7cf-477f-b862-0a1ee0e18d10';

  // Exercise ID of `Hello, World!` exercise in python track
  const EXERCISE_ID = '85b3f3ec-e5e8-4bd7-b035-0ab1990cd75c';

  // User's UID for Test User 1 who is already created in the DB
  const USER_UID = 'a1212c12-1a82-4f14-8dd0-4cbe04c47d4b';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExercisesService],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

  afterAll(async () => {
    await supabaseClient
      .from('UserExercises')
      .delete()
      .eq('exerciseId', EXERCISE_ID)
      .eq('uid', USER_UID);
  });

  // Fetch Available Exercises In A Track

  // Check if `getAllExercisesInTrack` function returning exercises list properly for a given track
  it('should return a valid list of available exercises in a track', async () => {
    const exercises = await service.getAllExercisesInTrack(TRACK_ID);

    // except length to be greater then 0
    expect(exercises.length).toBeGreaterThan(0);

    // validate format of the response
    expect(exercises[0].id).not.toBeNull();
    expect(exercises[0].level).not.toBeNull();
    expect(exercises[0].name).not.toBeNull();
    expect(exercises[0].maxPoints).not.toBeNull();
  });

  // Should throw db error while fetching exercises if track id is invalid
  it('Should throw 409 exception while fetching exercises if track id is invalid', async () => {
    try {
      // Track ID is passed in invalid format to produce error
      await service.getAllExercisesInTrack('TRACK_ID');

      // if error is not thrown then test should automatically fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.getStatus()).toBe(409);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.unable_to_fetch_exercises,
        status: 409,
      });
    }
  });

  // Get Exercise Details

  // Should return exercise details properly
  it('should return exercise details properly', async () => {
    const exercise = await service.getExerciseDetails(EXERCISE_ID);

    // validate format of the response
    expect(exercise.id).not.toBeNull();
    expect(exercise.baseCode).not.toBeNull();
    expect(exercise.name).not.toBeNull();
    expect(exercise.instructions).not.toBeNull();
    expect(exercise.minPoints).not.toBeNull();
    expect(exercise.maxPoints).not.toBeNull();
  });

  // Should throw error if exercise not found
  it('Should throw 404 error if exercise does not exists', async () => {
    try {
      // valid but non existant UUID
      await service.getExerciseDetails('ed04142c-09c5-43d0-848c-2dc16b8b96c3');

      // if error is not thrown then test should automatically fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.getStatus()).toBe(404);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.exercise_not_found,
        status: 404,
      });
    }
  });

  // Get Exercise Test Details

  // Should return exercise test details properly
  it('should return exercise test details properly', async () => {
    const exercise = await service.getExerciseTestDetails(EXERCISE_ID);

    // validate format of the response
    expect(exercise.tests).not.toBeNull();
    expect(exercise.language).not.toBeNull();
    expect(exercise.minPoints).not.toBeNull();
    expect(exercise.maxPoints).not.toBeNull();
  });

  // Should throw error if exercise not found while fetching exercise test details
  it('Should throw 404 error if exercise test details were not found', async () => {
    try {
      // valid but non existant UUID
      await service.getExerciseDetails('ed04142c-09c5-43d0-848c-2dc16b8b96c3');

      // if error is not thrown then test should automatically fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.getStatus()).toBe(404);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.exercise_not_found,
        status: 404,
      });
    }
  });

  // Run Test

  // Should throw error if exercise not found while fetching exercise test details
  it('Should throw 400 error when invalid inputs are passed to run code w/ tests', async () => {
    try {
      // valid language but invalid user code
      await service.runExerciseTests('invalidUserCode', 'Python');

      // if error is not thrown then test should automatically fail
      expect(true).toBe(false);
    } catch (error) {
      expect(error.getStatus()).toBe(400);

      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.invalid_test_input,
        status: 400,
      });
    }
  });

  // python

  // Should return compiler output clearly
  it('should return compiler output for `Python` code without any compiler error', async () => {
    const userCodeString = 'IApwcmludCgiSGVsbG8sIFdvcmxkISIpCg==';

    const exercise = await service.runExerciseTests(userCodeString, 'Python');

    // validate format of the response
    expect(exercise.output).not.toBeNull();
    expect(exercise.error).toBeNull();
  });

  // Should return compiler output w/ compiler error
  it('should return compiler error after running `Python` code', async () => {
    const userCodeString =
      'IAojIE1vZGlmeSB0aGUgcmV0dXJuIHZhbHVlIHRvIHBhc3MgdGhlIHRlc3QKZGVmIGhlbGxvKCk6CnJldHVybiAiSGVsbG8sIFdvcmxkISIKCiMgTk9URTogRG8gbm90IG1vZGlmeSBmdW5jdGlvbiBuYW1lLCBpZiB5b3UgZG8sIHRlc3RzIHdpbGwgbm90IHBhc3MhCgo=';

    const exercise = await service.runExerciseTests(userCodeString, 'Python');

    // validate format of the response
    expect(exercise.output).toBeNull();
    expect(exercise.error).not.toBeNull();
  });

  // C++

  // Should return compiler output clearly
  it('should return compiler output for `C++` code without any compiler error', async () => {
    const userCodeString =
      'IAojaW5jbHVkZSA8aW9zdHJlYW0+CgppbnQgbWFpbigpIHsKICAgIHN0ZDo6Y291dCA8PCAiSGVsbG8sIHdvcmxkISIgPDwgc3RkOjplbmRsOwogICAgcmV0dXJuIDA7Cn0K';

    const exercise = await service.runExerciseTests(userCodeString, 'C++');

    // validate format of the response
    expect(exercise.output).not.toBeNull();
    expect(exercise.error).toBeNull();
  });

  // Should return compiler output w/ compiler error
  it('should return compiler error after running `C++` code', async () => {
    const userCodeString =
      'IAojaW5jbHVkZSA8aW9zdHJlYW0+CmludCBtYWluKCkgewogICAgc3RkOjpjb3V0IDw8ICJIZWxsbywgd29ybGQhCiAgICByZXR1cm4gMDsKfQo=';

    const exercise = await service.runExerciseTests(userCodeString, 'C++');

    // validate format of the response
    expect(exercise.output).toBeNull();
    expect(exercise.error).not.toBeNull();
  });

  // Create User Activity

  // should create user activity
  it('Should return true after creating user activity', async () => {
    const isCreated = await service.createUserActivity(
      USER_UID,
      EXERCISE_ID,
      'Python',
    );

    // validate format of the response
    expect(isCreated).toBe(true);
  });

  // exercise record creation

  // should return null if user exercise does not exists
  it('should return null if user exercise does not exists', async () => {
    const details = await service.getUserExerciseDetails(USER_UID, EXERCISE_ID);

    expect(details).toBeNull();
  });

  // should create exercise record for user properly
  it('should return true after creating exercise record for the user', async () => {
    const isCreated = await service.createUserExerciseRecord(
      EXERCISE_ID,
      USER_UID,
      TRACK_ID,
      'usersCode',
      false,
      0,
    );

    expect(isCreated).toBe(true);
  });

  // update user exercise

  // should update exercise record for user properly
  it('should return true after creating exercise record for the user', async () => {
    const isUpdated = await service.updateUserExerciseRecord(
      EXERCISE_ID,
      USER_UID,
      'usersCodeUpdated',
      true,
      10,
    );

    expect(isUpdated).toBe(true);
  });

  // fetch it again to recheck

  // should return users exercise details properly
  it('should return detail properly for users exercise', async () => {
    const details = await service.getUserExerciseDetails(USER_UID, EXERCISE_ID);

    expect(details.isCompleted).toEqual(true);
    expect(details.pointsEarned).toEqual(10);
  });

  // Users completed exercises

  // should return users completed exercises properly
  it('should return uid of users completed exercises', async () => {
    const details = await service.getUsersCompletedExercises(
      USER_UID,
      EXERCISE_ID,
    );

    expect(details.length).toBeGreaterThanOrEqual(0);
  });

  // API route finder

  // should return correct API route for the language input
  it('should return correct API route for the language input', () => {
    expect(service.getCompilerUrlByLanguage('Python')).toEqual('compile_py');
    expect(service.getCompilerUrlByLanguage('C++')).toEqual('compile_cpp');

    // if not exists
    expect(service.getCompilerUrlByLanguage('C')).toEqual('');
  });
});
