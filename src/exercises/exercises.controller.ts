import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { TTrackInput } from './types/track_input.type.exercises';
import { ExercisesService } from './exercises.service';
import { errorMessages, responseMessages } from './../config/messages.config';
import { TResponse } from './../types/response.type';
import { TAllExercises } from './types/track_exercises.type.exercises';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUniversalErrorResponses } from './../config/errors.config';
import { TExerciseDetails } from './../types/exercise.type';

@Controller('exercises')
@ApiTags('Exercises')
export class ExercisesController {
  constructor(private readonly service: ExercisesService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch all available exercises in a track',
    description:
      'Fetches all the available exercises from a track w/ tracks `id`',
  })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched all exercises successfully!',
    schema: {
      example: {
        data: [
          {
            id: 'uuid',
            name: 'name',
            level: 0,
            maxPoints: 0,
          },
        ],
        message: responseMessages.fetched_exercises,
        status: HttpStatus.OK,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async getExercisesInTrack(
    @Query() query: TTrackInput,
  ): Promise<TResponse<TAllExercises[]>> {
    // throws 409 error if any db error occurs
    const exercises: TAllExercises[] =
      await this.service.getAllExercisesInTrack(query.id);

    return {
      data: exercises,
      message: responseMessages.fetched_exercises,
      status: 200,
    };
  }

  @Get('details')
  @ApiOperation({
    summary: 'Fetch details of exercise w/ id',
    description: 'Fetch all details of exercise w/ its id `id`',
  })
  // query -> UID
  @ApiQuery({ name: 'id', description: 'Id of exercise' })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched all details successfully!',
    schema: {
      example: {
        data: {
          id: 'uuid',
          name: 'name',
          maxPoints: 0,
          minPoints: 0,
          instructions: 'base64 string',
          baseCode: 'base64 string',
        },
        message: responseMessages.fetched_exercise_details,
        status: HttpStatus.OK,
      },
    },
  })
  // 404
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Exercise not found!',
    schema: {
      example: {
        data: null,
        message: errorMessages.exercise_not_found,
        status: HttpStatus.NOT_FOUND,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async getExerciseDetails(
    @Query() query: TExerciseDetails,
  ): Promise<TResponse<TExerciseDetails>> {
    // fetched exercise details by exercise id
    // throws 404 error if exercise not found
    // throws 409 error if any db error occurs
    const details: TExerciseDetails = await this.service.getExerciseDetails(
      query.id,
    );

    return {
      data: details,
      message: responseMessages.fetched_exercise_details,
      status: 200,
    };
  }
}
