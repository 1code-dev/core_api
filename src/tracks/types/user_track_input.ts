import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { errorMessages } from '../../config/messages.config';

/**
 * @type Type to structure user input for fetching users track with progress
 *
 * @throws 400 `BadRequestException` if any of validation fails
 */
export class TUserTrackFetchingInput {
  @IsString()
  // Validate a UUID v-4 uid
  @IsUUID(4, {
    message: errorMessages.uuid_not_valid,
  })
  @ApiProperty({
    name: 'uuid',
    title: 'Users UID',
    description: 'UID associated with users profile',
    type: String,
  })
  uuid: string;
}
