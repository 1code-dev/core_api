import { TUserProfile } from './../types/user';
import { UsersService } from './users.service';
import { TResponse } from './../types/response.type';
import { TUserInput } from './types/create_user.type.users';
import { ApiUniversalErrorResponses } from './../config/errors.config';
import { errorMessages, responseMessages } from './../config/messages.config';

import {
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Creates a User profile on 1Auth',
    description:
      'Creates a user profile and assigns ranks to users, required `uid` of users obtained from `1Auth`',
  })
  // body -> {TUserInput}
  @ApiBody({ type: TUserInput })
  // 201
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User profile created successfully',
    schema: {
      example: {
        data: {
          longestStreak: 0,
          streak: 0,
          totalPoints: 0,
          globalRank: 0,
          weeklyRank: 0,
        },
        message: responseMessages.created_user,
        status: HttpStatus.CREATED,
      },
    },
  })
  // 422
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'User profile already exists!',
    schema: {
      example: {
        data: null,
        message: errorMessages.user_already_created,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async createUser(@Body() body: TUserInput): Promise<TResponse<TUserProfile>> {
    // throws 409 if db error occurs
    // ⚠️ WARNING: `createUser` may return null if db error has occurred
    const userData = await this.service.createUserProfile(body.uid);

    // throws 409 if db error occurs
    const userCount = await this.service.countUserEntries();

    // throws 409 if db error occurs
    // throws 422 if entry already exists
    await this.service.createUserRanks(userData?.uid ?? body.uid, userCount);

    const userProfile: TUserProfile = {
      longestStreak: 0,
      streak: 0,
      totalPoints: 0,
      globalRank: userCount,
      weeklyRank: userCount,
    };

    return {
      data: userProfile,
      message: responseMessages.created_user,
      status: HttpStatus.CREATED,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Fetches users profile associated w/ UID',
    description:
      'Fetches users profile associated w/ `UID` and if `404` error is obtained, please create user profile by `/users (POST)`',
  })
  // query -> UID
  @ApiQuery({ name: 'uid', description: 'UID associated with users profile' })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile fetched successfully',
    schema: {
      example: {
        data: {
          longestStreak: 0,
          streak: 0,
          totalPoints: 0,
          globalRank: 0,
          weeklyRank: 0,
        },
        message: responseMessages.fetched_user,
        status: HttpStatus.OK,
      },
    },
  })
  // 404
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User profile not found! Please create it',
    schema: {
      example: {
        data: null,
        message: errorMessages.user_profile_not_found,
        status: HttpStatus.NOT_FOUND,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async fetchUserProfile(
    @Query() query: TUserInput,
  ): Promise<TResponse<TUserProfile>> {
    // throws 409 if db error has occurred
    // throws 404 if profile not found
    const userRanks = await this.service.fetchUserRanks(query.uid);

    // throws 409 exception if any db error occurs
    // response is cached for 5 minutes
    const userTotalPoints = await this.service.calculateUsersTotalPoints(
      query.uid,
    );

    // throws 409 exception if any db error occurs
    // response is cached for 1 day
    const userStreaks = await this.service.calculateUserStreaks(query.uid);

    // Object to structure user profile data
    const userProfile: TUserProfile = {
      longestStreak: userStreaks.longestStreak,
      streak: userStreaks.currentStreak,
      totalPoints: userTotalPoints,
      globalRank: userRanks.globalRank,
      weeklyRank: userRanks.weeklyRank,
    };

    return {
      data: userProfile,
      message: responseMessages.fetched_user,
      status: HttpStatus.OK,
    };
  }

  @Delete()
  @ApiOperation({
    summary: 'Deletes users profile associated w/ UID',
    description: 'Deletes users profile associated w/ `UID`',
  })
  // query -> UID
  @ApiQuery({ name: 'uid', description: 'UID associated with users profile' })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User profile deleted successfully',
    schema: {
      example: {
        data: true,
        message: responseMessages.deleted_user,
        status: HttpStatus.OK,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async deleteUserProfile(
    @Query() query: TUserInput,
  ): Promise<TResponse<boolean>> {
    // throws 409 if db error has occurred
    await this.service.deleteUserProfile(query.uid);

    return {
      data: true, // indicates user is deleted successfully
      message: responseMessages.deleted_user,
      status: HttpStatus.OK,
    };
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Fetches users stats',
    description:
      'Fetch user stats such as `total problem solved` and `joined_at`',
  })
  // query -> UID
  @ApiQuery({ name: 'uid', description: 'UID associated with users profile' })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User stats fetched successfully',
    schema: {
      example: {
        data: {
          exercisesSolved: 0,
          createdAt: '2023-08-21T06:12:18+00:00',
        },
        message: 'Fetched user stats successfully!',
        status: 200,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async fetchUserStats(
    @Query() query: TUserInput,
  ): Promise<TResponse<{ exercisesSolved: number; createdAt: string }>> {
    // throws 409 if db error has occurred
    // response is cached for 5 minutes
    const totalExercisesSolved =
      await this.service.calculateUserTotalExercisesSolved(query.uid);

    // throws 409 if db error has occurred
    // response is cached for 5 minutes
    const createdAt = await this.service.fetchUserProfileCreationDate(
      query.uid,
    );

    return {
      data: {
        exercisesSolved: totalExercisesSolved,
        createdAt,
      },
      message: responseMessages.fetched_stats,
      status: HttpStatus.OK,
    };
  }

  @Get('activity')
  @ApiOperation({
    summary: 'Fetches users activity',
    description:
      'Fetch users current months activity w/ `activity_time` and `programming_language`',
  })
  // query -> UID
  @ApiQuery({ name: 'uid', description: 'UID associated with users profile' })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User activity fetched successfully!',
    schema: {
      example: {
        data: [
          {
            created_at: '2023-08-22T05:26:07+00:00',
            language: 'Python',
          },
        ],
        message: responseMessages.fetched_activity,
        status: 200,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async fetchUserActivity(@Query() query: TUserInput): Promise<
    TResponse<
      {
        created_at: string;
        language: string;
      }[]
    >
  > {
    // throws 409 if db error has occurred
    // response is cached for 10 Hrs
    const usersActivity = await this.service.fetchUserActivity(query.uid);

    return {
      data: usersActivity,
      message: responseMessages.fetched_activity,
      status: HttpStatus.OK,
    };
  }
}
