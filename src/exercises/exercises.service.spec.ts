import { Test, TestingModule } from '@nestjs/testing';
import { ExercisesService } from './exercises.service';
import { errorMessages } from './../config/messages.config';

describe('ExercisesService', () => {
  let service: ExercisesService;

  // Track ID for `Python` track
  const TRACK_ID = 'a13e9c3d-e7cf-477f-b862-0a1ee0e18d10';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExercisesService],
    }).compile();

    service = module.get<ExercisesService>(ExercisesService);
  });

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
});
