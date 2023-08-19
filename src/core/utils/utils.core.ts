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

/**
 * Checks if array is empty
 *
 * @param {T[]} array to check for
 * @returns {true} if provided array is empty
 * @returns {false} if provided array is not empty
 */
export function isEmptyArray<T>(array: T[]): boolean {
  return array.length === 0;
}
