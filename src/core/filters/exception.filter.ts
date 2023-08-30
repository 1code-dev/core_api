import { ArgumentsHost, Catch, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { keys } from '../../config/keys.config';
import { errorMessages } from '../../config/messages.config';

@Catch(HttpException)
export class ExceptionFilter implements ExceptionFilter {
  private get isDevMode(): boolean {
    return keys.env === 'dev';
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();

    let statusCode = exception.getStatus();
    let resMessage = errorMessages.internal_server_error;

    // Set `statuscode` according to error
    if (exception['message'] === 'Not Found') {
      statusCode = 404;
    } else if (exception['status']) {
      statusCode = exception['status'];
    }

    // Set `resMessage` according to the error
    if (Array.isArray(exception['response']?.message)) {
      resMessage = exception['response'].message[0];
    } else if (exception['response']?.message) {
      resMessage = exception['response'].message;
    } else if (exception['message']) {
      resMessage = exception['message'];
    }

    const errorResponse = {
      data: null,
      message: resMessage,
      status: statusCode,
    };

    if (this.isDevMode) {
      errorResponse['hint'] =
        exception['response']?.hint || 'Internal Server Error';

      errorResponse['stacktrace'] =
        exception['response'].stacktrace || 'No stacktrace available';

      errorResponse['stack'] = exception['response'].stack;
    }

    res.status(statusCode).json(errorResponse);
  }
}
