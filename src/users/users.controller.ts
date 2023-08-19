import { UsersService } from './users.service';
import { TUserInput } from './types/create_user.type.users';
import { TResponse } from './../types/response.type';
import { TUserProfile } from './../types/user';
import { errorMessages, responseMessages } from './../config/messages.config';
import { ApiUniversalErrorResponses } from './../config/errors.config';

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
    const userData = await this.service.createUser(body.uid);

    // throws 409 if db error occurs
    const userCount = await this.service.countUserEntries();

    // throws 409 if db error occurs
    // throws 422 if entry already exists
    await this.service.createUserRanks(userData?.uid ?? body.uid, userCount);

    const userProfile: TUserProfile = {
      longestStreak: userData?.longestStreak ?? 0,
      streak: userData?.streak ?? 0,
      totalPoints: userData?.totalPoints ?? 0,
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
    const userProfile: TUserProfile = await this.service.getUserProfile(
      query.uid,
    );

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
}
