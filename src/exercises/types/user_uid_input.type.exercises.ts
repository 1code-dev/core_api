import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { errorMessages } from '../../config/messages.config';

/**
 * @type Type to structure user input for users uid
 *
 * @throws 400 `BadRequestException` if any of validation fails
 */
export class TUserUidInput {
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

  @IsString()
  // Validate a UUID v-4 uid
  @IsUUID(4, {
    message: errorMessages.uuid_not_valid,
  })
  @ApiProperty({
    name: 'trackId',
    title: 'Tracks ID',
    description: 'Tracks id',
    type: String,
  })
  trackId: string;
}
