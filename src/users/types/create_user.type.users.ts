import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { errorMessages } from '../../config/messages.config';

/**
 * @type Type for CreateUser req's body input w/ validations
 * @type Type for FetchUser req's query input w/ validations
 *
 * @throws 400 `BadRequestException` if any of validation fails
 */
export class TUserInput {
  @IsString()
  // Validate a UUID v-4 uid
  @IsUUID(4, {
    message: errorMessages.uuid_not_valid,
  })
  @ApiProperty({
    name: 'uid',
    title: 'Users UID',
    description: 'UID for user obtained from 1Auth',
    type: String,
  })
  uid: string; // users UID obtained from `1Auth`
}
