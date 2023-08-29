import { TracksService } from './tracks.service';
import { TAvailableTrack } from './../types/track';
import { TResponse } from './../types/response.type';
import { TJoinTrackInput } from './types/join_track.type.tracks';
import { TUserTrackFetchingInput } from './types/user_track_input';
import { ApiUniversalErrorResponses } from './../config/errors.config';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { errorMessages, responseMessages } from './../config/messages.config';
import { Body, Controller, Get, HttpStatus, Post, Query } from '@nestjs/common';

@Controller('tracks')
@ApiTags('Tracks')
export class TracksController {
  constructor(private readonly service: TracksService) {}

  @Get()
  @ApiOperation({
    summary: 'Fetch all tracks',
    description:
      'Fetches all the available tracks in 1Code. _👉 NOTE_: To avoid ambiguity fetched track limit is set to `10`',
  })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched all tracks successfully!',
    schema: {
      example: {
        data: [
          {
            id: 'a13e9c3d-e7cf-477f-b862-0a1ee0e18d10',
            name: 'Python',
            tags: ['Imperative', 'Object Oriented ', 'Functional'],
            logo: 'https://zjngbjykvofvztzjjhye.supabase.co/storage/v1/object/public/assets/track_logo/python_track_logo.svg',
            noOfExercises: 5,
          },
        ],
        message: responseMessages.fetched_track,
        status: HttpStatus.OK,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async getAllTracks(): Promise<TResponse<Array<TAvailableTrack>>> {
    // throws 409 if any db error occurs
    const availableTracks = await this.service.fetchAllAvailableTracks();

    const tracks: TAvailableTrack[] = [];

    for (let i = 0; i < availableTracks.length; i++) {
      // calculate total exercises
      // throws 409 if any db error occurs
      const totalExercises = await this.service.calculateTotalExercisesInTrack(
        availableTracks[i].id,
      );

      tracks.push({
        id: availableTracks[i].id,
        name: availableTracks[i].name,
        tags: availableTracks[i].tags,
        logo: availableTracks[i].logo,
        noOfExercises: totalExercises,
      });
    }

    return {
      data: tracks,
      message: responseMessages.fetched_track,
      status: HttpStatus.OK,
    };
  }

  @Post('join')
  @ApiOperation({
    summary: 'Join a track for User',
    description:
      'Join a track for a particular user w/ users `uid` and tracks `id`',
  })
  @ApiBody({ type: TJoinTrackInput })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Joined track successfully!',
    schema: {
      example: {
        data: true,
        message: responseMessages.joined_track,
        status: HttpStatus.OK,
      },
    },
  })
  // 422
  @ApiResponse({
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: 'User has already joined the track!',
    schema: {
      example: {
        data: null,
        message: errorMessages.track_already_joined,
        status: HttpStatus.UNPROCESSABLE_ENTITY,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async joinTrackForUser(
    @Body() body: TJoinTrackInput,
  ): Promise<TResponse<Boolean>> {
    // join track for user with uid and track id
    // throws 409 error if any db error occurs
    // throws 422 if user has already joined the track
    const isJoined = await this.service.joinTrackForUser(
      body.uid,
      body.trackId,
    );

    return {
      data: isJoined, // indicates user has joined the track
      message: responseMessages.joined_track,
      status: 201,
    };
  }

  @Get('joined')
  @ApiOperation({
    summary: 'Fetch user joined tracks with progress',
    description: 'Fetch users joined tracks w/ `progress`',
  })
  // 200
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched data successfully!',
    schema: {
      example: {
        data: {
          data: [
            {
              name: 'Python',
              logo: 'logo',
              progress: 1.2,
            },
          ],
        },
        message: '',
        status: 200,
      },
    },
  })
  // 500, 400, 401, 409
  @ApiUniversalErrorResponses()
  async getJoinedTracks(@Query() query: TUserTrackFetchingInput) {
    const userTracks = await this.service.fetchUsersJoinedTracks(query.uuid);

    const data = [];

    for (let i = 0; i < userTracks.length; i++) {
      // calculate total exercises
      // throws 409 if any db error occurs
      const totalExercises = await this.service.calculateTotalExercisesInTrack(
        userTracks[i].trackId,
      );

      // calculate users completed progress
      // throws 409 if any db error has occurred
      const progress = await this.service.calculateUsersTrackProgress(
        query.uuid,
        userTracks[i].trackId,
        totalExercises,
      );

      data.push({ ...userTracks[i].Tracks, progress });
    }

    return {
      data,
      message: '',
      status: 200,
    };
  }
}
