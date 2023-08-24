import { HttpException } from '@nestjs/common';
import { errorMessages } from './../../config/messages.config';

import {
  createHttpError,
  decodeBase64String,
  encodeStringBase64,
  isEmptyArray,
  parseTestResults,
} from './utils.core';

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

describe('isEmptyArray', () => {
  it('should return true for an empty array', () => {
    const emptyArray: number[] = [];
    const result = isEmptyArray(emptyArray);
    expect(result).toBe(true);
  });

  it('should return false for a non-empty array', () => {
    const nonEmptyArray = [1, 2, 3];
    const result = isEmptyArray(nonEmptyArray);
    expect(result).toBe(false);
  });
});

describe('parseTestResults', () => {
  it('should extract correct info from test response', () => {
    const testResultString = `Passed:10:TestCase1\nFailed:TestCase2:Number do not exists!\nHint:Please check your logic correctly\nFailed:TestCase3:Please handle empty list correctly!\nHint:When numbers is an empty list the output should be 'False'`;

    const result = parseTestResults(testResultString);

    expect(result.failedCount).toEqual(2);
    expect(result.passedCount).toEqual(1);
    expect(result.totalPoints).toEqual(10);
  });

  it('should return placeholders if input test result is not valid', () => {
    const result = parseTestResults('');

    expect(result.failedCount).toEqual(0);
    expect(result.passedCount).toEqual(0);
    expect(result.totalPoints).toEqual(0);
  });
});

describe('encodeBase64String', () => {
  it('should return a valid base64 string', () => {
    const result = encodeStringBase64('1Code 💛!');

    expect(result).toEqual('MUNvZGUg8J+SmyE=');
  });
});

describe('decodeBase64String', () => {
  it('should return a valid string after decoding from base64', () => {
    const result = decodeBase64String('MUNvZGUg8J+SmyE=');

    expect(result).toEqual('1Code 💛!');
  });

  it('should return a 400 error if base64 string is invalid', () => {
    try {
      decodeBase64String('1Code 💛!');
    } catch (error) {
      expect(error.getStatus()).toBe(400);
      expect(error.getResponse()).toMatchObject({
        data: null,
        message: errorMessages.invalid_base_64,
        status: 400,
      });
    }
  });
});
