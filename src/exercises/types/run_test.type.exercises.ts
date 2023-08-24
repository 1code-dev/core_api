import { ApiProperty } from '@nestjs/swagger';
import { IsBase64, IsString, IsUUID } from 'class-validator';
import { errorMessages } from '../../config/messages.config';

/**
 * @type Type for runTest input body
 *
 * @throws 400 `BadRequestException` if any of validation fails
 */
export class TRunExerciseInput {
  @IsString()
  // Validate a UUID v-4 uid
  @IsUUID(4, {
    message: errorMessages.uuid_not_valid,
  })
  @ApiProperty({
    name: 'exerciseId',
    title: 'Exercises id',
    description: 'ID of exercise',
    type: String,
  })
  exerciseId: string;

  @IsString()
  @IsBase64()
  @ApiProperty({
    name: 'userCode',
    title: 'User Code',
    description: 'Users written code in base64 format',
    type: String,
  })
  userCode: string; // in base64 format

  @IsString()
  // Validate a UUID v-4 uid
  @IsUUID(4, {
    message: errorMessages.uuid_not_valid,
  })
  @ApiProperty({
    name: 'userUid',
    title: 'Users UUID',
    description: 'ID associated w/ users profile',
    type: String,
  })
  userUid: string;
}

/**
 * @type Type for runTest output
 */
export class TRunExerciseOutput {
  failedCount: number;
  passedCount: number;
  points: number;
  failedTests: {};
  error: string;
  isCompleted: boolean;
}
