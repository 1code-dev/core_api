import { TTrackInput } from './types/track_input.type.exercises';
import { ExercisesService } from './exercises.service';
import { errorMessages, responseMessages } from './../config/messages.config';
import { TResponse } from './../types/response.type';
import { TAllExercises } from './types/track_exercises.type.exercises';
import { ApiUniversalErrorResponses } from './../config/errors.config';
import { TExerciseDetails } from './../types/exercise.type';
import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';

import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  TRunExerciseInput,
  TRunExerciseOutput,
} from './types/run_test.type.exercises';

import {
  decodeBase64String,
  encodeStringBase64,
  parseTestResults,
} from './../core/utils/utils.core';

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

  @Post('test')
  @ApiBody({ type: TRunExerciseInput })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test executed successfully!',
    schema: {
      example: {
        data: {
          failedCount: 1,
          passedCount: 0,
          failedTests: [
            {
              testName: 'TestCase1',
              hint: 'Wrong value received!',
            },
          ],
          error: 'null',
          points: 0,
          isCompleted: false,
        },
        message: responseMessages.test_executed_successfully,
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
  async runTest(
    @Body() body: TRunExerciseInput,
  ): Promise<TResponse<TRunExerciseOutput>> {
    // fetch details of the exercise in which user has submitted the code
    // throes 404 if exercise does not exists
    // throws 409 if db error occurs
    const details = await this.service.getExerciseTestDetails(body.exerciseId);

    // decoding the base64 string to normal one
    // if input base64 string is not valid 400 (BadRequest) exception is thrown

    const userCodeDecoded = decodeBase64String(body.userCode);
    const testDecoded = decodeBase64String('\n\n' + details.tests); // /n are added to separate tests from users code

    // encode users code and required tests into base64 for compiler API input
    const encodedCodeToBeCompiled = encodeStringBase64(
      userCodeDecoded + testDecoded,
    );

    // run tests with user code and exercises tests
    // throws 400 if input validation is failed
    // throws 500 if any other error occurs
    const testResult = await this.service.runExerciseTests(
      encodedCodeToBeCompiled,
      details.language,
    );

    // if any compiled error has occurred just return the compiled error
    // 😁 Early return to save points checking and points assigning
    if (testResult.error) {
      return {
        data: {
          failedCount: 0,
          passedCount: 0,
          failedTests: null,
          error: testResult.error,
          points: 0,
          isCompleted: false,
        },
        message: responseMessages.test_executed_successfully,
        status: HttpStatus.OK,
      };
    }

    // extract info from tests results
    const testsInfo = parseTestResults(testResult.output);

    // getUserExercise status
    // may return null if entry is not present

    const userExerciseEntryDetails = await this.service.getUserExerciseDetails(
      body.userUid,
      body.exerciseId,
    );

    if (userExerciseEntryDetails && userExerciseEntryDetails.isCompleted) {
      return {
        data: {
          failedCount: testsInfo.failedCount,
          passedCount: testsInfo.passedCount,
          failedTests: testsInfo.failedTestsWithHints,
          points: userExerciseEntryDetails.pointsEarned,
          isCompleted: userExerciseEntryDetails.isCompleted,
          error: testResult.error,
        },
        message: responseMessages.exercise_already_completed,
        status: HttpStatus.OK,
      };
    }

    // 👉 NOTE: if any error has occurred or exercise has already been completed do not create a user activity

    // create a user activity w/ language for activity records
    // throws 409 if any db error occurs
    await this.service.createUserActivity(
      body.userUid,
      body.exerciseId,
      details.language,
    );

    const pointsEarned: number =
      testsInfo.totalPoints >= details.maxPoints
        ? details.maxPoints
        : testsInfo.totalPoints;

    const isCompleted: boolean = testsInfo.totalPoints >= details.maxPoints;

    // if already exists then update otherwise create record
    if (userExerciseEntryDetails) {
      await this.service.updateUserExerciseRecord(
        body.exerciseId,
        body.userUid,
        body.userCode,
        isCompleted,
        pointsEarned,
      );
    } else {
      await this.service.createUserExerciseRecord(
        body.exerciseId,
        body.userUid,
        body.userCode,
        isCompleted,
        pointsEarned,
      );
    }

    return {
      data: {
        failedCount: testsInfo.failedCount,
        passedCount: testsInfo.passedCount,
        failedTests: testsInfo.failedTestsWithHints,
        error: testResult.error,
        points: pointsEarned,
        isCompleted: isCompleted,
      },
      message: responseMessages.test_executed_successfully,
      status: HttpStatus.OK,
    };
  }
}
