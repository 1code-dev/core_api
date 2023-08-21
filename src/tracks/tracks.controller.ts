import { Controller, Get, HttpStatus } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TAvailableTrack } from './../types/track';
import { TResponse } from './../types/response.type';
import { responseMessages } from './../config/messages.config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiUniversalErrorResponses } from './../config/errors.config';

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
    const tracks: TAvailableTrack[] =
      await this.service.fetchAllAvailableTracks();

    return {
      data: tracks,
      message: responseMessages.fetched_track,
      status: HttpStatus.OK,
    };
  }
}
