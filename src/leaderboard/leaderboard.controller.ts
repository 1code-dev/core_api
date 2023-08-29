import { Controller, Get, HttpStatus } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { TResponse } from './../types/response.type';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUniversalErrorResponses } from './../config/errors.config';

@Controller('leaderboard')
@ApiTags('Leaderboard')
export class LeaderboardController {
  constructor(private readonly service: LeaderboardService) {}

  @Get('global')
  @ApiOperation({
    summary: 'Fetch top 20 users in global leaderboard',
  })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Global leaderboard fetched successfully',
    schema: {
      example: {
        data: [
          {
            profilePic: 'link',
            uid: 'uid',
            userName: 'name',
            rank: 0,
            totalPoints: 0,
          },
        ],
        message: '',
        status: HttpStatus.OK,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async fetchGlobalLeaderboard(): Promise<TResponse<any>> {
    const data = await this.service.fetchTop20GlobalLeaderboard();

    return {
      data,
      message: 'Fetched global leaderboard!',
      status: 200,
    };
  }

  @Get('weekly')
  @ApiOperation({
    summary: 'Fetch top 20 users in weekly leaderboard',
  })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Global leaderboard weekly successfully',
    schema: {
      example: {
        data: [
          {
            profilePic: 'link',
            uid: 'uid',
            userName: 'name',
            rank: 0,
            totalPoints: 0,
          },
        ],
        message: '',
        status: HttpStatus.OK,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async fetchWeeklyLeaderboard(): Promise<TResponse<any>> {
    const data = await this.service.fetchTop20WeeklyLeaderBoard();

    return {
      data,
      message: 'Fetched weekly leaderboard!',
      status: 200,
    };
  }
}
