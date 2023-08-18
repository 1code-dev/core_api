import { HttpException } from '@nestjs/common';

/**
 * @interface
 *
 * Interface to hold all the available params used while creating
 * an HttpException using `createHttpError` function
 */
interface IHttpErrorParams {
  message: string;
  status: number;
  hint?: string;
  stacktrace?: string;
  stack?: Error;
}

/**
 * Creates a new HttpException w/ provided values
 *
 * @param {IHttpErrorParams}
 * @returns {HttpException} exception to be thrown
 */
export function createHttpError({
  message,
  status,
  hint,
  stacktrace,
  stack,
}: IHttpErrorParams): HttpException {
  return new HttpException(
    {
      data: null,
      message: message,
      hint: hint,
      stacktrace: stacktrace,
      status: status,
      stack: stack,
    },
    status,
  );
}
