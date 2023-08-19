import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiInternalServerErrorResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';

import { HttpStatus, applyDecorators } from '@nestjs/common';
import { errorMessages } from './messages.config';

/**
 * Custom decorator for common error responses
 */
export function ApiUniversalErrorResponses() {
  return applyDecorators(
    // 400
    ApiBadRequestResponse({
      status: HttpStatus.BAD_REQUEST,
      description:
        'Returns a response indicating some validation has failed, e.g `email` is not a _valid email_',
      schema: {
        example: {
          data: null,
          message:
            'Some Message indicating some validation has failed, e.g `uid` is not a valid UUID',
          status: HttpStatus.BAD_REQUEST,
        },
      },
    }),
    // 401
    ApiUnauthorizedResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Returns a response indicating client is not verified',
      schema: {
        example: {
          data: null,
          message: errorMessages.client_not_verified,
          status: HttpStatus.UNAUTHORIZED,
        },
      },
    }),
    // 500
    ApiInternalServerErrorResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description:
        'Returns a response indicating internal server error has occurred',
      schema: {
        example: {
          data: null,
          message: errorMessages.internal_server_error,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
        },
      },
    }),
    // 409
    ApiConflictResponse({
      status: HttpStatus.CONFLICT,
      description: 'Returns a response indicating db error has occurred',
      schema: {
        example: {
          data: null,
          message: errorMessages.db_error,
          status: HttpStatus.CONFLICT,
        },
      },
    }),
  );
}
