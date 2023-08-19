import { Body, Controller, HttpStatus, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { TCreateUser } from './types/create_user.type.users';
import { TResponse } from './../types/response.type';
import { TUserProfile } from './../types/user';
import { errorMessages, responseMessages } from './../config/messages.config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUniversalErrorResponses } from './../config/errors.config';

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
  @ApiBody({ type: TCreateUser })
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
  async createUser(
    @Body() body: TCreateUser,
  ): Promise<TResponse<TUserProfile>> {
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
}
