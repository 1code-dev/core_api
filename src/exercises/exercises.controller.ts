import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { TTrackInput } from './types/track_input.exercises';
import { ExercisesService } from './exercises.service';
import { responseMessages } from './../config/messages.config';
import { TResponse } from 'src/types/response.type';
import { TAllExercises } from './types/track_exercises.type.exercises';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUniversalErrorResponses } from './../config/errors.config';

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
    //   throws 409 error if any db error occurs
    const exercises: TAllExercises[] =
      await this.service.getAllExercisesInTrack(query.id);

    return {
      data: exercises,
      message: responseMessages.fetched_exercises,
      status: 200,
    };
  }
}
