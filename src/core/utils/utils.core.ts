import { HttpException, HttpStatus } from '@nestjs/common';
import { errorMessages } from './../../config/messages.config';

// ----------------------------------------- Local Types -------------------------------------------------

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
 * @interface
 *
 * Interface to hold formatted output of result produced by running tests
 * Used by `runTest` functionality
 */
interface ITestResults {
  totalTestCases: number;
  passedCount: number;
  failedCount: number;
  totalPoints: number;
  failedTestsWithHints: {
    testName: string;
    hint: string | null;
  }[];
}

// ------------------------------------------- Functions --------------------------------------------------------

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

/**
 * Parses the test result string and extracts relevant information.
 *
 * @param testResultString - The input string containing test results.
 * @returns {ITestResults} An object containing parsed information.
 */
export function parseTestResults(testResultString: string): ITestResults {
  // Split the input string by newline characters to get individual lines
  const lines = testResultString.split('\n');

  let passedCount = 0;
  let failedCount = 0;
  let totalPoints = 0;

  const failedTestsWithHints: { testName: string; hint: string | null }[] = [];

  // Loop through each line
  for (const line of lines) {
    // Check if the line starts with "Passed:" to identify a passed test case
    if (line.startsWith('Passed:')) {
      passedCount++;
      // Extract the points from the line (after "Passed:") and add it to totalPoints
      const pointsMatch = line.match(/Passed:(\d+)/);
      if (pointsMatch) {
        totalPoints += parseInt(pointsMatch[1], 10);
      }
    } else if (line.startsWith('Failed:')) {
      const failedParts = line.split(':');
      const testName = failedParts[1];
      const hint = failedParts.slice(2).join(':') || null;
      failedTestsWithHints.push({ testName, hint });
      failedCount++;
    }
  }

  // Calculate total test cases count by adding passed and failed counts
  const totalTestCases = passedCount + failedCount;

  return {
    totalTestCases,
    passedCount,
    failedCount,
    totalPoints,
    failedTestsWithHints,
  };
}

/**
 * Encodes string with base64
 *
 * @param {string} text to encode
 * @returns {string} encoded string in `base64`
 */
export function encodeStringBase64(text: string): string {
  return Buffer.from(text).toString('base64');
}

/**
 * Decodes a base64 string
 *
 * @param {string} encoded String
 * @returns {string} decoded string from `base64`
 *
 * @throws 400 error if invalid input is passed
 */
export function decodeBase64String(encoded: string): string {
  try {
    return Buffer.from(encoded, 'base64').toString();
  } catch (error) {
    throw createHttpError({
      message: errorMessages.invalid_base_64,
      status: HttpStatus.BAD_REQUEST,
      stacktrace: error,
    });
  }
}

/**
 * Check if two dates are consecutive days.
 * @param {Date} date1 - The first date.
 * @param {Date} date2 - The second date.
 * @returns {boolean} - True if dates are consecutive, false otherwise.
 */
export function areDatesConsecutive(date1: Date, date2: Date): boolean {
  const oneDay: number = 24 * 60 * 60 * 1000; // One day in milliseconds

  // Get the year, month, and day parts of the dates
  const year1 = date1.getFullYear();
  const month1 = date1.getMonth();
  const day1 = date1.getDate();

  const year2 = date2.getFullYear();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  // Calculate the difference between the dates
  const diffDays: number = Math.round(
    Math.abs(
      (Date.UTC(year1, month1, day1) - Date.UTC(year2, month2, day2)) / oneDay,
    ),
  );

  return diffDays === 1;
}
