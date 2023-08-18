import { HttpException } from '@nestjs/common';
import { createHttpError } from './utils.core';

describe('createHttpError', () => {
  it('should create an HttpException with the provided values', () => {
    const params = {
      message: 'Test Error Message',
      status: 404,
      hint: 'Test Hint',
      stacktrace: 'Test Stacktrace',
      stack: new Error('Test Error Stack'),
    };

    const httpException = createHttpError(params);

    expect(httpException).toBeInstanceOf(HttpException);
    expect(httpException.message).toEqual(params.message);
    expect(httpException.getStatus()).toEqual(params.status);

    const errorResponse = httpException.getResponse();
    expect(errorResponse).toEqual({
      data: null,
      message: params.message,
      hint: params.hint,
      stacktrace: params.stacktrace,
      status: params.status,
      stack: params.stack,
    });
  });
});
