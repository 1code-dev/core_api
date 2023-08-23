import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { errorMessages } from './../config/messages.config';

describe('ExercisesService', () => {
  let service: ExercisesService;

  // Track ID for `Python` track
  const TRACK_ID = 'a13e9c3d-e7cf-477f-b862-0a1ee0e18d10';

  // Exercise ID of `Hello, World!` exercise in python track
  const EXERCISE_ID = '85b3f3ec-e5e8-4bd7-b035-0ab1990cd75c';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExercisesService],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
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

  // Should return compiler output clearly
  it('should return compiler output without any compiler error', async () => {
    const userCodeString = 'IApwcmludCgiSGVsbG8sIFdvcmxkISIpCg==';

    const exercise = await service.runExerciseTests(userCodeString, 'Python');

    // validate format of the response
    expect(exercise.output).not.toBeNull();
    expect(exercise.error).toBeNull();
  });

  // Should return compiler output w/ compiler error
  it('should return compiler error after running code', async () => {
    const userCodeString =
      'IAojIE1vZGlmeSB0aGUgcmV0dXJuIHZhbHVlIHRvIHBhc3MgdGhlIHRlc3QKZGVmIGhlbGxvKCk6CnJldHVybiAiSGVsbG8sIFdvcmxkISIKCiMgTk9URTogRG8gbm90IG1vZGlmeSBmdW5jdGlvbiBuYW1lLCBpZiB5b3UgZG8sIHRlc3RzIHdpbGwgbm90IHBhc3MhCgo=';

    const exercise = await service.runExerciseTests(userCodeString, 'Python');

    // validate format of the response
    expect(exercise.output).toBeNull();
    expect(exercise.error).not.toBeNull();
  });
});
