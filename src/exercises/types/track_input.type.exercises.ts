import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { errorMessages } from '../../config/messages.config';

/**
 * @type Type for getExercisesInTrack req's body input w/ validations
 *
 * @throws 400 `BadRequestException` if any of validation fails
 */
export class TTrackInput {
  @IsString()
  // Validate a UUID v-4 uid
  @IsUUID(4, {
    message: errorMessages.uuid_not_valid,
  })
  @ApiProperty({
    name: 'id',
    title: 'Tracks ID',
    description: 'ID of the track',
    type: String,
  })
  id: string;
}
